import React from "react"
import { useThree, useFrame } from "react-three-fiber"
import { a } from "react-spring/three"
import { useView } from "./view"
import { getPixelDensityForZoom } from "../utils"

export const Camera = ({ ...props }) => {
  const { setDefaultCamera, camera, size } = useThree()
  const { zoom, position } = useView()
  const cameraRef = React.useRef(null)

  useFrame(() => {
    cameraRef.current.updateProjectionMatrix()
  })

  React.useLayoutEffect(() => {
    const oldCam = camera
    setDefaultCamera(cameraRef.current)
    return () => setDefaultCamera(oldCam)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDefaultCamera])

  return (
    <a.orthographicCamera
      ref={cameraRef}
      left={size.width / -2}
      right={size.width / 2}
      top={size.height / 2}
      bottom={size.height / -2}
      position={position.interpolate((x, y) => [x, -y, 5])}
      zoom={zoom.interpolate(getPixelDensityForZoom)}
      {...props}
    />
  )
}
