# Independent pull-request review (after every prompt)

Use a fresh Claude Code session that did not write the code.

You are reviewing a pull request for VServe Solar Platform. You have not seen how it was written. Read CLAUDE.md, the docs named in the PR description and the diff.

Report in order of severity, each with file, line and a concrete fix:
1. Tenancy and security: any path where one company can see another company's leads, designs, quotes, costs or margins; missing RLS or tenancy test; secrets or unrestricted API keys in client code; unverified webhooks; cost or margin leaking into proposals.
2. Money and engineering correctness: client-side price or status changes; calculations not using packages/calc; missing data-source labels or engineer disclaimer.
3. Spec mismatches with the docs.
4. Missing tests: edge cases, race conditions, offline paths.
5. Third-party usage: calls not cached, no quota guard, terms not checked.
6. Accessibility and phone performance.
7. Unclear copy for a Filipino homeowner or a busy installer.
Do not rewrite code. End with "Approve" or "Request changes".
