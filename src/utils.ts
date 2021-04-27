import { Card, Coord } from "./types"

/**
 * Returns the pixel density for a given zoom level
 */
export const getPixelDensityForZoom = (zoom: number) => Math.exp(zoom)

export const getCanvasPosition = (
  camPos: Coord,
  camZoom: number,
  mousePos: Coord,
  canvasSize: Coord,
) => {
  const [camX, camY] = camPos
  const [clientX, clientY] = mousePos
  const [width, height] = canvasSize
  const [dx, dy] = [clientX - width / 2, clientY - height / 2]
  const pd = getPixelDensityForZoom(-camZoom)
  return [camX + dx * pd, -camY - dy * pd]
}

/**
 * Returns a Bounding Box based on a collection of cards
 */
export const getModelBoundingBox = (cards: Card[]) => {
  const minX = cards.reduce(
    (acc, card) => Math.min(acc, card.position[0]),
    Infinity,
  )
  const maxX = cards.reduce(
    (acc, card) => Math.max(acc, card.position[0]),
    -Infinity,
  )
  const minY = cards.reduce(
    (acc, card) => Math.min(acc, card.position[1]),
    Infinity,
  )
  const maxY = cards.reduce(
    (acc, card) => Math.max(acc, card.position[1]),
    -Infinity,
  )
  return { minX, maxX, minY, maxY }
}

/**
 * Sets the global cursor type
 */
export const setCursor = (cursor?: string) => {
  if (cursor) {
    document.documentElement.style.cursor = cursor
  } else {
    // @ts-expect-error
    document.documentElement.style.cursor = null
  }
}

const pToGrid = (p: number) => Math.round(p / 50) * 50
export const positionToGrid = (pos: Coord): Coord => [
  pToGrid(pos[0]),
  pToGrid(pos[1]),
]
