import { Card, Coordinate, Dimensions } from "./types"

/**
 * Returns the pixel density for a given zoom level
 */
export const getPixelDensityForZoom = (zoom: number) => Math.exp(zoom)

export const getCanvasPosition = (
  camPos: Coordinate,
  camZoom: number,
  mousePos: Coordinate,
  canvasSize: Dimensions,
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
  return cards.reduce(
    (acc, card) => {
      return {
        minX: Math.min(acc.minX, card.position[0]),
        maxX: Math.max(acc.maxX, card.position[0]),
        minY: Math.min(acc.minY, card.position[1]),
        maxY: Math.max(acc.maxY, card.position[1]),
      }
    },
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    },
  )
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
export const positionToGrid = (pos: Coordinate): Coordinate => [
  pToGrid(pos[0]),
  pToGrid(pos[1]),
]
