import React from "react"

const ViewContext = React.createContext()

export const ViewProvider = ({ zoom, position, children }) => {
  const value = React.useMemo(() => ({ zoom, position }), [zoom, position])
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

// context hook
export const useView = () => React.useContext(ViewContext)

// convenient hooks
export const useZoom = () => useView().zoom
export const usePosition = () => useView().position
