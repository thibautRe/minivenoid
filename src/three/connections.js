import React from "react"
import { a, config, interpolate, useSpring } from "react-spring/three"
import { getPixelDensityForZoom } from "../utils"
import { unitYAxisSquareGeom } from "./geometries/unitSquare"
import { useZoom } from "./view"

const ConnectionLine = ({ from, to }) => {
  const zoom = useZoom()
  return (
    <a.mesh
      geometry={unitYAxisSquareGeom}
      position={from}
      scale-x={interpolate([from, to], (f, t) =>
        Math.sqrt((t[0] - f[0]) ** 2 + (t[1] - f[1]) ** 2),
      )}
      scale-y={zoom.interpolate(z =>
        Math.min(20, 2 * getPixelDensityForZoom(-z)),
      )}
      rotation-z={interpolate([from, to], (f, t) =>
        Math.atan2(t[1] - f[1], t[0] - f[0]),
      )}
    >
      <meshBasicMaterial color="#777" />
    </a.mesh>
  )
}

const Connection = React.memo(function Connection({
  connection,
  fromCard,
  toCard,
}) {
  const exitIndex = fromCard.exits.findIndex(e => e.id === connection.from)
  const { f, t } = useSpring({
    f: [
      fromCard.position[0] + fromCard.width,
      fromCard.position[1] +
        (fromCard.height * (1 + exitIndex)) / (fromCard.exits.length + 1),
      0,
    ],
    t: [toCard.position[0], toCard.position[1] + toCard.height / 2, 0],
    config: config.stiff,
  })
  return <ConnectionLine from={f} to={t} />
})

export const Connections = ({ connections, cards, cardSprings }) => {
  return connections.map(conn => {
    const cardFromId = cards.findIndex(c =>
      c.exits.some(e => e.id === conn.from),
    )
    const cardToId = cards.findIndex(c => c.id === conn.to)
    return (
      <Connection
        key={conn.id}
        connection={conn}
        fromCard={cards[cardFromId]}
        toCard={cards[cardToId]}
      />
    )
  })
}
