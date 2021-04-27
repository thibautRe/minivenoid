// @ts-check
import React from "react"
import { useGesture } from "react-use-gesture"

import { getPixelDensityForZoom, positionToGrid, setCursor } from "../utils"
import { CardConnectionDot } from "./cardConnectionDot"
import { useModel } from "../providers/ModelProvider"
import { Card } from "../types"
import { useCameraRef } from "../providers/CameraProvider"
import { FOResizer } from "./FOResizer"
import { genText } from "../store"

interface CardProps {
  card: Card
  onChangeCard: (id: Card["id"], setter: (card: Card) => Card) => void
}
const CardComponent = React.memo(function CardMemo({
  card,
  onChangeCard,
}: CardProps) {
  const cameraRef = useCameraRef()

  const setPartialCard = (
    getPartial: Partial<Card> | ((card: Card) => Partial<Card>),
  ) =>
    onChangeCard(card.id, c => ({
      ...c,
      ...(typeof getPartial === "function" ? getPartial(c) : getPartial),
    }))

  const bind = useGesture(
    {
      // @ts-expect-error
      onClick: ({ event: { altKey } }) => {
        if (altKey) {
          setPartialCard({ text: genText() })
        }
      },
      onDragStart: () => {
        setCursor("grabbing")
      },
      onDragEnd: ({ movement: [mx, my], memo }) => {
        setCursor()
        if (!memo) return
        const pixelDensity = getPixelDensityForZoom(
          cameraRef.current?.zoom ?? 0,
        )
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
        const pixelDensity = getPixelDensityForZoom(cameraRef.current!.zoom)
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

        <FOResizer {...bind()}>
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 16,
                width: 160,
                borderRadius: 16,
                boxSizing: "border-box",
                backgroundColor:
                  card.type === "solution" ? "#7f333e" : "#3d3f4c",
                color: "white",
              }}
            >
              <strong>
                {card.type === "solution" ? "Solution" : "Problem"}
              </strong>
              <div style={{ height: 8 }} />
              <span>{card.text}</span>
            </div>
          </div>
        </FOResizer>

        <CardConnectionDot
          // isConnected={connections.some(c => c.to === card.id)}
          isConnected={true}
          isSolution={card.type === "solution"}
          cx={-160 / 2}
        />

        <CardConnectionDot
          // isConnected={connections.some(c => exit.id === c.from)}
          isConnected={true}
          isSolution={card.type === "solution"}
          cx={160 / 2}
        />
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
