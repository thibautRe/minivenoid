import * as THREE from "three"

/**
 * Returns the pixel density for a given zoom level
 * @param {number} zoom
 */
export const getPixelDensityForZoom = zoom => Math.exp(zoom)

/**
 *
 * @param {[number, number]} camPos Current camera position
 * @param {number} camZoom Current camera zoom level
 * @param {[number, number]} mousePos X and Y coordinate of the mouse (usually event.clientX and event.clientY)
 * @param {[number, number]} canvasSize width and height of the canvas
 */
export const getCanvasPosition = (camPos, camZoom, mousePos, canvasSize) => {
  const [camX, camY] = camPos
  const [clientX, clientY] = mousePos
  const [width, height] = canvasSize
  const [dx, dy] = [clientX - width / 2, clientY - height / 2]
  const pd = getPixelDensityForZoom(-camZoom)
  return [camX + dx * pd, -camY - dy * pd]
}

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

const pToGrid = p => Math.round(p / 50) * 50
export const positionToGrid = pos => [pToGrid(pos[0]), pToGrid(pos[1]), pos[2]]

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
