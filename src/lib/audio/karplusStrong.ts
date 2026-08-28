export interface KarplusStrongOptions {
  frequency: number;
  sampleRate: number;
  duration: number;
  damping?: number;
  random?: () => number;
}

/**
 * Classic Karplus-Strong plucked-string synthesis: a noise burst one period
 * long is fed through a ring buffer, averaging each sample with its neighbor
 * on every pass — the repeated averaging acts as a lowpass filter, which is
 * what turns raw noise into a decaying, string-like tone.
 */
export function generateKarplusStrongBuffer({
  frequency,
  sampleRate,
  duration,
  damping = 0.5,
  random = Math.random,
}: KarplusStrongOptions): Float32Array<ArrayBuffer> {
  if (frequency <= 0) {
    throw new Error(`Invalid frequency: ${frequency}`);
  }

  const bufferLength = Math.round(sampleRate / frequency);
  const ring = Array.from({ length: bufferLength }, () => random() * 2 - 1);

  const outputLength = Math.round(sampleRate * duration);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const readIndex = i % bufferLength;
    const sample = ring[readIndex];
    output[i] = sample;

    const nextIndex = (readIndex + 1) % bufferLength;
    ring[readIndex] = damping * sample + (1 - damping) * ring[nextIndex];
  }

  return output;
}
