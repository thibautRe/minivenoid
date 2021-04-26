import React from "react"
import { a, interpolate, SpringValue } from "react-spring"
import { Coord } from "../types"
import { getPixelDensityForZoom } from "../utils"

interface ViewContext {
  zoom: SpringValue<number>
  position: SpringValue<Coord>
}
// @ts-expect-error init state
const ViewContext = React.createContext<ViewContext>({})

interface ViewProviderProps {
  zoom: SpringValue<number>
  position: SpringValue<Coord>
  children: React.ReactNode | React.ReactNode[]
}
export const ViewProvider = ({
  zoom,
  position,
  children,
}: ViewProviderProps) => {
  const value = React.useMemo(() => ({ zoom, position }), [zoom, position])
  return (
    <ViewContext.Provider value={value}>
      <a.g
        // @ts-expect-error interpolate types are crap
        transform={interpolate(
          [zoom, position],
          (z: number, p: Coord) =>
            `translate(${document.documentElement.clientWidth / 2}, ${
              document.documentElement.clientHeight / 2
            }) scale(${getPixelDensityForZoom(z)}) translate(${-p[0]}, ${
              p[1]
            })`,
        )}
      >
        {children}
      </a.g>
    </ViewContext.Provider>
  )
}

// context hook
export const useView = () => React.useContext(ViewContext)

// convenient hooks
export const useZoom = () => useView().zoom
export const usePosition = () => useView().position
