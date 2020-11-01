import React from "react"
import * as THREE from "three"
import { a, config, interpolate, useSpring } from "react-spring/three"
import { get2dCubicBezier, getPixelDensityForZoom } from "../utils"
import { unitYAxisSquareGeom } from "./geometries/unitSquare"
import { useZoom } from "./view"

const material = new THREE.MeshBasicMaterial({ color: "#333" })
const ConnectionLine = ({ from, to }) => {
  const zoom = useZoom()
  return (
    <a.mesh
      geometry={unitYAxisSquareGeom}
      material={material}
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
    />
  )
}

const BezierConnectionLine = ({ from, to, resolution = 10 }) => {
  return new Array(resolution)
    .fill()
    .map((_, i, arr) => (
      <ConnectionLine
        key={i}
        from={interpolate([from, to], (f, t) =>
          get2dCubicBezier(
            f,
            [Math.max((f[0] + t[0]) / 2, f[0] + 50), f[1]],
            [Math.min((f[0] + t[0]) / 2, t[0] - 50), t[1]],
            t,
          )(i / arr.length),
        )}
        to={interpolate([from, to], (f, t) =>
          get2dCubicBezier(
            f,
            [Math.max((f[0] + t[0]) / 2, f[0] + 50), f[1]],
            [Math.min((f[0] + t[0]) / 2, t[0] - 50), t[1]],
            t,
          )((i + 1) / arr.length),
        )}
      />
    ))
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
  return <BezierConnectionLine from={f} to={t} />
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
