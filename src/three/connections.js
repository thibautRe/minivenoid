import React from "react"
import * as THREE from "three"
import { a, config, interpolate, useSpring } from "react-spring/three"
import { getPixelDensityForZoom, unitYAxisSquareGeom } from "../utils"
import { useZoom } from "./view"

/**
 * 2 Triangles relative to "from" point
 * @param {[number, number]} from
 * @param {[number, number]} to
 * @param {number} width
 */
export const makeThickLineGeometry = (from, to, width) => {
  const vec = [to[0] - from[0], to[1] - from[1]]
  const normal = [vec[1], -vec[0]]
  const vecMagnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1])
  const normalWidth = [
    (normal[0] * (width / 2)) / vecMagnitude,
    (normal[1] * (width / 2)) / vecMagnitude,
  ]

  const p1 = [normalWidth[0], normalWidth[1]]
  const p2 = [
    to[0] - from[0] + normalWidth[0],
    to[1] - from[1] + normalWidth[1],
  ]
  const p3 = [
    to[0] - from[0] - normalWidth[0],
    to[1] - from[1] - normalWidth[1],
  ]
  const p4 = [-normalWidth[0], -normalWidth[1]]
  // prettier-ignore
  return new Float32Array([
    p1[0], p1[1], 0,
    p2[0], p2[1], 0,
    p3[0], p3[1], 0,

    p3[0], p3[1], 0,
    p4[0], p4[1], 0,
    p1[0], p1[1], 0,
  ])
}

const Connection = React.memo(function Connection({ fromCard, toCard }) {
  const zoom = useZoom()
  const { f, t } = useSpring({
    f: [
      fromCard.position[0] + fromCard.width,
      fromCard.position[1] + fromCard.height / 2,
      0,
    ],
    t: [toCard.position[0], toCard.position[1] + toCard.height / 2, 0],
    config: config.stiff,
  })
  return (
    <a.mesh
      geometry={unitYAxisSquareGeom}
      position={f}
      scale-x={interpolate([f, t], (f, t) =>
        Math.sqrt((t[0] - f[0]) ** 2 + (t[1] - f[1]) ** 2),
      )}
      scale-y={zoom.interpolate(z =>
        Math.min(20, 2 * getPixelDensityForZoom(-z)),
      )}
      rotation-z={interpolate([f, t], (f, t) =>
        Math.atan2(t[1] - f[1], t[0] - f[0]),
      )}
    >
      <lineBasicMaterial color="#777" />
    </a.mesh>
  )
})

export const Connections = ({ connections, cards, cardSprings }) => {
  return connections.map(conn => {
    const cardFromId = cards.findIndex(c => c.id === conn.from)
    const cardToId = cards.findIndex(c => c.id === conn.to)
    return (
      <Connection
        key={conn.id}
        fromCard={cards[cardFromId]}
        toCard={cards[cardToId]}
      />
    )
  })
}
