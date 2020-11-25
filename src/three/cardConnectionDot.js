import React from "react"
import { a, useSpring } from "react-spring"

import { getPixelDensityForZoom } from "../utils"
import { useZoom } from "./view"

export const CardConnectionDot = ({ isConnected, variant, ...props }) => {
  const zoom = useZoom()
  const { outerColor, innerColor } = useSpring({
    from: {
      outerColor: "#FFFFFF",
      innerColor: "#FFFFFF",
    },
    to: {
      outerColor: isConnected
        ? variant === "solution"
          ? "#7f333e"
          : "#3d3f4c"
        : "#666666",
      innerColor: isConnected
        ? variant === "solution"
          ? "#7f333e"
          : "#3d3f4c"
        : "#FFFFFF",
    },
  })
  return (
    <a.circle
      r={zoom.interpolate(z => Math.min(6 / getPixelDensityForZoom(z), 30))}
      stroke={outerColor}
      fill={innerColor}
      strokeWidth={3}
      {...props}
    />
  )
}
