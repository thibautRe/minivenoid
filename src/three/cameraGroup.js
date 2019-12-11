// @ts-check
import React from "react"
import { a, interpolate } from "react-spring/three"

import { getPixelDensityForZoom } from "../utils"
import { useView } from "./view"

/**
 * @param {number} z
 **/
const getScale = z => [
  1 / getPixelDensityForZoom(z),
  1 / getPixelDensityForZoom(z),
  1,
]

const CameraGroup = ({ children }) => {
  const { zoom, position } = useView()
  return (
    <a.group
      position={interpolate([zoom, position], (z, [x, y]) => [
        x / getPixelDensityForZoom(z),
        -y / getPixelDensityForZoom(z),
        0,
      ])}
      scale={zoom.interpolate(getScale)}
    >
      {children}
    </a.group>
  )
}

export default CameraGroup
