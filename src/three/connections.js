import React from "react"
import { a, config, interpolate, useSpring } from "react-spring"
import shallow from "zustand/shallow"

import { useModelStore } from "../store"
import { getPixelDensityForZoom } from "../utils"
import { useZoom } from "./view"

const Connection = React.memo(function Connection({ connectionId }) {
  const zoom = useZoom()
  const connection = useModelStore(
    React.useCallback(s => s.connections.find(c => c.id === connectionId), [
      connectionId,
    ]),
  )

  const [fromCard, toCard] = useModelStore(
    s => [
      s.cards.find(c => c.exits.some(e => e.id === connection.from)),
      s.cards.find(c => c.id === connection.to),
    ],
    shallow,
  )

  const exitIndex = fromCard.exits.findIndex(e => e.id === connection.from)
  const { f, t } = useSpring({
    f: [
      fromCard.position[0] + fromCard.width,
      fromCard.position[1] +
        (fromCard.height * (1 + exitIndex)) / (fromCard.exits.length + 1),
    ],
    t: [toCard.position[0], toCard.position[1] + toCard.height / 2],
    config: config.stiff,
  })

  // useFrame(() => {
  //   const [t0, t1] = t.getValue()
  //   const [f0, f1] = f.getValue()
  //   const z = zoom.getValue()

  //   // Optimisation: skip updating if the dependant springs are done
  //   const nextValues = [t0, t1, f0, f1, z]
  //   if (shallow(nextValues, prevValues.current)) return
  //   prevValues.current = nextValues

  //   const dist = Math.hypot(t0 - f0, t1 - f1)
  //   const coeff = Math.min(dist / 4, 200)

  //   // Update bezier curve to current spring values
  //   // bezierCurve.v0.x = 0
  //   // bezierCurve.v0.y = 0
  //   bezierCurve.v1.x = Math.max((t0 - f0) / 2, coeff)
  //   // bezierCurve.v1.y = 0
  //   bezierCurve.v2.x = Math.min((t0 - f0) / 2, t0 - f0 - coeff)
  //   bezierCurve.v2.y = t1 - f1
  //   bezierCurve.v3.x = t0 - f0
  //   bezierCurve.v3.y = t1 - f1
  //   // bezierCurve.updateArcLengths()

  //   // TODO: use Float32Array directly
  //   const arr = []

  //   const width = Math.min(20, 3 / getPixelDensityForZoom(z))

  //   // NOTE: the divisions cannot be changed at runtime for
  //   // the same bufferAttribute
  //   const divisions = 100
  //   let prevPoint = bezierCurve.getPoint(0)
  //   let prevCoTangent = bezierCurve.getTangent(0)
  //   const tmp = prevCoTangent.x
  //   prevCoTangent.x = -prevCoTangent.y
  //   prevCoTangent.y = tmp
  //   prevCoTangent.setLength(width / 2)

  //   for (let i = 1; i <= divisions; i++) {
  //     const currPoint = bezierCurve.getPoint(i / divisions)

  //     // build prevCoTangent from tangent and transform into cotangent
  //     const currCoTangent = bezierCurve.getTangent(i / divisions)
  //     const tmp = currCoTangent.x
  //     currCoTangent.x = -currCoTangent.y
  //     currCoTangent.y = tmp
  //     currCoTangent.setLength(width / 2)

  //     // Add 2 triangles
  //     // prettier-ignore
  //     arr.push(
  //       prevPoint.x - prevCoTangent.x, prevPoint.y - prevCoTangent.y, 0,
  //       currPoint.x + currCoTangent.x, currPoint.y + currCoTangent.y, 0,
  //       prevPoint.x + prevCoTangent.x, prevPoint.y + prevCoTangent.y, 0,

  //       prevPoint.x - prevCoTangent.x, prevPoint.y - prevCoTangent.y, 0,
  //       currPoint.x - currCoTangent.x, currPoint.y - currCoTangent.y, 0,
  //       currPoint.x + currCoTangent.x, currPoint.y + currCoTangent.y, 0,
  //     )

  //     prevPoint = currPoint
  //     prevCoTangent = currCoTangent
  //   }

  //   bufferAttributeRef.current.count = arr.length / 3
  //   bufferAttributeRef.current.array = new Float32Array(arr)
  //   bufferAttributeRef.current.needsUpdate = true

  //   geometryRef.current.computeBoundingSphere()
  // })

  return (
    <a.path
      d={interpolate([f, t], (f, t) => `M ${f[0]},${f[1]} L ${t[0]},${t[1]}`)}
      fill="none"
      // strokeWidth={zoom.interpolate(z =>
      //   Math.min(20, 3 / getPixelDensityForZoom(z)),
      // )}
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
      {connectionIds.map(connId => {
        return <Connection key={connId} connectionId={connId} />
      })}
    </g>
  )
}
