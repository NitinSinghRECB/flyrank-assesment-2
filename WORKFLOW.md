# WORKFLOW.md — FE-05 Prompt Engineering Drill

## Overview

This document compares two approaches to building the same feature — a **User Settings form with validation** — using AI assistance. Round One used a single vague prompt ("Make a settings page"). Round Two used a detailed specification with field definitions, validation rules, accessibility constraints, and a test plan. Both rounds were executed in independent sessions on separate git branches to prevent context contamination.

## Diff Summary

`git diff --stat round-one-vague..round-two-precise` shows **9 files changed, +1675 / -64 lines**. The core component diff (`SettingsForm.tsx`) went from **32 lines to 148 lines** — a 4.6× increase that is almost entirely accounted for by validation, accessibility, and async state handling.

## Correctness

Round One produced a form with **two fields** (a theme `<select>` and a notifications checkbox) and a save action of `alert('Saved!')`. There is zero validation. A user can "save" at any time with no feedback beyond a browser alert. There are no text inputs at all — no name, email, or bio — despite these being the most useful parts of a settings form.

Round Two includes five fields with a typed zod schema (`settingsSchema`) that enforces required fields, character limits (2-50 for name, ≤200 for bio), and email format. The diff shows +21 lines of schema code and +14 lines of error rendering that Round One completely lacks. The submit handler simulates a 1-second async save with a loading state and success banner — behavior that Round One doesn't attempt.

## Accessibility

Round One's `<label>Theme</label>` is a dangling label: it has no `htmlFor` and no enclosing relationship with the `<select>`. The checkbox label wraps the input (acceptable) but has no visible error state. Screen reader users get zero feedback on what went wrong because nothing *can* go wrong — there's no validation.

Round Two adds `htmlFor` on every label, `aria-describedby` linking inputs to their error `<span>` elements, `role="alert"` on error messages, `role="status"` on the success banner, and a `<fieldset>/<legend>` group for radio buttons. These are visible in the diff as +6 aria attributes and +3 ARIA roles that Round One has zero of.

## Edge Cases

| Edge case | Round One | Round Two |
|---|---|---|
| Empty required fields | No validation | zod `min()` with specific messages |
| Email format | No email field | zod `.email()` + `noValidate` on form |
| Bio character limit | No bio field | `max(200)` + live counter `{n}/200` |
| Whitespace-only name | N/A | zod `.trim()` strips before validation |
| Double-submit | No protection | Button disabled + "Saving..." text |
| Post-save feedback | `alert()` | Auto-dismissing banner (3s timeout, cleanup via `useEffect`) |

## AI Mistake Caught

The Round Two AI omitted the `noValidate` attribute on the `<form>` element. Without it, the browser's native `type="email"` constraint validation fires *before* react-hook-form/zod, which prevents zod's custom error messages from appearing. In the test suite, this caused the "shows error for invalid email" test to fail — jsdom sanitized the invalid value to empty string, and no error rendered at all. Adding `noValidate` was a one-line fix, but it exposed a real pattern: **when using JS-based validation libraries, you must disable native browser validation or the two systems fight**. This mistake would have shipped silently in Round One because Round One has no validation, no tests, and no email field.

## Review Effort

Round One took under 2 minutes to generate. It also took under 2 minutes to review because there was almost nothing there — but that review *should* have flagged the missing fields, missing validation, missing accessibility, and the `alert()` anti-pattern. In practice, the reviewer would need to rewrite the entire component.

Round Two took ~15 minutes including dependency installation, test writing, and one debug cycle (the `noValidate` fix). But the 9-test suite means the reviewer can verify correctness by running `npx vitest run` instead of manually testing every field. Net review effort is **lower** for Round Two because the tests do the verification work.

## Key Takeaway

Round Two felt slower (15 min vs 2 min) but produced a shippable component. Round One felt fast but produced a prototype that needs a complete rewrite. The time "saved" by a vague prompt is borrowed from the review and rework phase.
