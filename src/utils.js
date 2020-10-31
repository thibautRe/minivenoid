import * as THREE from "three"

/**
 * Returns the pixel density for a given zoom level
 * @param {number} zoom
 */
export const getPixelDensityForZoom = zoom => Math.exp(zoom)

/**
 * Sets the global cursor type
 * @param {string} [cursor]
 */
export const setCursor = cursor => {
  if (cursor) {
    document.documentElement.style.cursor = cursor
  } else {
    document.documentElement.style.cursor = null
  }
}

/**
 * Unit square of 1 by 1
 */
// prettier-ignore
const yAxixUnitSquare = new Float32Array([
  0,-0.5,0,
  1,0.5,0,
  0,0.5,0,

  0,-0.5,0,
  1,-0.5,0,
  1,0.5,0,
])

export const unitYAxisSquareGeom = new THREE.BufferGeometry()
unitYAxisSquareGeom.setAttribute(
  "position",
  new THREE.BufferAttribute(yAxixUnitSquare, 3),
)
