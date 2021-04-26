import React from "react"

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
  return (
    <circle
      r={10}
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
