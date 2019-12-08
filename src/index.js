// @ts-check
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import ThreeApp from "./three"

import "./index.css"

const App = () => {
  const [zoom, setZoom] = React.useState(1)
  const onWheel = React.useCallback(
    (/** @type {MouseEvent} */ { deltaY }) => setZoom(z => z - deltaY / 15),
    [],
  )

  return (
    <div onWheel={onWheel}>
      <Canvas orthographic>
        <ThreeApp zoom={Math.exp(zoom)} />
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
