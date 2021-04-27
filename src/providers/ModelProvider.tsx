import React from "react"
import { Card, Connection, Model } from "../types"

type ModelContext = {
  cardMap: Map<Card["id"], Card>
  connectionMap: Map<Connection["id"], Connection>
  setCard: (id: Card["id"], setter: (card: Card) => Card) => void
}
const ModelContext = React.createContext<ModelContext>({
  cardMap: new Map(),
  connectionMap: new Map(),
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
      value={React.useMemo(() => ({ cardMap, connectionMap, setCard }), [
        cardMap,
        connectionMap,
        setCard,
      ])}
    >
      {children}
    </ModelContext.Provider>
  )
}

export const useModel = () => React.useContext(ModelContext)
