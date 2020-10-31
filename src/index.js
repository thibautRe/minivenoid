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
import { getPixelDensityForZoom } from "./utils"

import "./index.css"

const urlParams = new URLSearchParams(window.location.search)

const MAX_CARDS = parseInt(urlParams.get("amt")) || 500
const MAX_CONNECTIONS = 200

const generateModel = (amt = MAX_CARDS, amtConn = MAX_CONNECTIONS) => {
  const cards = new Array(amt).fill(undefined).map(() => ({
    position: [
      (0.5 - Math.random()) * Math.sqrt(amt) * 500,
      (0.5 - Math.random()) * Math.sqrt(amt) * 400,
    ],
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

  const cardsMap = cards.reduce(
    (mem, card) => ({ ...mem, [card.id]: card }),
    {},
  )

  return { connections, cardsMap }
}

const model = generateModel()

const App = () => {
  const domTarget = React.useRef(null)
  const [cardsMap, setCardsMap] = React.useState(model.cardsMap)
  // eslint-disable-next-line no-unused-vars
  const [connections, setConnections] = React.useState(model.connections)

  const [{ zoom }, setZoom] = useSpring(() => ({ zoom: 0 }))
  const [{ position }, setPosition] = useSpring(() => ({ position: [0, 0] }))

  const bindEvents = useGesture(
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
      onPinch: ({ da: [d] }) => {
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
    {
      domTarget,
      event: { passive: false }, // needed for pinch events
    },
  )

  React.useEffect(bindEvents, [bindEvents])

  const onChangeCard = React.useCallback((id, action) => {
    setCardsMap(cards => ({ ...cards, [id]: action(cards[id]) }))
  }, [])

  const onMoveCard = React.useCallback(
    ({ id, position }) => {
      onChangeCard(id, card => ({ ...card, position }))
    },
    [onChangeCard],
  )

  return (
    <div ref={domTarget}>
      <Canvas>
        <ViewProvider zoom={zoom} position={position}>
          <Camera />
          <Connections cards={cardsMap} connections={connections} />
          <Cards cards={cardsMap} onMoveCard={onMoveCard} />
        </ViewProvider>
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
