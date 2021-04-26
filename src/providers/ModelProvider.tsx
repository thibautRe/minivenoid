import React from "react"
import { Card, CardExit, Connection, Model } from "../types"

type ModelContext = {
  cardMap: Map<Card["id"], Card>
  connectionMap: Map<Connection["id"], Connection>
  cardFromExitMap: Map<CardExit["id"], Card>
  setCard: (id: Card["id"], setter: (card: Card) => Card) => void
}
const ModelContext = React.createContext<ModelContext>({
  cardMap: new Map(),
  connectionMap: new Map(),
  cardFromExitMap: new Map(),
  setCard: () => {
    throw new Error("Uninitialized context: Cannot set card")
  },
})

interface Props {
  model: Model
  onSetModel: (setter: (model: Model) => Model) => void
}
export const ModelProvider: React.FC<Props> = ({
  model,
  onSetModel,
  children,
}) => {
  const cardMap = React.useMemo(
    () => new Map(model.cards.map(c => [c.id, c])),
    [model.cards],
  )
  const connectionMap = React.useMemo(
    () => new Map(model.connections.map(c => [c.id, c])),
    [model.connections],
  )
  const cardFromExitMap = React.useMemo(
    () => new Map(model.cards.flatMap(c => c.exits.map(e => [e.id, c]))),
    [model.cards],
  )
  // const connectionsForCard = React.useMemo(
  //   () => new Map(model.connections.map(conn => [conn.id])),
  //   [model.cards],
  // )
  const setCard: ModelContext["setCard"] = React.useCallback(
    (cardId, set) =>
      onSetModel(m => ({
        ...m,
        cards: m.cards.map(c => (c.id === cardId ? set(c) : c)),
      })),
    [onSetModel],
  )
  return (
    <ModelContext.Provider
      value={React.useMemo(
        () => ({ cardMap, connectionMap, cardFromExitMap, setCard }),
        [cardMap, connectionMap, cardFromExitMap, setCard],
      )}
    >
      {children}
    </ModelContext.Provider>
  )
}

export const useModel = () => React.useContext(ModelContext)
