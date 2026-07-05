import colorConvert from "color-convert";
import type { RGB } from "color-convert";
import { GetColorName } from "hex-color-to-color-name";
import { getRandomInt } from "./random";

export const getColorName = (color: string) => {
  let hexValue = color.match(/#([a-fA-F0-9]{3,8})/)?.[1];

  if (!hexValue) {
    const rgbMatches = color.match(
      /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*\d{1,3}\s*)*\)/,
    );
    if (!rgbMatches) {
      return color;
    }
    const [, red, green, blue] = rgbMatches;
    if (red && green && blue) {
      const rgb: RGB = [
        parseInt(red),
        parseInt(green),
        parseInt(blue),
      ];
      hexValue = colorConvert.rgb.hex(rgb);
    }
  }

  if (!hexValue) {
    return color;
  }

  const colorName = GetColorName(hexValue);

  const colorsToRename: Record<string, string> = {
    "Japanese Laurel": "Green",
  };
  if (colorName in colorsToRename) {
    return colorsToRename[colorName];
  }
  return colorName;
};

export const getRandomColor = (): [number, number, number] => {
  const red = getRandomInt(0, 255);
  const green = getRandomInt(0, 255);
  const blue = getRandomInt(0, 255);
  const hexTotal = red + green + blue;
  if (hexTotal < 100 || hexTotal > 300) {
    return getRandomColor();
  }
  return [red, green, blue];
};

export const toColorString = ([red, green, blue]: [
  number,
  number,
  number,
]): string => `rgb(${red}, ${green}, ${blue})`;
