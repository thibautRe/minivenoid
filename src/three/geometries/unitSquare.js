import * as THREE from "three"

// prettier-ignore
const unitSquare = new Float32Array([
  0,0,0,
  1,1,0,
  0,1,0,

  0,0,0,
  1,0,0,
  1,1,0,
])
export const unitSquareGeom = new THREE.BufferGeometry()
unitSquareGeom.setAttribute(
  "position",
  new THREE.BufferAttribute(unitSquare, 3),
)

/**
 * Unit square of 1 by 1 centered on the X axis
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
