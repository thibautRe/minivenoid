// @ts-check
import React from "react"
import { useGesture } from "react-use-gesture"
import { useZoom } from "./view"
import { getPixelDensityForZoom, setCursor } from "../utils"

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
    ...(new Array(bevel).fill(0).flatMap((_, index, arr) => {
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
    }))

  ])

const cardBufferGeometry = makeCardBufferGeometry(120, 200, 10, 4)

const Card = React.memo(function CardMemo({
  card,
  cardIndex,
  geometry,
  onMoveCard,
}) {
  const zoom = useZoom()
  const bind = useGesture(
    {
      onPointerEnter: ({ buttons }) => {
        if (buttons) return
        setCursor("grab")
      },
      onPointerLeave: ({ buttons, button }) => {
        if (buttons) return
        setCursor()
      },
      onDragStart: () => {
        setCursor("grabbing")
      },
      onDragEnd: () => {
        setCursor("grab")
      },
      onDrag: ({ buttons, active, movement: [mx, my], memo }) => {
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
          position: [memo[0] + mx / pixelDensity, memo[1] - my / pixelDensity],
        })
        return memo
      },
    },
    { pointerEvents: true },
  )
  return (
    <mesh position={[...card.position, cardIndex * 1e-10]} {...bind()}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={["attributes", "position"]}
          count={cardBufferGeometry.length / 3}
          array={cardBufferGeometry}
          itemSize={3}
        />
      </bufferGeometry>
      <meshBasicMaterial attach="material" color="#EEE" />
    </mesh>
  )
})

export const Cards = ({ cards, ...props }) => {
  return Object.keys(cards).map((id, index) => (
    <Card key={id} card={cards[id]} cardIndex={index} {...props} />
  ))
}
