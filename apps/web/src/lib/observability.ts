/**
 * Error reporting and product analytics.
 *
 * Both are off unless their environment variables are set. The real SDKs
 * (Sentry, PostHog) are added in the prompt that first needs them, so this
 * module only defines the interface the app calls and a no-op default.
 */
export interface Observability {
  captureError(error: unknown, context?: Record<string, unknown>): void;
  track(event: string, properties?: Record<string, unknown>): void;
}

export const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
export const posthogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

const noop: Observability = {
  captureError: () => {},
  track: () => {},
};

export const observability: Observability = noop;
