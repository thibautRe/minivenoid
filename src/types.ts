export type Coord = [number, number]

type CardId = string & { __brand: "CardId" }
type ConnectionId = string & { __brand: "ConnectionId" }

interface CardBase {
  id: CardId
  position: Coord
}

export interface CardProblem extends CardBase {
  type: "problem"
  text: string
}

export interface CardSolution extends CardBase {
  type: "solution"
  text: string
}

export type Card = CardProblem | CardSolution

export interface Connection {
  id: ConnectionId
  from: CardId
  to: CardId
}

export interface Model {
  cards: Card[]
  connections: Connection[]
}
