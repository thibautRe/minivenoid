// @ts-check
import React from "react"
import { a } from "react-spring/three"
import Card from "./card"

const getScale = v => [Math.exp(v / 10), Math.exp(v / 10), 1]

const ThreeApp = ({ zoom, position, cards }) => {
  return (
    <a.group
      scale={zoom.interpolate(getScale)}
      position={position.interpolate((x, y) => [x * 10, y * 10, 0])}
    >
      {cards.map((card, index) => (
        <Card key={card.id} position={[...card.position, index * 1e-10]} />
      ))}
    </a.group>
  )
}

export default ThreeApp
