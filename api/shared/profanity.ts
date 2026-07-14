import {
  DataSet,
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const dataset = new DataSet<{ originalWord: string }>().addAll(
  englishDataset,
);

const matcher = new RegExpMatcher({
  ...dataset.build(),
  ...englishRecommendedTransformers,
});

async function isProfaneApi(text: string): Promise<boolean> {
  try {
    // The API's scoring is unreliable on a single word so padding it with
    // a second, harmless word gives it enough context to score correctly.
    const message = text.trim().includes(" ") ? text : `${text} a`;
    const response = await fetch("https://vector.profanity.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { isProfanity?: boolean };
    return data.isProfanity === true;
  } catch {
    return false;
  }
}

export async function containsProfanity(
  text: string,
): Promise<boolean> {
  return matcher.hasMatch(text) || (await isProfaneApi(text));
}

const HAPPY_WORDS = [
  "rainbows",
  "puppies",
  "kittens",
  "sunshine",
  "cupcakes",
  "butterflies",
  "confetti",
  "sparkles",
  "friendship",
  "hugs",
];

function randomHappyWord(): string {
  return HAPPY_WORDS[
    Math.floor(Math.random() * HAPPY_WORDS.length)
  ] as string;
}

export async function censorText(text: string): Promise<string> {
  return (await containsProfanity(text)) ? randomHappyWord() : text;
}
