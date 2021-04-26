import React from "react"
import shallow from "zustand/shallow"

import { useModelStore } from "../store"
import { Coord } from "../types"

interface ConnectionProps {
  connectionIndex: number
}
const Connection = React.memo(function Connection({
  connectionIndex,
}: ConnectionProps) {
  const connection = useModelStore(
    React.useCallback(s => s.connections[connectionIndex], [connectionIndex]),
  )

  const fromCard = useModelStore(
    React.useCallback(
      s => s.cards.find(c => c.exits.some(e => e.id === connection.from))!,
      [connection.from],
    ),
  )
  const toCard = useModelStore(
    React.useCallback(s => s.cards.find(c => c.id === connection.to)!, [
      connection.to,
    ]),
  )

  const exitIndex = fromCard.exits.findIndex(e => e.id === connection.from)
  const f: Coord = [
    fromCard.position[0] + fromCard.width,
    fromCard.position[1] +
      (fromCard.height * (1 + exitIndex)) / (fromCard.exits.length + 1),
  ]
  const t: Coord = [toCard.position[0], toCard.position[1] + toCard.height / 2]

  return (
    <path
      d={`M ${f[0]},${f[1]} L ${t[0]},${t[1]}`}
      fill="none"
      strokeWidth={4}
      stroke={toCard.variant === "solution" ? "#7f333e" : "#3d3f4c"}
    />
  )
})

export const Connections = () => {
  // Mapped picks for performance
  const connectionIds = useModelStore(
    s => s.connections.map(c => c.id),
    shallow,
  )

  return (
    <g id="connections">
      {connectionIds.map((connId, connIndex) => {
        return <Connection key={connId} connectionIndex={connIndex} />
      })}
    </g>
  )
}
