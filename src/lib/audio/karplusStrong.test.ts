import { describe, expect, it } from "vitest";
import { generateKarplusStrongBuffer } from "./karplusStrong";

function rms(samples: Float32Array): number {
  const sumSquares = samples.reduce((sum, s) => sum + s * s, 0);
  return Math.sqrt(sumSquares / samples.length);
}

describe("generateKarplusStrongBuffer", () => {
  it("returns a buffer of the requested duration at the given sample rate", () => {
    expect(generateKarplusStrongBuffer({ frequency: 220, sampleRate: 44100, duration: 1 })).toHaveLength(44100);
    expect(generateKarplusStrongBuffer({ frequency: 220, sampleRate: 48000, duration: 0.5 })).toHaveLength(24000);
    expect(generateKarplusStrongBuffer({ frequency: 110, sampleRate: 44100, duration: 0.3 })).toHaveLength(
      Math.round(44100 * 0.3)
    );
  });

  it("holds a constant 1 when the injected random source always returns 1", () => {
    const buffer = generateKarplusStrongBuffer({
      frequency: 220,
      sampleRate: 44100,
      duration: 0.1,
      random: () => 1,
    });
    expect(buffer.every((s) => s === 1)).toBe(true);
  });

  it("holds a constant -1 when the injected random source always returns 0", () => {
    const buffer = generateKarplusStrongBuffer({
      frequency: 220,
      sampleRate: 44100,
      duration: 0.1,
      random: () => 0,
    });
    expect(buffer.every((s) => s === -1)).toBe(true);
  });

  it("is deterministic given the same injected random source", () => {
    const values = [0.1, 0.9, 0.4, 0.6, 0.2, 0.7, 0.3, 0.5];
    const makeRandom = () => {
      let i = 0;
      return () => values[i++ % values.length];
    };
    const a = generateKarplusStrongBuffer({ frequency: 220, sampleRate: 44100, duration: 0.05, random: makeRandom() });
    const b = generateKarplusStrongBuffer({ frequency: 220, sampleRate: 44100, duration: 0.05, random: makeRandom() });
    expect(a).toEqual(b);
  });

  it("keeps every sample within [-1, 1]", () => {
    const buffer = generateKarplusStrongBuffer({ frequency: 220, sampleRate: 44100, duration: 0.5 });
    expect(buffer.every((s) => s >= -1 && s <= 1)).toBe(true);
  });

  it("decays: the back half carries less energy than the front half", () => {
    const buffer = generateKarplusStrongBuffer({ frequency: 220, sampleRate: 44100, duration: 1 });
    const half = Math.floor(buffer.length / 2);
    const front = buffer.subarray(0, half);
    const back = buffer.subarray(half);
    expect(rms(back)).toBeLessThan(rms(front));
  });

  it("throws for a non-positive frequency", () => {
    expect(() => generateKarplusStrongBuffer({ frequency: 0, sampleRate: 44100, duration: 1 })).toThrow();
    expect(() => generateKarplusStrongBuffer({ frequency: -10, sampleRate: 44100, duration: 1 })).toThrow();
  });
});
