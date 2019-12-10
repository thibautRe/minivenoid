// @ts-check
import React from "react"

/**
 * @param {number} width
 * @param {number} height
 * @param {number} borderRadius
 * @param {number} bevel
 */
const makeCardBufferGeometry = (width, height, borderRadius, bevel) =>
  // prettier-ignore
  new Float32Array([
    // Main body
    0, borderRadius, 0,
    width, height - borderRadius, 0,
    0, height - borderRadius, 0,
    // --
    0, borderRadius, 0,
    width, borderRadius, 0,
    width, height - borderRadius, 0,

    // different bevel levels
    ...(new Array(bevel).fill().map((_, index, arr) => {
      const prevAngle = index * Math.PI/(2*bevel)
      const angle = (index + 1) * Math.PI/(2*bevel)
      
      return [
        // bottom
        borderRadius*(1-Math.cos(prevAngle)), borderRadius*(1-Math.sin(prevAngle)), 0,
        borderRadius*(1-Math.cos(angle)), borderRadius*(1-Math.sin(angle)), 0,
        width - borderRadius*(1-Math.cos(prevAngle)), borderRadius*(1-Math.sin(prevAngle)), 0,

        borderRadius*(1-Math.cos(angle)), borderRadius*(1-Math.sin(angle)), 0,
        width - borderRadius*(1-Math.cos(angle)), borderRadius*(1-Math.sin(angle)), 0,
        width - borderRadius*(1-Math.cos(prevAngle)), borderRadius*(1-Math.sin(prevAngle)), 0,

        // top
        borderRadius*(1-Math.cos(angle)), height - borderRadius*(1-Math.sin(angle)), 0,
        borderRadius*(1-Math.cos(prevAngle)), height - borderRadius*(1-Math.sin(prevAngle)), 0,
        width - borderRadius*(1-Math.cos(prevAngle)), height - borderRadius*(1-Math.sin(prevAngle)), 0,

        width - borderRadius*(1-Math.cos(angle)), height - borderRadius*(1-Math.sin(angle)), 0,
        borderRadius*(1-Math.cos(angle)), height - borderRadius*(1-Math.sin(angle)), 0,
        width - borderRadius*(1-Math.cos(prevAngle)), height - borderRadius*(1-Math.sin(prevAngle)), 0,
      ]
    }).flat())

  ])

const cardBufferGeometry = makeCardBufferGeometry(120, 200, 10, 1)

export const CardBufferGeometry = React.forwardRef((_, ref) => (
  <bufferGeometry ref={ref} attach="geometry">
    <bufferAttribute
      attachObject={["attributes", "position"]}
      count={cardBufferGeometry.length / 3}
      array={cardBufferGeometry}
      itemSize={3}
    />
  </bufferGeometry>
))

/**
 * @param {object} props
 * @param {[number, number, number]} props.position
 */
const Card = ({ position, geometry, material, hoverMaterial }) => {
  const [isHover, setIsHover] = React.useState(false)
  return (
    <mesh
      onPointerOver={e => {
        e.stopPropagation()
        setIsHover(true)
      }}
      onPointerOut={e => {
        e.stopPropagation()
        setIsHover(false)
      }}
      position={position}
      geometry={geometry}
      material={isHover ? hoverMaterial : material}
    />
  )
}

export default React.memo(Card)
