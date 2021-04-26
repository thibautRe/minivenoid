// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { useGesture } from "react-use-gesture"

import { CameraComponent } from "./three/cameraComponent"
import { Cards } from "./three/card"
import { Connections } from "./three/connections"
import { getModelBoundingBox, getPixelDensityForZoom } from "./utils"
import { model as initModel } from "./store"

import "./index.css"
import { Coord } from "./types"
import { ModelProvider, useModel } from "./providers/ModelProvider"
import {
  CameraProvider,
  useCameraRef,
  useCameraSetState,
} from "./providers/CameraProvider"

const App = () => {
  const cameraRef = useCameraRef()
  const setCamera = useCameraSetState()

  const domTarget = React.useRef<SVGSVGElement>(null)
  const { cardMap } = useModel()

  React.useEffect(() => {
    const bbox = getModelBoundingBox(Array.from(cardMap.values()))
    setCamera({
      position: [
        (bbox.maxX + bbox.minX) / 2,
        -(bbox.maxY + bbox.minY) / 2,
      ] as Coord,
      zoom: -Math.log(
        Math.max(
          (bbox.maxY - bbox.minY + 200) / document.documentElement.clientHeight,
          (bbox.maxX - bbox.minX + 200) / document.documentElement.clientWidth,
        ),
      ),
    })
    // Init effect, do not run when the model changes
    // eslint-disable-next-line
  }, [])

  useGesture(
    {
      onWheel: ({ event, movement, memo, active }) => {
        if (!event) return

        /** @see https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode */
        const deltaModeMultiplier = event.deltaMode === 0x00 ? 1 : 20

        // Initialize the memo
        if (!memo) {
          memo = cameraRef.current?.position
        }

        const pixelDensity = getPixelDensityForZoom(cameraRef.current!.zoom)

        setCamera({
          ...cameraRef.current!,
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
            initZoom: cameraRef.current!.zoom,
            initPos: cameraRef.current!.position,
          }
        }
        const z = memo.initZoom + delta - memo.delta
        setCamera({ ...cameraRef.current!, zoom: z })

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
          memo = cameraRef.current!.position
        }

        const pixelDensity = getPixelDensityForZoom(cameraRef.current!.zoom)

        setCamera({
          ...cameraRef.current!,
          position: movement.map((m, i) => m * pixelDensity + memo[i]) as Coord,
        })
        return memo
      },
      // Add a card
      // @ts-expect-error clientX, Y and ctrlKey
      onDoubleClick: ({ event: { clientX, clientY, ctrlKey } }) => {
        // if (!domTarget.current) return
        // const { width, height } = domTarget.current.getBoundingClientRect()
        // const [cx, cy] = getCanvasPosition(
        //   position,
        //   zoom,
        //   [clientX, clientY],
        //   [width, height],
        // )
        // RE-TODO
        // addCard({
        //   height: 200,
        //   width: 120,
        //   position: [cx - 60, cy - 100],
        //   exits: [],
        // })
      },
    },
    { domTarget, eventOptions: { passive: false } },
  )

  return (
    <svg
      ref={domTarget}
      viewBox={`0 0 ${document.documentElement.clientWidth} ${document.documentElement.clientHeight}`}
    >
      <CameraComponent>
        <Connections />
        <Cards />
      </CameraComponent>
    </svg>
  )
}

const WithModel: React.FC = ({ children }) => {
  const [model, setModel] = React.useState(initModel)

  return (
    <ModelProvider model={model} onSetModel={setModel}>
      {children}
    </ModelProvider>
  )
}

ReactDOM.render(
  <WithModel>
    <CameraProvider>
      <App />
    </CameraProvider>
  </WithModel>,
  document.getElementById("root"),
)
