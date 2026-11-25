import { describe, expect, it } from 'vitest';
import { observability } from './observability';

describe('observability', () => {
  it('is a safe no-op when no keys are configured', () => {
    expect(() => observability.captureError(new Error('x'))).not.toThrow();
    expect(() => observability.track('event', { a: 1 })).not.toThrow();
  });
});
