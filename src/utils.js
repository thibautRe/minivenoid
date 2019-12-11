/**
 * Returns the pixel density for a given zoom level
 * @param {number} zoom
 */
export const getPixelDensityForZoom = zoom => Math.exp(zoom)
