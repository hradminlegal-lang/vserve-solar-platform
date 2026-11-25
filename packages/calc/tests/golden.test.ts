import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as calc from '../src/index';

/**
 * Runs every vector in tests/golden/*.json (generated from docs/calc-reference.js).
 * Only keys present in `expected` are compared; extra output keys (e.g. notes) are allowed.
 * Numbers: within the file's tolerance; integers, strings, booleans and nulls: exact.
 */
const GOLDEN_DIR = join(__dirname, '..', '..', '..', 'tests', 'golden');

interface GoldenFile {
  function: string;
  tolerance: number;
  vectors: { label: string; input: unknown; expected: unknown }[];
}

function compare(actual: unknown, expected: unknown, tol: number, path: string): void {
  if (expected === null) {
    expect(actual, path).toBeNull();
  } else if (typeof expected === 'number') {
    expect(typeof actual, `${path} type`).toBe('number');
    if (Number.isInteger(expected) && Number.isInteger(actual)) {
      expect(actual, path).toBe(expected);
    } else {
      expect(
        Math.abs((actual as number) - expected),
        `${path}: ${actual} vs ${expected}`,
      ).toBeLessThanOrEqual(tol);
    }
  } else if (Array.isArray(expected)) {
    expect(Array.isArray(actual), `${path} is array`).toBe(true);
    expect((actual as unknown[]).length, `${path} length`).toBe(expected.length);
    expected.forEach((e, i) => compare((actual as unknown[])[i], e, tol, `${path}[${i}]`));
  } else if (typeof expected === 'object') {
    expect(actual, `${path} defined`).toBeTypeOf('object');
    for (const [k, v] of Object.entries(expected as Record<string, unknown>)) {
      compare((actual as Record<string, unknown>)[k], v, tol, `${path}.${k}`);
    }
  } else {
    expect(actual, path).toBe(expected);
  }
}

/** Functions whose only argument is itself an array (so `input` must not be spread). */
const SINGLE_ARRAY_ARG = new Set(['applianceLoad', 'systemProduction']);

const files = readdirSync(GOLDEN_DIR).filter((f) => f.endsWith('.json'));

describe('golden vectors', () => {
  it('finds all golden files', () => {
    expect(files.length).toBe(18);
  });

  for (const file of files) {
    const golden = JSON.parse(readFileSync(join(GOLDEN_DIR, file), 'utf8')) as GoldenFile;
    describe(golden.function, () => {
      for (const v of golden.vectors) {
        it(v.label, () => {
          const fn = (calc as unknown as Record<string, (...a: unknown[]) => unknown>)[
            golden.function
          ];
          expect(fn, `export ${golden.function}`).toBeTypeOf('function');
          const args =
            Array.isArray(v.input) && !SINGLE_ARRAY_ARG.has(golden.function) ? v.input : [v.input];
          compare(fn!(...args), v.expected, golden.tolerance, golden.function);
        });
      }
    });
  }
});
