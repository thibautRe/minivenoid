// @ts-check
import React from "react"
import Card from "./card"

const cards = new Array(400).fill().map(() => ({
  position: [(0.5 - Math.random()) * 10000, (0.5 - Math.random()) * 6000],
  id: Math.random().toString(),
}))

/**
 * @param {object} props
 * @param {number} zoom
 */
const ThreeApp = ({ zoom }) => {
  return (
    <group scale={[zoom, zoom, 1]}>
      {cards.map((card, index) => (
        <Card key={card.id} position={[...card.position, index * 1e-10]} />
      ))}
    </group>
  )
}

export default ThreeApp
