import React from "react"
import { useCameraState } from "../providers/CameraProvider"
import { getPixelDensityForZoom } from "../utils"

export const CameraComponent: React.FC = ({ children }) => {
  const { zoom, position } = useCameraState()
  return (
    <g
      transform={`
          translate(
            ${document.documentElement.clientWidth / 2},
            ${document.documentElement.clientHeight / 2}
          )
          scale(${getPixelDensityForZoom(zoom)})
          translate(${-position[0]}, ${position[1]})
        `}
    >
      {children}
    </g>
  )
}
