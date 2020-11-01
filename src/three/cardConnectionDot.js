import React from "react"
import { a, useSpring } from "react-spring/three"

import { getPixelDensityForZoom } from "../utils"
import { unitCircle } from "./geometries/unitCircle"
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
    <a.group {...props} position-z={0.1}>
      {/* Outer */}
      <a.mesh
        geometry={unitCircle}
        scale={zoom.interpolate(z => [
          Math.min(6 / getPixelDensityForZoom(z), 30),
          Math.min(6 / getPixelDensityForZoom(z), 30),
          1,
        ])}
      >
        <a.meshBasicMaterial color={outerColor} />
      </a.mesh>

      {/* Inner */}
      <a.mesh
        geometry={unitCircle}
        scale={zoom.interpolate(z => [
          Math.min(5 / getPixelDensityForZoom(z), 24),
          Math.min(5 / getPixelDensityForZoom(z), 24),
          1,
        ])}
        position-z={1e-10}
      >
        <a.meshBasicMaterial color={innerColor} />
      </a.mesh>
    </a.group>
  )
}
