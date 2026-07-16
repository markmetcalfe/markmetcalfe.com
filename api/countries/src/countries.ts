import countriesData from "../../../shared/countries.json";

export interface Country {
  code: string;
  name: string;
  aliases: string[];
}

export const COUNTRIES: Country[] = countriesData;

export function normalizeGuess(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function isCorrectGuess(
  country: Country,
  guess: string,
): boolean {
  const normalized = normalizeGuess(guess);
  if (!normalized) {
    return false;
  }
  return [country.name, ...country.aliases].some(
    candidate => normalizeGuess(candidate) === normalized,
  );
}
