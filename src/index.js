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

import model1 from "./models/1.json"

const urlParams = new URLSearchParams(window.location.search)
const amt = parseInt(urlParams.get("amt")) || 50
const MAX_CARDS = amt
const MAX_CONNECTIONS = amt * 0.8

const newId = () => Math.floor(Math.random() * 10000000).toString()

const generateModel = (amt = MAX_CARDS, amtConn = MAX_CONNECTIONS) => {
  const cards = new Array(amt).fill(undefined).map((_, i) => ({
    id: newId(),
    position: positionToGrid([
      (0.5 - Math.random()) * Math.sqrt(amt) * 500,
      (0.5 - Math.random()) * Math.sqrt(amt) * 400,
      i * 1e-10,
    ]),
    height: Math.round((0.5 + Math.random()) * 200),
    width: 120,
    variant: Math.random() > 0.8 ? "solution" : undefined,
    exits: new Array(Math.floor(Math.random() * 4)).fill().map(_ => ({
      id: newId(),
    })),
  }))

  const allExits = cards.flatMap(c => c.exits)

  const connections = new Array(amtConn).fill(0).map(() => {
    return {
      id: newId(),
      from:
        allExits[Math.max(0, Math.floor(Math.random() * allExits.length - 1))]
          .id,
      to: cards[Math.max(0, Math.floor(Math.random() * cards.length - 1))].id,
    }
  })

  return { cards, connections }
}

const getModelBoundingBox = model => {
  const { cards } = model
  const minX = cards.reduce(
    (acc, card) => Math.min(acc, card.position[0]),
    Infinity,
  )
  const maxX = cards.reduce(
    (acc, card) => Math.max(acc, card.position[0] + card.width),
    -Infinity,
  )
  const minY = cards.reduce(
    (acc, card) => Math.min(acc, card.position[1]),
    Infinity,
  )
  const maxY = cards.reduce(
    (acc, card) => Math.max(acc, card.position[1] + card.height),
    -Infinity,
  )
  return { minX, maxX, minY, maxY }
}

const initModel = urlParams.get("model") === "1" ? model1 : generateModel()

const bbox = getModelBoundingBox(initModel)

const App = () => {
  const domTarget = React.useRef(null)
  const [model, setModel] = React.useState(initModel)

  const [{ zoom }, setZoom] = useSpring(() => ({
    from: { zoom: -4 },
    to: {
      zoom: -Math.log(
        Math.max(
          (bbox.maxY - bbox.minY + 200) / document.documentElement.clientHeight,
          (bbox.maxX - bbox.minX + 200) / document.documentElement.clientWidth,
        ),
      ),
    },
  }))
  const [{ position }, setPosition] = useSpring(() => ({
    position: [(bbox.maxX + bbox.minX) / 2, -(bbox.maxY + bbox.minY) / 2],
  }))

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
        })

        return memo
      },
      onPinch: ({ event, origin, da: [d], memo }) => {
        event.preventDefault()
        // sensitivity fix
        const delta = d / 50
        if (!memo) {
          memo = {
            delta,
            initZoom: zoom.getValue(),
            initPos: position.getValue(),
          }
        }
        const z = memo.initZoom + delta - memo.delta
        setZoom({ zoom: z })

        // // Scroll towards where the mouse is located
        // const { width, height } = domTarget.current.getBoundingClientRect()
        // const [tx, ty] = getCanvasPosition(position.getValue(), z, origin, [
        //   width,
        //   height,
        // ])
        // const c = getPixelDensityForZoom(memo.delta-delta)
        // const newPosition = [
        //   memo.initPos[0] * c + (1 - c) * tx,
        //   memo.initPos[1] * c - (1 - c) * ty,
        // ]
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
        })
        return memo
      },
      // Add a card
      onDblClick: ({ event: { clientX, clientY, ctrlKey } }) => {
        if (ctrlKey) {
          setModel(model => {
            console.log(JSON.stringify(model, null, 2))
            return model
          })
          return
        }
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
              position: [cx - 60, cy - 100, model.cards.length * 1e-10],
              exits: [],
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

  return (
    <div ref={domTarget}>
      <Canvas>
        <ViewProvider zoom={zoom} position={position}>
          <Camera />
          <Connections cards={model.cards} connections={model.connections} />
          <Cards
            cards={model.cards}
            connections={model.connections}
            onChangeCard={setCard}
          />
        </ViewProvider>
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
