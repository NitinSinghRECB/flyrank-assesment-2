# CLAUDE.md — Project Rules

Rules learned from the FE-05 prompt engineering drill. Each rule is testable and project-specific.

## Form Rules

### 1. Forms use react-hook-form + zod; never uncontrolled inputs
Every form component must use `useForm` from `react-hook-form` with a `zodResolver` and an exported zod schema. Do not use raw `useState` for form fields or inline validation logic. The schema must be exported so tests and other consumers can reference it.

**Fails review if:** A form uses `useState` per field, or validation is done with hand-written `if` checks in the submit handler.

### 2. All `<form>` elements must include `noValidate`
When using JS-based validation (react-hook-form + zod), the `<form>` element must have `noValidate` to prevent native browser constraint validation from competing with zod error messages. Without it, `type="email"` and `type="url"` inputs trigger browser-native validation that suppresses custom error rendering.

**Fails review if:** A `<form>` element using `zodResolver` does not have `noValidate`.

### 3. Every input must have a visible `<label>` with `htmlFor`, and errors must use `aria-describedby` + `role="alert"`
Labels must not be dangling (no `htmlFor` without a matching `id`). Error messages must be rendered in elements with `role="alert"` and linked to the input via `aria-describedby`. Radio groups must use `<fieldset>/<legend>`.

**Fails review if:** An input has no associated label, or error messages are rendered without `role="alert"` and `aria-describedby`.

## Testing Rules

### 4. Every form component must have tests covering: defaults, validation errors, async submit states, and the `onSave` callback
At minimum, test that (a) fields render with correct initial values, (b) required-field errors appear on empty submit, (c) the submit button is disabled during async submission, and (d) `onSave` receives cleaned/trimmed data.

**Fails review if:** A form component is committed without a corresponding `.test.tsx` file, or the test file doesn't cover all four categories.

### 5. Tests using fake timers must pass `advanceTimers: vi.advanceTimersByTime` to `userEvent.setup()`
When `vi.useFakeTimers()` is active, `userEvent` must be configured with `advanceTimers` or interactions will hang. Always pair `vi.useFakeTimers()` in `beforeEach` with `vi.useRealTimers()` in `afterEach`.

**Fails review if:** A test file uses `vi.useFakeTimers()` without configuring `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.
