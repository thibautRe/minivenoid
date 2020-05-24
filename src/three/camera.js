import React from "react"
import { useThree, useFrame } from "react-three-fiber"
import { a, interpolate } from "react-spring/three"
import { useView } from "./view"
import { getPixelDensityForZoom } from "../utils"

export const Camera = ({ makeDefault = true, ...props }) => {
  const { setDefaultCamera, camera, size } = useThree()
  const { zoom, position } = useView()
  const cameraRef = React.useRef(null)

  useFrame(() => {
    cameraRef.current.updateProjectionMatrix()
  })

  React.useLayoutEffect(() => {
    if (makeDefault && camera !== cameraRef.current) {
      const oldCam = camera
      setDefaultCamera(cameraRef.current)
      return () => setDefaultCamera(oldCam)
    }
  }, [makeDefault, setDefaultCamera, camera])

  return (
    <a.orthographicCamera
      ref={cameraRef}
      left={size.width / -2}
      right={size.width / 2}
      top={size.height / 2}
      bottom={size.height / -2}
      position={interpolate([zoom, position], (z, [x, y]) => [
        x / getPixelDensityForZoom(z),
        -y / getPixelDensityForZoom(z),
        5, // altitude
      ])}
      zoom={zoom.interpolate(getPixelDensityForZoom)}
      {...props}
    />
  )
}
