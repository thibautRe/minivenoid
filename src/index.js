// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { useSpring } from "react-spring/three"

import ThreeApp from "./three"

import "./index.css"
import { useGesture } from "react-use-gesture"

const cards = new Array(400).fill().map(() => ({
  position: [(0.5 - Math.random()) * 10000, (0.5 - Math.random()) * 6000],
  id: Math.random().toString(),
}))

const App = () => {
  const [{ zoom, position }, set] = useSpring(() => ({
    zoom: -1,
    position: [0, 0],
  }))

  const bindEvents = useGesture({
    onWheel: ({ event, xy: [x, y] }) => {
      if (!event) return
      let delta = -y

      /** @see https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode */
      // PIXELS
      if (event.deltaMode === 0x00) {
        delta /= 50
        // PAGE
      }

      set({ zoom: delta })
    },
    onDrag: ({ down, last, delta: [mx, my] }) => {
      if (!down || last) return
      const currentPosition = position.getValue()
      const currentZoom = zoom.getValue()

      set({
        position: [
          currentPosition[0] + currentZoom * mx,
          currentPosition[1] - currentZoom * my,
        ],
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
