import React from "react"
import { Coordinate } from "../types"

interface Camera {
  zoom: number
  position: Coordinate
}

const initCamera: Camera = { zoom: 0, position: [0, 0] }
interface CameraRefContext {
  cameraRef: React.RefObject<Camera>
}
const CameraStateContext = React.createContext<Camera>({
  zoom: 0,
  position: [0, 0],
})
const CameraSetStateContext = React.createContext<(c: Camera) => void>(() => {
  throw new Error("Cannot set camera")
})
const CameraRefContext = React.createContext<React.RefObject<Camera>>({
  current: null,
})

export const CameraProvider: React.FC = ({ children }) => {
  const [camera, setCameraState] = React.useState(initCamera)
  const cameraRef = React.useRef(initCamera)

  const setCamera = React.useCallback((cam: Camera) => {
    setCameraState(cam)
    cameraRef.current = cam
  }, [])

  return (
    <CameraStateContext.Provider value={camera}>
      <CameraSetStateContext.Provider value={setCamera}>
        <CameraRefContext.Provider value={cameraRef}>
          {children}
        </CameraRefContext.Provider>
      </CameraSetStateContext.Provider>
    </CameraStateContext.Provider>
  )
}

export const useCameraState = () => React.useContext(CameraStateContext)
export const useCameraSetState = () => React.useContext(CameraSetStateContext)
export const useCameraRef = () => React.useContext(CameraRefContext)
