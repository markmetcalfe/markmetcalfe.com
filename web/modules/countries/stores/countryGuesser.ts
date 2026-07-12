import { defineStore } from "pinia";
import {
  COUNTRIES,
  isCorrectGuess,
  type Country,
} from "../data/countries";

export type GamePhase = "idle" | "playing" | "ended";

const ROUND_SECONDS = 120;
const CLUE_INTERVAL_SECONDS = 5;
const CLUE_REVEAL_CAP = 0.6;
const TIME_BONUS_SECONDS = 10;
const SKIP_PENALTY_SECONDS = 10;

let tickTimer: ReturnType<typeof setInterval> | undefined;

function shuffledCodes(): string[] {
  const codes = COUNTRIES.map(c => c.code);
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j] as string, codes[i] as string];
  }
  return codes;
}

function countryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export const useCountryGuesserStore = defineStore("countryGuesser", {
  state: () => ({
    phase: "idle" as GamePhase,
    queue: [] as string[],
    currentCode: null as string | null,
    guessedCodes: [] as string[],
    revealedIndices: [] as number[],
    targetElapsedSeconds: 0,
    secondsLeft: ROUND_SECONDS,
    elapsedSeconds: 0,
    skipCount: 0,
    timeBonusSeconds: 0,
    score: 0,
    lastGuessCorrect: null as boolean | null,
  }),

  getters: {
    totalCount: () => COUNTRIES.length,
    guessedCount: state => state.guessedCodes.length,
    currentCountry: state =>
      state.currentCode
        ? countryByCode(state.currentCode)
        : undefined,
    hint(): string {
      const country = this.currentCountry;
      if (!country) {
        return "";
      }
      let letterIndex = -1;
      return country.name
        .split("")
        .map(ch => {
          if (!/[a-zA-Z]/.test(ch)) {
            return ch;
          }
          letterIndex++;
          return this.revealedIndices.includes(letterIndex)
            ? ch
            : "_";
        })
        .join("");
    },
  },

  actions: {
    start() {
      this._stopTimer();
      this.phase = "playing";
      this.queue = shuffledCodes();
      this.guessedCodes = [];
      this.score = 0;
      this.secondsLeft = ROUND_SECONDS;
      this.elapsedSeconds = 0;
      this.skipCount = 0;
      this.timeBonusSeconds = 0;
      this.lastGuessCorrect = null;
      this._nextTarget();
      tickTimer = setInterval(() => this._tick(), 1000);
    },

    stop() {
      this._stopTimer();
      this.phase = "idle";
    },

    submitGuess(rawText: string): boolean {
      const country = this.currentCountry;
      if (!country || this.phase !== "playing") {
        return false;
      }
      const correct = isCorrectGuess(country, rawText);
      this.lastGuessCorrect = correct;
      if (correct) {
        this.guessedCodes.push(country.code);
        this.score += Math.max(
          20,
          100 - 10 * this.revealedIndices.length,
        );
        this.secondsLeft += TIME_BONUS_SECONDS;
        this.timeBonusSeconds += TIME_BONUS_SECONDS;
        this._nextTarget();
      }
      return correct;
    },

    skip() {
      if (!this.currentCode || this.phase !== "playing") {
        return;
      }
      const skipped = this.currentCode;
      this.skipCount++;
      if (this.queue.length > 0) {
        const insertAt =
          1 + Math.floor(Math.random() * this.queue.length);
        this.queue.splice(insertAt, 0, skipped);
      } else {
        this.queue.push(skipped);
      }
      this.secondsLeft -= SKIP_PENALTY_SECONDS;
      if (this.secondsLeft <= 0) {
        this._end();
        return;
      }
      this._nextTarget();
    },

    _nextTarget() {
      const next = this.queue.shift();
      this.currentCode = next ?? null;
      this.revealedIndices = [];
      this.targetElapsedSeconds = 0;
      if (!next) {
        this._end();
      }
    },

    _tick() {
      if (this.phase !== "playing") {
        return;
      }
      this.secondsLeft--;
      this.elapsedSeconds++;
      this.targetElapsedSeconds++;

      const country = this.currentCountry;
      if (
        country &&
        this.targetElapsedSeconds % CLUE_INTERVAL_SECONDS === 0
      ) {
        const letterCount = country.name
          .split("")
          .filter(ch => /[a-zA-Z]/.test(ch)).length;
        const cap = Math.ceil(letterCount * CLUE_REVEAL_CAP);
        if (this.revealedIndices.length < cap) {
          const hidden = Array.from(
            { length: letterCount },
            (_, i) => i,
          ).filter(i => !this.revealedIndices.includes(i));
          if (hidden.length > 0) {
            const pick =
              hidden[Math.floor(Math.random() * hidden.length)];
            this.revealedIndices.push(pick as number);
          }
        }
      }

      if (this.secondsLeft <= 0) {
        this._end();
      }
    },

    _end() {
      this._stopTimer();
      this.phase = "ended";
      this.currentCode = null;
    },

    _stopTimer() {
      clearInterval(tickTimer);
      tickTimer = undefined;
    },
  },
});
