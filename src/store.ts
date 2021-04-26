// @ts-check
import create from "zustand"
import { Card, Connection } from "./types"
import { positionToGrid } from "./utils"

const newId = function <TBrand = unknown>() {
  return Math.floor(Math.random() * 10000000).toString() as string & {
    __brand: TBrand
  }
}

/**
 * Generates a parametric model
 */
const generateModel = (amt: number, amtConn: number) => {
  const cards = new Array(amt).fill(null).map<Card>((_, i) => ({
    id: newId(),
    position: positionToGrid([
      (0.5 - Math.random()) * Math.sqrt(amt) * 1000,
      (0.5 - Math.random()) * Math.sqrt(amt) * 1000,
    ]),
    height: Math.round((0.5 + Math.random()) * 200),
    width: 120,
    variant: Math.random() > 0.8 ? "solution" : undefined,
    exits: new Array(Math.floor(Math.random() * 4)).fill(null).map(_ => ({
      id: newId(),
    })),
  }))

  const allExits = cards.flatMap(c => c.exits)

  const connections = new Array(Math.round(amtConn))
    .fill(0)
    .map<Connection>(() => {
      return {
        id: newId(),
        from:
          allExits[Math.max(0, Math.floor(Math.random() * allExits.length - 1))]
            .id,
        to: cards[Math.max(0, Math.floor(Math.random() * cards.length - 1))].id,
      }
    })

  return { cards, connections }
}

const loadModel = () => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("model") === "1") {
    return require("./models/1.json")
  } else {
    const amt = parseInt(urlParams.get("amt") ?? "") || 50
    return generateModel(amt, amt * 0.8)
  }
}

const model = loadModel()

type ModelStore = {
  cards: Card[]
  connections: Connection[]
  setCard: (id: string, action: (card: Card) => Card) => void
  addCard: (card: Omit<Card, "id">) => void
}

export const useModelStore = create<ModelStore>((set, get) => ({
  cards: model.cards,
  connections: model.connections,
  setCard: (id, action) => {
    set(state => {
      const cardIndex = state.cards.findIndex(c => c.id === id)
      return {
        cards: [
          ...state.cards.slice(0, cardIndex),
          action(state.cards[cardIndex]),
          ...state.cards.slice(cardIndex + 1),
        ],
      }
    })
  },
  addCard: card => {
    set(state => ({ cards: [...state.cards, { id: newId(), ...card }] }))
  },
  set,
  get,
}))
