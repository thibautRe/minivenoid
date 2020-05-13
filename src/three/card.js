// @ts-check
import React from "react"
import { useResource } from "react-three-fiber"
import { useDrag } from "react-use-gesture"
import { useZoom } from "./view"
import { getPixelDensityForZoom } from "../utils"

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
    ...(new Array(bevel).fill(0).map((_, index, arr) => {
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

const cardBufferGeometry = makeCardBufferGeometry(120, 200, 10, 8)

const Card = React.memo(function Card({
  card,
  cardIndex,
  geometry,
  material,
  onMoveCard,
}) {
  const zoom = useZoom()
  const bind = useDrag(
    ({ buttons, active, movement: [mx, my], memo }) => {
      // Only allow left-click drags
      if (buttons !== 1) {
        return
      }
      if (!memo) {
        memo = card.position
      }
      const pixelDensity = getPixelDensityForZoom(zoom.getValue())
      onMoveCard({
        id: card.id,
        position: [memo[0] + mx * pixelDensity, memo[1] - my * pixelDensity],
      })
      return memo
    },
    { pointerEvents: true },
  )
  return (
    <mesh
      position={[...card.position, cardIndex * 1e-10]}
      geometry={geometry}
      material={material}
      {...bind()}
    />
  )
})

/** Group of cards - also takes care of declaring reused materials and geometries */
export const Cards = ({ cards, ...props }) => {
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
      {cardGeometry &&
        cardMaterial &&
        cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            cardIndex={index}
            geometry={cardGeometry}
            material={cardMaterial}
            {...props}
          />
        ))}
    </>
  )
}
