// @ts-check
import React from "react"
import ReactDOM from "react-dom"
// import { Canvas } from "react-three-fiber"
import { useSpring } from "react-spring"
import { useGesture } from "react-use-gesture"

import { ViewProvider } from "./three/view"
import { Cards } from "./three/card"
import { Connections } from "./three/connections"
import {
  getCanvasPosition,
  getModelBoundingBox,
  getPixelDensityForZoom,
} from "./utils"
import { useModelStore } from "./store"

import "./index.css"
import { Coord } from "./types"

const App = () => {
  const domTarget = React.useRef<SVGSVGElement>(null)
  const addCard = useModelStore(s => s.addCard)

  const [{ zoom, position }, setCamera] = useSpring(() => {
    const bbox = getModelBoundingBox(useModelStore.getState().cards)
    return {
      from: { zoom: -4 },
      to: {
        position: [
          (bbox.maxX + bbox.minX) / 2,
          -(bbox.maxY + bbox.minY) / 2,
        ] as Coord,
        zoom: -Math.log(
          Math.max(
            (bbox.maxY - bbox.minY + 200) /
              document.documentElement.clientHeight,
            (bbox.maxX - bbox.minX + 200) /
              document.documentElement.clientWidth,
          ),
        ),
      },
    }
  })

  useGesture(
    {
      onWheel: ({ event, movement, memo, active }) => {
        if (!event) return

        /** @see https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode */
        const deltaModeMultiplier = event.deltaMode === 0x00 ? 1 : 20

        // Initialize the memo
        if (!memo) {
          memo = position.get()
        }

        const pixelDensity = getPixelDensityForZoom(zoom.get())

        setCamera({
          position: [
            (movement[0] / pixelDensity) * deltaModeMultiplier + memo[0],
            -(movement[1] / pixelDensity) * deltaModeMultiplier + memo[1],
          ],
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
            initZoom: zoom.get(),
            initPos: position.get(),
          }
        }
        const z = memo.initZoom + delta - memo.delta
        setCamera({ zoom: z })

        // // Scroll towards where the mouse is located
        // const { width, height } = domTarget.current.getBoundingClientRect()
        // const [tx, ty] = getCanvasPosition(position.get(), z, origin, [
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
          memo = position.get()
        }

        const pixelDensity = getPixelDensityForZoom(zoom.get())

        setCamera({
          position: movement.map((m, i) => m * pixelDensity + memo[i]) as Coord,
        })
        return memo
      },
      // Add a card
      // @ts-expect-error clientX, Y and ctrlKey
      onDoubleClick: ({ event: { clientX, clientY, ctrlKey } }) => {
        if (ctrlKey) {
          const s = useModelStore.getState()
          console.log(
            JSON.stringify(
              { cards: s.cards, connections: s.connections },
              null,
              2,
            ),
          )
        }
        if (!domTarget.current) return
        const { width, height } = domTarget.current.getBoundingClientRect()
        const [cx, cy] = getCanvasPosition(
          position.get(),
          zoom.get(),
          [clientX, clientY],
          [width, height],
        )
        addCard({
          height: 200,
          width: 120,
          position: [cx - 60, cy - 100],
          exits: [],
        })
      },
    },
    { domTarget, eventOptions: { passive: false } },
  )

  return (
    <svg
      ref={domTarget}
      viewBox={`0 0 ${document.documentElement.clientWidth} ${document.documentElement.clientHeight}`}
    >
      <ViewProvider zoom={zoom} position={position}>
        <Connections />
        <Cards />
      </ViewProvider>
    </svg>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
