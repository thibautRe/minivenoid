// @ts-check
import React from "react"
import { a, interpolate } from "react-spring/three"
import { useResource } from "react-three-fiber"

import Card, { CardBufferGeometry } from "./card"

/** @param {number} z */
const getScale = z => [2 ** -z, 2 ** -z, 1]

const ThreeApp = ({ zoom, position, cards }) => {
  const [cardRef, cardGeometry] = useResource()
  const [cardMaterialRef, cardMaterial] = useResource()
  const [cardHoverMaterialRef, cardHoverMaterial] = useResource()
  return (
    <a.group
      position={interpolate([zoom, position], (z, [x, y]) => [
        x * 10 * 2 ** -z,
        y * 10 * 2 ** -z,
        0,
      ])}
      scale={zoom.interpolate(getScale)}
    >
      <CardBufferGeometry ref={cardRef} />
      <meshBasicMaterial ref={cardMaterialRef} color="#222" opacity={0.7} />
      <meshBasicMaterial ref={cardHoverMaterialRef} color="#222" />
      {cards.map((card, index) => (
        <Card
          key={card.id}
          position={[...card.position, index * 1e-10]}
          geometry={cardGeometry}
          material={cardMaterial}
          hoverMaterial={cardHoverMaterial}
        />
      ))}
    </a.group>
  )
}

export default ThreeApp
