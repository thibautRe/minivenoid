export type Coord = [number, number]

type CardId = string & { __brand: "CardId" }
type CardExitId = string & { __brand: "CardExitId" }
type ConnectionId = string & { __brand: "ConnectionId" }

export interface Card {
  id: CardId
  position: Coord
  height: number // TODO remove
  width: number // TODO remove
  variant?: "solution"
  exits: CardExit[]
}

export interface CardExit {
  id: CardExitId
}

export interface Connection {
  id: ConnectionId
  from: CardExitId
  to: CardId
}

export interface Model {
  cards: Card[]
  connections: Connection[]
}
