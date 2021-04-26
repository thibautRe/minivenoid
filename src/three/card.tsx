// @ts-check
import React from "react"
import { useGesture } from "react-use-gesture"

import { useZoom } from "./view"
import { getPixelDensityForZoom, positionToGrid, setCursor } from "../utils"
import { CardConnectionDot } from "./cardConnectionDot"
import { useModel } from "../providers/ModelProvider"
import { Card } from "../types"

interface CardProps {
  card: Card
  onChangeCard: (id: Card["id"], setter: (card: Card) => Card) => void
}
const CardComponent = React.memo(function CardMemo({
  card,
  onChangeCard,
}: CardProps) {
  const zoom = useZoom()

  const setPartialCard = (
    getPartial: Partial<Card> | ((card: Card) => Partial<Card>),
  ) =>
    onChangeCard(card.id, c => ({
      ...c,
      ...(typeof getPartial === "function" ? getPartial(c) : getPartial),
    }))

  const bind = useGesture(
    {
      // DEBUG
      // @ts-expect-error events
      onClick: ({ event: { ctrlKey, altKey } }) => {
        if (ctrlKey) {
          setPartialCard({ height: 20 + Math.random() * 400 })
          return
        }

        if (altKey) {
          setPartialCard(c => ({
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
        setPartialCard({
          position: positionToGrid([
            memo[0] + mx / pixelDensity,
            memo[1] + my / pixelDensity,
          ]),
        })
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
        setPartialCard({
          position: [memo[0] + mx / pixelDensity, memo[1] + my / pixelDensity],
        })
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
          // isConnected={connections.some(c => c.to === card.id)}
          isConnected={true}
          variant={card.variant}
          cy={card.height / 2}
        />

        {card.exits.map((exit, index) => (
          <CardConnectionDot
            key={exit.id}
            // isConnected={connections.some(c => exit.id === c.from)}
            isConnected={true}
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
  const { cardMap, setCard } = useModel()
  return (
    <g id="cards">
      {Array.from(cardMap.values()).map(card => (
        <CardComponent key={card.id} card={card} onChangeCard={setCard} />
      ))}
    </g>
  )
}
