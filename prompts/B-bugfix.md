# Bug fix template

Bug: <what happened, where, steps, expected vs actual, screenshot>

1. Reproduce with a failing test first (unit, database or Playwright). Show it failing.
2. Explain the root cause in two or three sentences.
3. Make the smallest fix that passes; no unrelated refactors.
4. List other places with the same mistake.
5. Run all checks; open a PR `fix/<short-name>`.
