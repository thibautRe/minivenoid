import React from "react"
import { useUpdate } from "react-three-fiber"

const Connection = React.memo(function Connection({
  fromPosition,
  toPosition,
}) {
  const geomRef = React.useRef(null)
  // prettier-ignore
  const connectionBufferGeom = new Float32Array([
    ...fromPosition, 0,
    ...toPosition, 0,
  ])

  const attributeRef = useUpdate(
    attribute => {
      attribute.needsUpdate = true
    },
    [fromPosition, toPosition],
  )

  return (
    <line>
      <bufferGeometry ref={geomRef} attach="geometry">
        <bufferAttribute
          ref={attributeRef}
          attachObject={["attributes", "position"]}
          array={connectionBufferGeom}
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#333" />
    </line>
  )
})

export const Connections = ({ connections, cards }) => {
  return (
    <>
      {connections.map(conn => (
        <Connection
          key={conn.id}
          fromPosition={cards.find(c => c.id === conn.from).position}
          toPosition={cards.find(c => c.id === conn.to).position}
        />
      ))}
    </>
  )
}
