// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { useSpring } from "react-spring/three"
import { useGesture } from "react-use-gesture"

import ThreeApp from "./three"
import { getPixelDensityForZoom } from "./utils"

import "./index.css"

const AMOUNT = 10000
const cards = new Array(AMOUNT).fill().map(() => ({
  position: [
    (0.5 - Math.random()) * Math.sqrt(AMOUNT) * 500,
    (0.5 - Math.random()) * Math.sqrt(AMOUNT) * 250,
  ],
  id: Math.random().toString(),
}))

const App = () => {
  const [{ zoom }, setZoom] = useSpring(() => ({ zoom: -1 }))
  const [{ position }, setPosition] = useSpring(() => ({ position: [0, 0] }))

  const bindEvents = useGesture({
    onWheel: ({ event, xy: [x, y] }) => {
      if (!event) return
      let delta = y / 5

      /** @see https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode */
      // PIXELS
      if (event.deltaMode === 0x00) {
        delta /= 50
      }

      setZoom({ zoom: delta })
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
          decay: true,
          friction: 10,
          tension: 409,
        },
      })
      return memo
    },
  })

  return (
    <div {...bindEvents()}>
      <Canvas orthographic>
        <ThreeApp zoom={zoom} position={position} cards={cards} />
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
