import { Card, Connection, Model } from "./types"
import { positionToGrid } from "./utils"

const newId = function <TBrand = unknown>() {
  return Math.floor(Math.random() * 10000000).toString() as string & {
    __brand: TBrand
  }
}

const baseTextSplit = `Spicy jalapeno bacon ipsum dolor amet dolore shoulder spare ribs enim tenderloin jerky. Doner enim beef ribs incididunt laboris t-bone ea dolore consectetur turducken short loin. Ut short loin bacon excepteur id ham hock flank culpa brisket. Swine velit cupidatat, qui leberkas ad andouille lorem hamburger labore pancetta sunt in fatback tri-tip. Lorem porchetta minim cupim. Fatback pork chop beef, qui culpa ham ullamco.`.split(
  " ",
)

export const genText = () =>
  baseTextSplit
    .filter(() => Math.random() < 0.2)
    .sort(() => Math.random() - 0.5)
    .join(" ")

/**
 * Generates a parametric model
 */
const generateModel = (amt: number, amtConn: number): Model => {
  const cards = new Array(amt).fill(null).map<Card>((_, i) => ({
    id: newId(),
    position: positionToGrid([
      (0.5 - Math.random()) * Math.sqrt(amt) * 1000,
      (0.5 - Math.random()) * Math.sqrt(amt) * 1000,
    ]),
    type: Math.random() > 0.8 ? "solution" : "problem",
    text: genText(),
  }))

  const connections = new Array(Math.round(amtConn))
    .fill(0)
    .map<Connection>(() => {
      return {
        id: newId(),
        from:
          cards[Math.max(0, Math.floor(Math.random() * cards.length - 1))].id,
        to: cards[Math.max(0, Math.floor(Math.random() * cards.length - 1))].id,
      }
    })

  return { cards, connections }
}

const loadModel = (): Model => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("model") === "1") {
    return require("./models/1.json")
  } else {
    const amt = parseInt(urlParams.get("amt") ?? "") || 50
    return generateModel(amt, amt * 0.8)
  }
}

export const model = loadModel()
