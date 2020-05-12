// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { useSpring } from "react-spring/three"
import { useGesture } from "react-use-gesture"

import CameraGroup from "./three/cameraGroup"
import { ViewProvider } from "./three/view"
import { Cards } from "./three/card"
import { getPixelDensityForZoom } from "./utils"

import "./index.css"

const generateCards = (AMOUNT = 5000) =>
  new Array(AMOUNT).fill(undefined).map(() => ({
    position: [
      (0.5 - Math.random()) * Math.sqrt(AMOUNT) * 850,
      (0.5 - Math.random()) * Math.sqrt(AMOUNT) * 600,
    ],
    id: Math.random().toString(),
  }))

const App = () => {
  const domTarget = React.useRef(null)
  const [cards, setCards] = React.useState(generateCards)
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
        console.log(position)
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

        console.log(zoom)

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
            <Cards cards={cards} onMoveCard={onMoveCard} />
          </CameraGroup>
        </ViewProvider>
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
