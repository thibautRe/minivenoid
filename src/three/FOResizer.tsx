import React from "react"
import { useCameraRef } from "../providers/CameraProvider"
import { getPixelDensityForZoom } from "../utils"

export const FOResizer: React.FC<
  React.SVGAttributes<SVGForeignObjectElement>
> = ({ children, ...props }) => {
  const cameraRef = useCameraRef()
  const foreignObjectRef = React.useRef<SVGForeignObjectElement>(null)
  const innerDivRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (!foreignObjectRef.current || !innerDivRef.current) return
    const divRect = innerDivRef.current.getBoundingClientRect()
    const density = getPixelDensityForZoom(cameraRef.current!.zoom)
    const height = divRect.height / density
    const width = divRect.width / density
    foreignObjectRef.current.setAttribute("width", `${width}`)
    foreignObjectRef.current.setAttribute("height", `${height}`)
    foreignObjectRef.current.setAttribute("x", `${-width / 2}`)
    foreignObjectRef.current.setAttribute("y", `${-height / 2}`)
  })

  return (
    <foreignObject ref={foreignObjectRef} {...props}>
      <div
        style={{ width: "max-content", height: "max-content" }}
        ref={innerDivRef}
      >
        {children}
      </div>
    </foreignObject>
  )
}
