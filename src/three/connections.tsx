import React from "react"
import { useModel } from "../providers/ModelProvider"

import { Card, Connection, Coordinate } from "../types"

interface Props {
  connection: Connection
  fromCard: Card
  toCard: Card
}
const ConnectionComponent = React.memo(function ConnectionComponent({
  connection,
  fromCard,
  toCard,
}: Props) {
  const f: Coordinate = [fromCard.position[0] + 160 / 2, fromCard.position[1]]
  const t: Coordinate = [toCard.position[0] - 160 / 2, toCard.position[1]]
  const halfXDist = Math.abs((t[0] - f[0]) / 2)
  const bezierX = Math.max(50, halfXDist)

  return (
    <path
      d={`
        M ${f[0]} ${f[1]}
        C ${f[0] + bezierX} ${f[1]} ${t[0] - bezierX} ${t[1]} ${t[0]} ${t[1]}
      `}
      fill="none"
      strokeWidth={4}
      stroke={toCard.text === "solution" ? "#7f333e" : "#3d3f4c"}
    />
  )
})

export const Connections = () => {
  const { connectionMap, cardMap } = useModel()

  return (
    <g id="connections">
      {Array.from(connectionMap.values()).map(connection => {
        const from = cardMap.get(connection.from)
        const to = cardMap.get(connection.to)
        if (!from || !to) return null
        return (
          <ConnectionComponent
            key={connection.id}
            connection={connection}
            fromCard={from}
            toCard={to}
          />
        )
      })}
    </g>
  )
}
