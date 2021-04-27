import React from "react"

interface CardConnectionDotProps {
  isConnected: boolean
  isSolution: boolean

  cx?: number
  cy?: number
}
export const CardConnectionDot = ({
  isConnected,
  isSolution,
  ...props
}: CardConnectionDotProps) => {
  return (
    <circle
      r={10}
      stroke={isConnected ? (isSolution ? "#7f333e" : "#3d3f4c") : "#666666"}
      fill={isConnected ? (isSolution ? "#7f333e" : "#3d3f4c") : "#FFFFFF"}
      strokeWidth={3}
      {...props}
    />
  )
}
