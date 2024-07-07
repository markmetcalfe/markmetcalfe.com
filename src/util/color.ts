import colorConvert from 'color-convert'
import { RGB } from 'color-convert/conversions'
import { getRandomInt } from './random'

export const getColorName = (color: string) => {
  let colorName = color
  const rgbMatches = color.match(
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*\d{1,3}\s*)*\)/,
  )
  if (rgbMatches) {
    const rgb: RGB = [
      parseInt(rgbMatches[1]),
      parseInt(rgbMatches[2]),
      parseInt(rgbMatches[3]),
    ]
    colorName = colorConvert.rgb.keyword(rgb)
  }
  const hexMatches = color.match(/#([a-fA-F0-9]{6,8})/)
  if (hexMatches) {
    colorName = colorConvert.hex.keyword(hexMatches[1])
  }
  return colorName
}

export const getRandomColor = (): RGB => {
  const red = getRandomInt(0, 255)
  const green = getRandomInt(0, 255)
  const blue = getRandomInt(0, 255)
  if (red + green + blue < 100) {
    return getRandomColor()
  }
  return [red, green, blue]
}
