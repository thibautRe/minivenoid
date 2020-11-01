// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { useSpring } from "react-spring/three"
import { useGesture } from "react-use-gesture"

import { ViewProvider } from "./three/view"
import { Cards } from "./three/card"
import { Connections } from "./three/connections"
import { Camera } from "./three/camera"
import {
  getCanvasPosition,
  getPixelDensityForZoom,
  positionToGrid,
} from "./utils"

import "./index.css"

const urlParams = new URLSearchParams(window.location.search)
const amt = parseInt(urlParams.get("amt")) || 500
const MAX_CARDS = amt
const MAX_CONNECTIONS = amt / 2

const generateModel = (amt = MAX_CARDS, amtConn = MAX_CONNECTIONS) => {
  const cards = new Array(amt).fill(undefined).map((_, i) => ({
    position: positionToGrid([
      (0.5 - Math.random()) * Math.sqrt(amt) * 500,
      (0.5 - Math.random()) * Math.sqrt(amt) * 400,
      i * 1e-10,
    ]),
    height: (0.5 + Math.random()) * 200,
    width: 120,
    id: Math.random().toString(),
  }))

  const connections = new Array(amtConn).fill(0).map(() => {
    const ranId = Math.max(0, Math.floor(Math.random() * cards.length - 1))
    return {
      id: Math.random().toString(),
      from: cards[ranId].id,
      to: cards[ranId + 1].id,
    }
  })

  return { cards, connections }
}

const App = () => {
  const domTarget = React.useRef(null)
  const [model, setModel] = React.useState(() => generateModel())

  const [{ zoom }, setZoom] = useSpring(() => ({
    from: { zoom: 0 },
    to: { zoom: -Math.log(Math.sqrt(model.cards.length)) },
  }))
  const [{ position }, setPosition] = useSpring(() => ({ position: [0, 0] }))

  useGesture(
    {
      onWheel: ({ event, movement, memo, active }) => {
        if (!event) return

        /** @see https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode */
        const deltaModeMultiplier = event.deltaMode === 0x00 ? 1 : 20

        // Initialize the memo
        if (!memo) {
          memo = position.getValue()
        }

        const pixelDensity = getPixelDensityForZoom(zoom.getValue())

        setPosition({
          position: movement.map(
            (m, i) => (m / pixelDensity) * deltaModeMultiplier + memo[i],
          ),
          immediate: active,
        })

        return memo
      },
      onPinch: ({ event, origin, da: [d], memo }) => {
        event.preventDefault()
        // sensitivity fix
        const delta = d / 50
        if (!memo) {
          memo = delta
        }
        const z = zoom.getValue() + delta - memo
        setZoom({ zoom: z })

        // // Scroll towards where the mouse is located
        // const { width, height } = domTarget.current.getBoundingClientRect()
        // const newPosition = [
        //   memo.pos[0] + (delta - memo.delta) * (origin[0] - width / 2),
        //   memo.pos[1] + (delta - memo.delta) * (origin[1] - height / 2),
        // ]
        // console.log(newPosition)
        // setPosition({ position: newPosition })

        return memo
      },
      onDrag: ({ buttons, active, movement, direction, velocity, memo }) => {
        // only allow the wheel to drag the canvas
        /** @see https://developer.mozilla.org/fr/docs/Web/API/MouseEvent/buttons */
        if (buttons !== 4) {
          return
        }

        // Initialize the memo
        if (!memo) {
          memo = position.getValue()
        }

        const pixelDensity = getPixelDensityForZoom(zoom.getValue())

        setPosition({
          position: movement.map((m, i) => m * pixelDensity + memo[i]),
          immediate: active,
          config: {
            velocity: direction.map(d => d * velocity),
          },
        })
        return memo
      },
      onDblClick: ({ event: { clientX, clientY } }) => {
        const { width, height } = domTarget.current.getBoundingClientRect()
        const [cx, cy] = getCanvasPosition(
          position.getValue(),
          zoom.getValue(),
          [clientX, clientY],
          [width, height],
        )
        setModel(model => ({
          ...model,
          cards: [
            ...model.cards,
            {
              id: Math.random().toString(),
              height: 200,
              width: 120,
              position: [cx-60, cy-100, model.cards.length * 1e-10],
            },
          ],
        }))
      },
    },
    { domTarget, eventOptions: { passive: false } },
  )

  const setCard = React.useCallback((id, action) => {
    setModel(model => {
      const cardIndex = model.cards.findIndex(c => c.id === id)
      return {
        ...model,
        cards: [
          ...model.cards.slice(0, cardIndex),
          action(model.cards[cardIndex]),
          ...model.cards.slice(cardIndex + 1),
        ],
      }
    })
  }, [])

  const onMoveCard = React.useCallback(
    ({ id, position }) => {
      setCard(id, card => ({ ...card, position }))
    },
    [setCard],
  )

  return (
    <div ref={domTarget}>
      <Canvas>
        <ViewProvider zoom={zoom} position={position}>
          <Camera />
          <Connections cards={model.cards} connections={model.connections} />
          <Cards cards={model.cards} onMoveCard={onMoveCard} />
        </ViewProvider>
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
