// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { config, useSpring, useSprings } from "react-spring/three"
import { useGesture } from "react-use-gesture"

import { ViewProvider } from "./three/view"
import { Cards } from "./three/card"
import { Connections } from "./three/connections"
import { Camera } from "./three/camera"
import { getPixelDensityForZoom } from "./utils"

import "./index.css"

const urlParams = new URLSearchParams(window.location.search)

const MAX_CARDS = parseInt(urlParams.get("amt")) || 500
const MAX_CONNECTIONS = 200

const generateModel = (amt = MAX_CARDS, amtConn = MAX_CONNECTIONS) => {
  const cards = new Array(amt).fill(undefined).map((_, i) => ({
    position: [
      (0.5 - Math.random()) * Math.sqrt(amt) * 500,
      (0.5 - Math.random()) * Math.sqrt(amt) * 400,
      i * 1e-10,
    ],
    height: (0.5 + Math.random()) * 200,
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
        const deltaModeMultiplier = event.deltaMode === 0x00 ? 1 : 50

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
      onPinch: ({ event, da: [d] }) => {
        event.preventDefault()
        // sensitivity fix
        const zoom = d / 50
        setZoom({ zoom })
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
