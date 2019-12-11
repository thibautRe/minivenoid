// @ts-check
import React from "react"
import { a, interpolate } from "react-spring/three"

import { Cards } from "./card"
import { getPixelDensityForZoom } from "../utils"

/**
 * @param {number} z
 **/
const getScale = z => [
  1 / getPixelDensityForZoom(z),
  1 / getPixelDensityForZoom(z),
  1,
]

const ThreeApp = ({ zoom, position, cards }) => {
  return (
    <a.group
      position={interpolate([zoom, position], (z, [x, y]) => [
        x / getPixelDensityForZoom(z),
        -y / getPixelDensityForZoom(z),
        0,
      ])}
      scale={zoom.interpolate(getScale)}
    >
      <Cards cards={cards} />
    </a.group>
  )
}

export default ThreeApp
