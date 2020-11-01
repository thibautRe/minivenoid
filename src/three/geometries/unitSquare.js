import * as THREE from "three"

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
