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
