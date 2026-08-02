import countriesData from "../../../../shared/countries.json";

export interface Country {
  code: string;
  name: string;
  aliases: string[];
  population: number;
  area: number;
}

export const COUNTRIES: Country[] = countriesData;
