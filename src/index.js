// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { useSpring } from "react-spring/three"

import ThreeApp from "./three"

import "./index.css"
import { useGesture } from "react-use-gesture"

const AMOUNT = 10000
const cards = new Array(AMOUNT).fill().map(() => ({
  position: [
    (0.5 - Math.random()) * Math.sqrt(AMOUNT) * 500,
    (0.5 - Math.random()) * Math.sqrt(AMOUNT) * 250,
  ],
  id: Math.random().toString(),
}))

const getPixelDensityForZoom = zoom => 2 ** zoom

const App = () => {
  const [{ zoom, position }, set] = useSpring(() => ({
    zoom: -1,
    position: [0, 0],
  }))

  const bindEvents = useGesture({
    onWheel: ({ event, xy: [x, y] }) => {
      if (!event) return
      let delta = y / 5

      /** @see https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode */
      // PIXELS
      if (event.deltaMode === 0x00) {
        delta /= 50
      }

      set({ zoom: delta })
    },
    onDrag: ({ down, last, delta: [mx, my] }) => {
      if (!down || last) return
      const [x, y] = position.getValue()
      const pixelDensity = getPixelDensityForZoom(zoom.getValue())
      console.log(x + mx * pixelDensity)

      set({
        position: [x + mx * pixelDensity, y - my * pixelDensity],
      })
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
