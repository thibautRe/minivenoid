// @ts-check
import React from "react"
import { a, useSpring, config } from "react-spring/three"
import { useGesture } from "react-use-gesture"
import { useZoom } from "./view"
import { getPixelDensityForZoom, positionToGrid, setCursor } from "../utils"
import { CardConnectionDot } from "./cardConnectionDot"
import { useUpdate } from "react-three-fiber"
import { unitSquareGeom } from "./geometries/unitSquare"
import { useModelStore } from "../store"
import shallow from "zustand/shallow"

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

const Card = React.memo(function CardMemo({ cardId }) {
  const zoom = useZoom()
  const [isHovered, setIsHovered] = React.useState(false)
  const [isDragged, setIsDragged] = React.useState(false)

  const [card, connections, setCard] = useModelStore(
    React.useCallback(
      s => [s.cards.find(c => c.id === cardId), s.connections, s.setCard],
      [cardId],
    ),
    shallow,
  )
  const bind = useGesture(
    {
      onPointerEnter: () => {
        setIsHovered(true)
      },
      onPointerLeave: () => {
        setIsHovered(false)
      },
      // DEBUG
      onClick: ({ event: { ctrlKey, altKey } }) => {
        if (ctrlKey) {
          setCard(cardId, c => ({ ...c, height: 20 + Math.random() * 400 }))
          return
        }

        if (altKey) {
          setCard(cardId, c => ({
            ...c,
            variant: c.variant === "solution" ? undefined : "solution",
          }))
        }
      },
      onDragStart: () => {
        setCursor("grabbing")
        setIsDragged(true)
      },
      onDragEnd: ({ movement: [mx, my], memo }) => {
        setCursor()
        setIsDragged(false)
        if (!memo) return
        const pixelDensity = getPixelDensityForZoom(zoom.getValue())
        setCard(card.id, card => ({
          ...card,
          position: positionToGrid([
            memo[0] + mx / pixelDensity,
            memo[1] - my / pixelDensity,
            card.position[2],
          ]),
        }))
      },
      onDrag: ({ buttons, intentional, movement: [mx, my], memo }) => {
        // Only allow left-click drags
        if (buttons !== 1) {
          return
        }
        setCursor("grabbing")
        if (!memo) {
          memo = card.position
        }
        const pixelDensity = getPixelDensityForZoom(zoom.getValue())
        setCard(card.id, card => ({
          ...card,
          position: [
            memo[0] + mx / pixelDensity,
            memo[1] - my / pixelDensity,
            card.position[2],
          ],
        }))
        return memo
      },
    },
    { pointerEvents: true, drag: { threshold: 10 } },
  )

  const geom = React.useMemo(
    () => makeCardBufferGeometry(card.width, card.height, 10, 4),
    [card.height, card.width],
  )

  const ref = useUpdate(
    self => {
      self.needsUpdate = true
    },
    [geom],
  )
  const { position, height, cardColor } = useSpring({
    from: {
      cardColor: "#FFFFFF",
    },
    to: {
      height: card.height,
      position: card.position,
      cardColor: isHovered
        ? card.variant === "solution"
          ? "#993d4a"
          : "#515466"
        : card.variant === "solution"
        ? "#7f333e"
        : "#3d3f4c",
    },
    config: config.stiff,
  })

  return (
    <>
      <a.group position={position}>
        {/* BODY */}

        <mesh {...bind()}>
          <bufferGeometry>
            <bufferAttribute
              ref={ref}
              attachObject={["attributes", "position"]}
              count={geom.length / 3}
              array={geom}
              itemSize={3}
            />
          </bufferGeometry>
          <a.meshBasicMaterial color={cardColor} />
        </mesh>

        {/* ENTER - LEFT */}
        <CardConnectionDot
          isConnected={connections.some(c => c.to === card.id)}
          variant={card.variant}
          position-y={height.interpolate(h => h / 2)}
        />

        {/* EXITS - RIGHT */}
        {card.exits.map((exit, index) => (
          <CardConnectionDot
            key={exit.id}
            isConnected={connections.some(c => exit.id === c.from)}
            variant={card.variant}
            position-x={card.width}
            position-y={height.interpolate(
              h => (h * (1 + index)) / (1 + card.exits.length),
            )}
          />
        ))}
      </a.group>

      {isDragged && (
        <mesh
          position={positionToGrid([card.position[0], card.position[1], -1])}
          scale-x={card.width}
          scale-y={card.height}
          geometry={unitSquareGeom}
        >
          <meshBasicMaterial color="#EEE" />
        </mesh>
      )}
    </>
  )
})

export const Cards = () => {
  const cardIds = useModelStore(s => s.cards.map(c => c.id), shallow)
  return cardIds.map(cardId => <Card key={cardId} cardId={cardId} />)
}
