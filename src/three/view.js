import React from "react"
import { a, interpolate } from "react-spring"
import { getPixelDensityForZoom } from "../utils"

const ViewContext = React.createContext()

export const ViewProvider = ({ zoom, position, children }) => {
  const value = React.useMemo(() => ({ zoom, position }), [zoom, position])
  return (
    <ViewContext.Provider value={value}>
      <a.g
        transform={interpolate(
          [zoom, position],
          (z, p) =>
            `translate(${document.documentElement.clientWidth/2}, ${document
              .documentElement.clientHeight/2}) scale(${getPixelDensityForZoom(
              z,
            )}) translate(${-p[0]}, ${p[1]})`,
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
