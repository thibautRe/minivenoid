// @ts-check
import React from "react"
import { useResource } from "react-three-fiber"

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

const Card = React.memo(({ card, cardIndex, geometry, material }) => {
  return (
    <mesh
      position={[...card.position, cardIndex * 1e-10]}
      geometry={geometry}
      material={material}
    />
  )
})

/**
 * Group of cards - also takes care of declaring reused materials and geometries
 */
export const Cards = ({ cards }) => {
  const [cardRef, cardGeometry] = useResource()
  const [cardMaterialRef, cardMaterial] = useResource()

  return (
    <>
      <bufferGeometry ref={cardRef}>
        <bufferAttribute
          attachObject={["attributes", "position"]}
          count={cardBufferGeometry.length / 3}
          array={cardBufferGeometry}
          itemSize={3}
        />
      </bufferGeometry>
      <meshBasicMaterial ref={cardMaterialRef} color="#222" opacity={0.7} />
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          cardIndex={index}
          geometry={cardGeometry}
          material={cardMaterial}
        />
      ))}
    </>
  )
}
