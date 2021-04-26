import React from "react"
import { a } from "react-spring"

import { getPixelDensityForZoom } from "../utils"
import { useZoom } from "./view"

interface CardConnectionDotProps {
  isConnected: boolean
  variant?: "solution"

  cx?: number
  cy?: number
}
export const CardConnectionDot = ({
  isConnected,
  variant,
  ...props
}: CardConnectionDotProps) => {
  const zoom = useZoom()
  return (
    <a.circle
      r={zoom.interpolate(z => Math.min(6 / getPixelDensityForZoom(z), 30))}
      stroke={
        isConnected
          ? variant === "solution"
            ? "#7f333e"
            : "#3d3f4c"
          : "#666666"
      }
      fill={
        isConnected
          ? variant === "solution"
            ? "#7f333e"
            : "#3d3f4c"
          : "#FFFFFF"
      }
      strokeWidth={3}
      {...props}
    />
  )
}
