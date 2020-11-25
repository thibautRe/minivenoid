// @ts-check
import React from "react"
import { a, useSpring, config } from "react-spring"
import { useGesture } from "react-use-gesture"
import shallow from "zustand/shallow"

import { useZoom } from "./view"
import { getPixelDensityForZoom, positionToGrid, setCursor } from "../utils"
import { CardConnectionDot } from "./cardConnectionDot"
import { useModelStore } from "../store"

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
            memo[1] + my / pixelDensity,
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
            memo[1] + my / pixelDensity,
            card.position[2],
          ],
        }))
        return memo
      },
    },
    { pointerEvents: true, drag: { threshold: 10 } },
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
      {isDragged && (
        <rect
          x={card.position[0]}
          y={card.position[1]}
          width={card.width}
          height={card.height}
          rx={10}
          fill="#222"
          opacity="0.1"
        />
      )}
      <a.g transform={position.interpolate((x, y) => `translate(${x}, ${y})`)}>
        {/* BODY */}

        <a.rect
          width={card.width}
          height={height}
          fill={cardColor}
          rx={10}
          {...bind()}
        />

        <CardConnectionDot
          isConnected={connections.some(c => c.to === card.id)}
          variant={card.variant}
          cy={height.interpolate(h => h / 2)}
        />

        {card.exits.map((exit, index) => (
          <CardConnectionDot
            key={exit.id}
            isConnected={connections.some(c => exit.id === c.from)}
            variant={card.variant}
            cx={card.width}
            cy={height.interpolate(
              h => (h * (1 + index)) / (1 + card.exits.length),
            )}
          />
        ))}
      </a.g>
    </>
  )
})

export const Cards = () => {
  const cardIds = useModelStore(s => s.cards.map(c => c.id), shallow)
  return (
    <g id="cards">
      {cardIds.map(cardId => (
        <Card key={cardId} cardId={cardId} />
      ))}
    </g>
  )
}
