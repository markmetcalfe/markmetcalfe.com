import { Filter } from "bad-words";

const filter = new Filter();

export function isProfane(text: string): boolean {
  return filter.isProfane(text);
}
