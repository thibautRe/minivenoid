// @ts-check
import React from "react"
import { useGesture } from "react-use-gesture"
import shallow from "zustand/shallow"

import { useZoom } from "./view"
import { getPixelDensityForZoom, positionToGrid, setCursor } from "../utils"
import { CardConnectionDot } from "./cardConnectionDot"
import { useModelStore } from "../store"

interface CardProps {
  cardIndex: number
}
const Card = React.memo(function CardMemo({ cardIndex }: CardProps) {
  const zoom = useZoom()

  const [card, connections, setCard] = useModelStore(
    React.useCallback(s => [s.cards[cardIndex], s.connections, s.setCard], [
      cardIndex,
    ]),
    shallow,
  )

  const cardId = card.id

  const bind = useGesture(
    {
      // DEBUG
      // @ts-expect-error events
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
      },
      onDragEnd: ({ movement: [mx, my], memo }) => {
        setCursor()
        if (!memo) return
        const pixelDensity = getPixelDensityForZoom(zoom.get())
        setCard(card.id, card => ({
          ...card,
          position: positionToGrid([
            memo[0] + mx / pixelDensity,
            memo[1] + my / pixelDensity,
          ]),
        }))
      },
      onDrag: ({ buttons, movement: [mx, my], memo }) => {
        // Only allow left-click drags
        if (buttons !== 1) {
          return
        }
        setCursor("grabbing")
        if (!memo) {
          memo = card.position
        }
        const pixelDensity = getPixelDensityForZoom(zoom.get())
        setCard(card.id, card => ({
          ...card,
          position: [memo[0] + mx / pixelDensity, memo[1] + my / pixelDensity],
        }))
        return memo
      },
    },
    // @ts-expect-error
    { pointerEvents: true, drag: { threshold: 10 } },
  )

  return (
    <>
      <g transform={`translate(${card.position[0]}, ${card.position[1]})`}>
        {/* BODY */}

        <rect
          width={card.width}
          height={card.height}
          fill={card.variant === "solution" ? "#7f333e" : "#3d3f4c"}
          rx={10}
          {...bind()}
        />

        <CardConnectionDot
          isConnected={connections.some(c => c.to === card.id)}
          variant={card.variant}
          cy={card.height / 2}
        />

        {card.exits.map((exit, index) => (
          <CardConnectionDot
            key={exit.id}
            isConnected={connections.some(c => exit.id === c.from)}
            variant={card.variant}
            cx={card.width}
            cy={(card.height * (1 + index)) / (1 + card.exits.length)}
          />
        ))}
      </g>
    </>
  )
})

export const Cards = () => {
  const cardIds = useModelStore(s => s.cards.map(c => c.id), shallow)
  return (
    <g id="cards">
      {cardIds.map((cardId, cardIndex) => (
        <Card key={cardId} cardIndex={cardIndex} />
      ))}
    </g>
  )
}
