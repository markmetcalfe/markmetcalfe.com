import { getRandomColor, toColorString } from "./color";
import {
  geometryClasses,
  type GeometryAttributes,
  type GeometryClass,
} from "./geometry";

export const getRandomNum = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const getRandomInt = (min: number, max: number) =>
  Math.floor(getRandomNum(min, max));

export const getRandomBool = () => Math.random() >= 0.5;

export function getRandomValue<T>(values: object | T[]): T {
  if (typeof values === "object") {
    const entries = Object.values(values);
    return entries[getRandomInt(0, entries.length)];
  } else {
    // @ts-expect-error Weirdly being inferred as 'never'
    return values[getRandomInt(0, values.length)];
  }
}

export const getRandomGeometry = (
  randomGeometryClasses?: GeometryClass[],
): GeometryAttributes => {
  const type = getRandomValue(
    randomGeometryClasses ?? geometryClasses,
  );
  return {
    type: type.getName(),
    color: toColorString(getRandomColor()),
    solid: false,
    radius: getRandomNum(4, 8),
    detail: getRandomInt(type.getMinDetail(), type.getMaxDetail()),
    reverseRotation: getRandomBool(),
  };
};
