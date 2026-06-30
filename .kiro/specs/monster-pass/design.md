# Design Document: MonsterPass

## Overview

MonsterPass is a single-page password strength checker built with HTML5, Tailwind CSS, and Vanilla JavaScript. Its defining feature is a chibi-style monster that reacts to password strength in real-time: the stronger the password, the weaker and more defeated the monster becomes. The experience is deliberately playful — a cozy-spooky aesthetic with smooth animations and sarcastic monster messages that make checking password strength entertaining.

### Key Design Goals

- **Zero dependencies beyond Tailwind CSS** — pure Vanilla JS, no frameworks, no bundler required.
- **Real-time responsiveness** — strength score and monster state update within 100ms of any input change.
- **Clear separation of concerns** — the strength calculator, monster renderer, and message system are independent modules that communicate through a thin controller layer.
- **Accessible by default** — ARIA live regions and keyboard operability are first-class requirements, not afterthoughts.

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Markup | HTML5 | Single file, no build step |
| Styling | Tailwind CSS (CDN) | Utility-first, easy to tune color palette |
| Logic | Vanilla JavaScript (ES modules) | No framework overhead for a single-page app |
| Animations | CSS transitions + JS class toggling | Declarative, GPU-accelerated, easy to tune duration |

---

## Architecture

The app follows a simple **event-driven unidirectional data flow**: user input produces a new `Strength_Score`, which drives a state update, which renders new UI.

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│  ┌──────────────┐   input event   ┌──────────────────────┐  │
│  │ Password_    │ ──────────────► │ StrengthCalculator   │  │
│  │ Input (DOM)  │                 │  computeScore(value) │  │
│  └──────────────┘                 └──────────┬───────────┘  │
│  ┌──────────────┐                            │ score + level │
│  │ Toggle btn   │                            ▼               │
│  │ (DOM)        │             ┌──────────────────────────┐   │
│  └──────┬───────┘             │   AppController          │   │
│         │ click/keydown       │   onStrengthChange()     │   │
│         ▼                     └────────┬─────────────────┘   │
│  ┌──────────────┐                      │                     │
│  │ ToggleManager│          ┌───────────┴──────────┐         │
│  └──────────────┘          │                      │         │
│                    ┌───────▼──────┐   ┌───────────▼──────┐  │
│                    │ MonsterRenderer│  │ MessageManager   │  │
│                    │ setState()    │  │ getMessage()      │  │
│                    └───────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User types → `input` event fires on `Password_Input`.
2. `AppController.handleInput(event)` calls `StrengthCalculator.computeScore(value)`.
3. `computeScore` returns `{ score: number, level: StrengthLevel }`.
4. If the level changed, `AppController` calls `MonsterRenderer.setState(level)` and `MessageManager.getNextMessage(level)`.
5. `MonsterRenderer` applies CSS classes to trigger the transition animation and updates the ARIA live region.
6. `MessageManager` picks a new message (excluding the last shown for that state) and the controller injects it into the DOM.

---

## Components and Interfaces

### 1. StrengthCalculator

A pure, stateless module. All logic lives in a single exported function.

```javascript
/**
 * @param {string} value - The current password input value
 * @returns {{ score: number, level: StrengthLevel }}
 */
function computeScore(value)
```

**Algorithm:**
- If `value.length <= 1` → return `{ score: 0, level: 'Godlike' }`.
- Otherwise, count criteria met (each worth 1 point):
  - Has uppercase: `/[A-Z]/`
  - Has lowercase: `/[a-z]/`
  - Has digit: `/[0-9]/`
  - Has symbol: `/[^A-Za-z0-9]/`
- If `value.length >= 12` → add 1 bonus point.
- Score is clamped to [0, 5].
- Map score → level using the threshold table.

### 2. MonsterRenderer

Manages the Monster DOM element. Holds internal state (current level, whether a transition is in progress).

```javascript
class MonsterRenderer {
  constructor(containerEl, ariaLiveEl)
  setState(level: StrengthLevel): void
  getCurrentLevel(): StrengthLevel
  isTransitioning(): boolean
}
```

**State machine behavior:**
- On `setState(newLevel)`:
  - If `isTransitioning()`, queue `newLevel` as pending.
  - On `transitionend`, apply the pending level (if any), then clear pending.
- Each `StrengthLevel` maps to a CSS class (e.g., `monster--godlike`, `monster--defeated`).
- The `transitionend` event drives completion logic, ensuring transitions run 300–600ms as defined in CSS.

### 3. MessageManager

Stateful module. Tracks the last-shown message index per state to avoid repeats.

```javascript
class MessageManager {
  constructor(messagePool: Record<StrengthLevel, string[]>)
  getNextMessage(level: StrengthLevel): string
  getCurrentMessage(): string
}
```

**Selection logic:**
- Maintains `lastIndexByLevel: Map<StrengthLevel, number>` (initialized to -1).
- On `getNextMessage(level)`:
  - Get the pool for `level`.
  - Randomly pick an index that is not `lastIndexByLevel[level]`.
  - Update `lastIndexByLevel[level]`.
  - Return the selected string.

### 4. ToggleManager

Handles show/hide password toggle. Stateless between clicks.

```javascript
class ToggleManager {
  constructor(inputEl, toggleButtonEl)
  toggle(): void
  isVisible(): boolean
}
```

- On `toggle()`: flip `inputEl.type` between `'password'` and `'text'`.
- Update `toggleButtonEl.textContent` / `aria-label` accordingly.
- Does **not** fire an `input` event — the `StrengthCalculator` is not re-invoked.

### 5. AppController

Wires all modules together. Lives in `main.js` (or an IIFE in `index.html`).

```javascript
class AppController {
  constructor({ inputEl, toggleBtn, monsterEl, messageEl, ariaLiveEl })
  init(): void          // attach event listeners
  handleInput(e): void  // called on 'input' event
  handleToggle(): void  // called on toggle click/keydown
}
```

---

## Data Models

### StrengthLevel

An enumerated string union representing the five monster states:

```javascript
const StrengthLevel = Object.freeze({
  GODLIKE:  'Godlike',
  STRONG:   'Strong',
  ANNOYED:  'Annoyed',
  SCARED:   'Scared',
  DEFEATED: 'Defeated',
});
```

### ScoreResult

The return type of `computeScore`:

```javascript
/**
 * @typedef {Object} ScoreResult
 * @property {number} score        - Integer 0–5
 * @property {StrengthLevel} level - Named strength level
 */
```

### Score-to-Level Mapping

| Score | Level |
|---|---|
| 0 | Godlike |
| 1 | Strong |
| 2 | Annoyed |
| 3 | Annoyed |
| 4 | Scared |
| 5 | Defeated |

### Monster Visual Properties

Each state maps to a set of CSS custom properties and utility classes:

| State | Size class | Color accent | Expression emoji |
|---|---|---|---|
| Godlike | `monster--godlike` (120px) | Dusty purple | 😈 |
| Strong | `monster--strong` (96px) | Sage green | 😒 |
| Annoyed | `monster--annoyed` (72px) | Warm beige | 😠 |
| Scared | `monster--scared` (52px) | Soft coral | 😨 |
| Defeated | `monster--defeated` (36px) | Muted grey | 😭 |

### Message Pool (Minimum — 3 per state)

```javascript
const MESSAGE_POOL = {
  Godlike: [
    "You dare type that? Pathetic.",
    "I am eternal. Your password is not.",
    "Come back when you have something worth fearing.",
  ],
  Strong: [
    "Oh, uppercase letters. How original.",
    "Sure, that'll protect you. Probably.",
    "I'm not impressed. I'm never impressed.",
  ],
  Annoyed: [
    "Fine. You added numbers. Congratulations.",
    "Look at you, trying.",
    "I'm getting mildly uncomfortable. Mildly.",
  ],
  Scared: [
    "W-wait... symbols AND length?!",
    "Okay okay okay. That's... not nothing.",
    "I didn't expect you to actually try.",
  ],
  Defeated: [
    "...you win. I can't even look at you.",
    "*sobs in monster*",
    "This is the worst day of my immortal life.",
  ],
};
```

### DOM Structure (Simplified)

```html
<main>
  <!-- Monster Display -->
  <div id="monster" class="monster monster--godlike" aria-hidden="true">
    <span id="monster-face">😈</span>
  </div>

  <!-- Reactive Message -->
  <p id="monster-message" role="status"></p>

  <!-- Password Input Area -->
  <div class="input-wrapper">
    <label for="password-input">Password</label>
    <input id="password-input" type="password" maxlength="128" autocomplete="new-password" />
    <button id="toggle-btn" type="button" aria-label="Show password">👁</button>
  </div>

  <!-- ARIA Live Region -->
  <div id="strength-live" aria-live="polite" aria-atomic="true" class="sr-only"></div>
</main>
```

### CSS Transition Strategy

Monster state transitions are driven by CSS classes and a shared `transition` property:

```css
.monster {
  transition: all 400ms ease-in-out;
}
.monster--godlike  { width: 120px; height: 120px; }
.monster--strong   { width: 96px;  height: 96px;  }
.monster--annoyed  { width: 72px;  height: 72px;  }
.monster--scared   { width: 52px;  height: 52px;  }
.monster--defeated { width: 36px;  height: 36px;  }
```

Tailwind CSS arbitrary values and `@layer components` can override these if needed for fine-grained control.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Short passwords always score zero

*For any* string of length 0 or 1 (regardless of which character(s) it contains), `computeScore` SHALL return `score = 0` and `level = 'Godlike'`.

**Validates: Requirements 1.3, 1.4, 2.3**

---

### Property 2: Criteria scoring is additive and accurate

*For any* password of length 2–11 that meets exactly K out of the four criteria (uppercase, lowercase, digit, symbol), `computeScore` SHALL return `score = K`.

**Validates: Requirements 2.1**

---

### Property 3: Length bonus is exactly one point

*For any* password of length 2–11, `computeScore` returns some score S. Extending that exact password to length ≥ 12 (by appending characters that do not add new criteria) SHALL return `score = min(S + 1, 5)`.

**Validates: Requirements 2.2**

---

### Property 4: Score-to-level mapping is always consistent

*For any* password, the `level` returned by `computeScore` SHALL always equal the expected level for the returned `score` according to the threshold table (0→Godlike, 1→Strong, 2–3→Annoyed, 4→Scared, 5→Defeated). No `score`/`level` pair outside the defined mapping SHALL ever be returned.

**Validates: Requirements 2.4**

---

### Property 5: Non-empty qualifying passwords score above zero

*For any* password of length ≥ 2 that contains at least one character satisfying at least one of the four criteria, `computeScore` SHALL return `score > 0`.

**Validates: Requirements 1.5**

---

### Property 6: Monster state always mirrors computed strength level

*For any* non-empty password string, after the `AppController` processes an `input` event, the monster's displayed state class SHALL equal the `level` returned by `computeScore` for that password value.

**Validates: Requirements 3.6, 3.1**

---

### Property 7: Toggle visibility is a perfect round-trip

*For any* initial visibility state, applying `ToggleManager.toggle()` twice SHALL return the `Password_Input` to its original `type` attribute value (`"password"` or `"text"`). Applying it once SHALL produce the opposite type.

**Validates: Requirements 5.2, 5.3**

---

### Property 8: Toggle button label always reflects current mode

*For any* state of the `ToggleManager`, the Toggle button's `aria-label` SHALL equal `"Show password"` when the input is masked and `"Hide password"` when unmasked.

**Validates: Requirements 5.4, 7.3**

---

### Property 9: Toggle does not trigger score recomputation

*For any* password, the `score` and `level` held by the `AppController` SHALL be identical before and after calling `ToggleManager.toggle()`.

**Validates: Requirements 5.6**

---

### Property 10: Message for the same state is not immediately repeated

*For any* `StrengthLevel` whose message pool contains more than one string, if the monster transitions away from that level and then back, the message selected on the return visit SHALL NOT equal the message that was last shown when the monster was previously in that level.

**Validates: Requirements 4.3**

---

### Property 11: Message is retained when state does not change

*For any* sequence of password inputs that produce no change in `StrengthLevel`, the displayed `Reactive_Message` SHALL remain the same string throughout the sequence.

**Validates: Requirements 4.4**

---

### Property 12: Color palette saturation invariant

*For any* color value defined in the app's CSS (inline styles, Tailwind config, or `<style>` blocks), its HSL saturation SHALL be ≤ 60%.

**Validates: Requirements 6.3**

---

### Property 13: ARIA live region reflects every level change

*For any* password input that causes the computed `StrengthLevel` to differ from the previously displayed level, the ARIA live region element (`#strength-live`) SHALL have its `textContent` updated to the new `StrengthLevel` name.

**Validates: Requirements 7.2**

---

## Error Handling

### Input Validation

- **Oversized input**: The `maxlength="128"` attribute on the DOM input prevents characters beyond 128 from being entered. No JS-side truncation is needed, but `computeScore` defensively treats any value as-is (HTML already enforces the cap).
- **Null/undefined input**: `computeScore` guards against `null`/`undefined` by treating them as empty string → score 0.

### Monster State Transitions

- **Rapid input**: If the user types faster than the transition duration, the `MonsterRenderer` queues only the most recent pending level (not a full queue). Each `transitionend` event processes the latest queued level, preventing stale animations from building up.
- **Missing CSS transition event**: If `transitionend` does not fire (e.g., `prefers-reduced-motion` overrides), a fallback `setTimeout` with the maximum transition duration (600ms) ensures the state machine advances regardless.

### Message Pool Integrity

- **Insufficient messages**: `MessageManager` checks pool size at construction time. If any level's pool has fewer than 3 distinct strings, it throws a descriptive `Error` during initialization, catching misconfiguration early.
- **Single-message pool** (edge case with >1 but <2): The "exclude last" logic gracefully falls back to showing the only message when the pool has exactly 1 item.

### Toggle

- The toggle does not need error handling beyond ensuring it does not re-trigger the `input` event. This is guaranteed by manipulating `inputEl.type` directly (which does not fire `input`).

---

## Testing Strategy

### Overall Approach

MonsterPass is a pure client-side JS app with no backend. The testing strategy uses two complementary layers:

1. **Unit tests (Vitest + jsdom)** — test individual modules in isolation with specific examples and edge cases.
2. **Property-based tests (fast-check)** — verify the universal correctness properties defined above across hundreds of randomized inputs.

Both test layers run in Node.js via Vitest (no browser required for logic tests).

### Property-Based Testing

The app has clear, pure-function logic in `StrengthCalculator` and `MessageManager`, making it well-suited for property-based testing.

**Library**: [fast-check](https://github.com/dubzzz/fast-check) — a mature TypeScript/JS property-based testing library.

**Configuration**: Each property test runs a minimum of **100 iterations** (fast-check default is 100; `numRuns: 100` is set explicitly for clarity).

**Tagging format**: Each property test is tagged with a comment:
```javascript
// Feature: monster-pass, Property N: <property text>
```

**Property test mapping:**

| Property | Test description | Arbitraries used |
|---|---|---|
| P1: Short passwords score zero | `fc.string({ maxLength: 1 })` → score = 0 | `fc.string` |
| P2: Criteria scoring | Generate strings with exactly K criteria | Custom arbitraries for each criterion |
| P3: Length bonus | Short password + pad to ≥ 12 chars | `fc.string` + concat |
| P4: Score→level consistency | Any string → level matches table | `fc.string` |
| P5: Non-empty qualifying passwords | Strings with ≥1 criterion, length ≥2 | `fc.string` with constraints |
| P6: Monster state mirrors level | Any non-empty string → monster class equals level | `fc.string` (non-empty) |
| P7: Toggle round-trip | No input needed — deterministic | Stateful machine check |
| P8: Toggle label reflects mode | After each toggle, assert aria-label | Stateful machine check |
| P9: Toggle no-recompute | Any password + toggle → score unchanged | `fc.string` |
| P10: No immediate message repeat | Any level with pool >1, double-visit | `fc.constantFrom(levels)` |
| P11: Message retained on no state change | Sequence of same-level inputs | `fc.array(fc.string)` |
| P12: Color saturation | All CSS color values | Static analysis of stylesheet |
| P13: ARIA live region | Any input causing level change | `fc.string` pairs producing different levels |

### Unit Tests

Unit tests cover:
- `computeScore('')` → `{ score: 0, level: 'Godlike' }`
- `computeScore('aB3!')` → `{ score: 4, level: 'Scared' }`
- `computeScore('aB3!aB3!aB3!')` → `{ score: 5, level: 'Defeated' }` (meets all 4 criteria + length ≥12)
- `MessageManager` throws on initialization with < 3 messages per pool
- `ToggleManager` toggles from `password` to `text` and back
- DOM: toggle button label is `"Show password"` on page load

### Integration / Accessibility Tests

- ARIA live region text updates when level changes (Playwright or manual test)
- Color contrast ratio ≥ 4.5:1 for all text (axe-core or manual audit)
- Responsive layout at 320px, 768px, 1440px widths (manual or Playwright viewport test)
- 100ms recomputation timing (manual stopwatch or Playwright performance assertion)

### Reduced Motion

If `prefers-reduced-motion: reduce` is active, transitions should complete immediately. A single example test verifies that the `MonsterRenderer` fallback `setTimeout` fires at the correct time.
