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

  console.log("connection update");

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
      <lineBasicMaterial attach="material" color="#999" />
    </line>
  )
})

export const Connections = ({ connections, cards }) => {
  return (
    <>
      {connections.map(conn => (
        <Connection
          key={conn.id}
          fromPosition={cards[conn.from].position}
          toPosition={cards[conn.to].position}
        />
      ))}
    </>
  )
}
