import countriesData from "../../../../shared/countries.json";

export interface Country {
  code: string;
  name: string;
  aliases: string[];
}

export const COUNTRIES: Country[] = countriesData;
