// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { useSpring } from "react-spring/three"
import { useGesture } from "react-use-gesture"

import CameraGroup from "./three/cameraGroup"
import { ViewProvider } from "./three/view"
import { Cards } from "./three/card"
import { Connections } from "./three/connections"
import { getPixelDensityForZoom } from "./utils"

import "./index.css"

const urlParams = new URLSearchParams(window.location.search)

const MAX_CARDS = parseInt(urlParams.get("amt")) || 500
const MAX_CONNECTIONS = 200

const generateModel = (amt = MAX_CARDS, amtConn = MAX_CONNECTIONS) => {
  const cards = new Array(amt).fill(undefined).map(() => ({
    position: [
      (0.5 - Math.random()) * Math.sqrt(amt) * 850,
      (0.5 - Math.random()) * Math.sqrt(amt) * 600,
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

  return { cards, connections }
}

const model = generateModel()

const App = () => {
  const domTarget = React.useRef(null)
  const [cards, setCards] = React.useState(model.cards)
  const [connections, setConnections] = React.useState(model.connections)

  const [{ zoom, position }, setZoomPos] = useSpring(() => ({
    zoom: -1,
    position: [0, 0],
  }))

  const bindEvents = useGesture(
    {
      onWheel: ({ event, xy: [x, y] }) => {
        if (!event) return
        const pixelDensity = getPixelDensityForZoom(zoom.getValue())

        /** @see https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode */
        const deltaModeMultiplyer = event.deltaMode === 0x00 ? 1 : 50

        const mult = pixelDensity * deltaModeMultiplyer
        const position = [-x * mult, -y * mult]
        setZoomPos({ position })
      },
      onPinch: ({ event, da: [d], origin }) => {
        if (!event) return

        // sensitivity fix
        const zoom = -d / 50

        // let newPosition
        // if (origin) {
        //   const [x, y] = origin
        //   const [currentX, currentY] = position.getValue()
        //   const pd = getPixelDensityForZoom(zoom)
        //   // assumes the canvas is full screen
        //   const [winX, winY] = [window.innerWidth, window.innerHeight]
        //   newPosition = [
        //     currentX + pd * (x - winX / 2),
        //     currentY + pd * (y - winY / 2),
        //   ]
        // }

        setZoomPos({ zoom })
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

        setZoomPos({
          position: movement.map((m, i) => m * pixelDensity + memo[i]),
          immediate: active,
          config: {
            velocity: direction.map(d => d * velocity),
            decay: true,
            friction: 10,
            tension: 409,
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
    setCards(cards => {
      const cardIndex = cards.findIndex(c => c.id === id)
      return [
        ...cards.slice(0, cardIndex),
        action(cards[cardIndex]),
        ...cards.slice(cardIndex + 1),
      ]
    })
  }, [])

  const onMoveCard = React.useCallback(
    ({ id, position }) => {
      onChangeCard(id, card => ({ ...card, position }))
    },
    [onChangeCard],
  )

  return (
    <div ref={domTarget}>
      <Canvas orthographic>
        <ViewProvider zoom={zoom} position={position}>
          <CameraGroup>
            <Connections cards={cards} connections={connections} />
            <Cards cards={cards} onMoveCard={onMoveCard} />
          </CameraGroup>
        </ViewProvider>
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
