# Implementation Plan: MonsterPass

## Overview

Implement MonsterPass as a single-page HTML5 app using Tailwind CSS (CDN) and Vanilla JavaScript ES modules. The build requires no bundler — everything lives in a small set of files. Implementation proceeds module-by-module (StrengthCalculator → MessageManager → MonsterRenderer → ToggleManager → AppController), then wires them into `index.html`, and closes with accessibility polish.

## Tasks

- [x] 1. Set up project structure and scaffolding
  - Create `index.html` with the skeleton DOM (monster display, reactive message `<p>`, password input, toggle button, ARIA live region) exactly matching the structure defined in the design document
  - Add Tailwind CSS via CDN `<script>` tag
  - Create `js/` directory with empty module files: `strengthCalculator.js`, `messageManager.js`, `monsterRenderer.js`, `toggleManager.js`, `appController.js`, `main.js`
  - Add `css/style.css` with the five `.monster--*` size classes and the shared `transition: all 400ms ease-in-out` rule
  - _Requirements: 1.1, 6.1, 6.2_

- [x] 2. Implement StrengthCalculator module
  - [x] 2.1 Implement `computeScore(value)` in `js/strengthCalculator.js`
    - Guard `null`/`undefined` → treat as empty string
    - Return `{ score: 0, level: 'Godlike' }` for length 0 or 1
    - Award one point each for uppercase, lowercase, digit, and symbol criteria
    - Award one bonus point for length ≥ 12; clamp total to [0, 5]
    - Map score to level using the threshold table (0→Godlike, 1→Strong, 2–3→Annoyed, 4→Scared, 5→Defeated)
    - Export `computeScore` and `StrengthLevel` freeze object
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write property test for short-password zero score (Property 1)
    - **Property 1: Short passwords always score zero**
    - **Validates: Requirements 1.3, 1.4, 2.3**
    - Use `fc.string({ maxLength: 1 })` → assert `score === 0` and `level === 'Godlike'`

  - [ ]* 2.3 Write property test for additive criteria scoring (Property 2)
    - **Property 2: Criteria scoring is additive and accurate**
    - **Validates: Requirements 2.1**
    - Generate strings of length 2–11 with exactly K criteria met; assert `score === K`

  - [ ]* 2.4 Write property test for length bonus (Property 3)
    - **Property 3: Length bonus is exactly one point**
    - **Validates: Requirements 2.2**
    - Take a string of length 2–11, record score S; pad to ≥ 12 chars without new criteria; assert `score === Math.min(S + 1, 5)`

  - [ ]* 2.5 Write property test for score-to-level consistency (Property 4)
    - **Property 4: Score-to-level mapping is always consistent**
    - **Validates: Requirements 2.4**
    - Use `fc.string()` → assert returned level always matches threshold table for returned score

  - [ ]* 2.6 Write property test for non-empty qualifying passwords (Property 5)
    - **Property 5: Non-empty qualifying passwords score above zero**
    - **Validates: Requirements 1.5**
    - Generate strings of length ≥ 2 containing at least one criterion character; assert `score > 0`

  - [ ]* 2.7 Write unit tests for StrengthCalculator
    - `computeScore('')` → `{ score: 0, level: 'Godlike' }`
    - `computeScore('a')` → `{ score: 0, level: 'Godlike' }`
    - `computeScore('aB3!')` → `{ score: 4, level: 'Scared' }`
    - `computeScore('aB3!aB3!aB3!')` → `{ score: 5, level: 'Defeated' }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Checkpoint — Ensure StrengthCalculator tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement MessageManager module
  - [x] 4.1 Implement `MessageManager` class in `js/messageManager.js`
    - Accept a `messagePool` object (`Record<StrengthLevel, string[]>`) in the constructor
    - At construction time, throw a descriptive `Error` if any level's pool contains fewer than 3 distinct strings
    - Maintain `lastIndexByLevel` map (initialized to -1 per level)
    - `getNextMessage(level)`: randomly pick an index ≠ `lastIndexByLevel[level]`; update map; return the string
    - `getCurrentMessage()`: return the most recently returned string (or the initial Godlike message on page load)
    - Define and export `MESSAGE_POOL` constant with all five states (≥ 3 messages each), matching the tone table in requirements
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.2 Write property test for no immediate message repeat (Property 10)
    - **Property 10: Message for the same state is not immediately repeated**
    - **Validates: Requirements 4.3**
    - For any level with pool > 1: call `getNextMessage`, record result, call again; assert second ≠ first

  - [ ]* 4.3 Write property test for message retained on no state change (Property 11)
    - **Property 11: Message is retained when state does not change**
    - **Validates: Requirements 4.4**
    - Call `getNextMessage(level)` once; call `getCurrentMessage()` repeatedly without changing level; assert all returns equal first result

  - [ ]* 4.4 Write unit tests for MessageManager
    - Constructor throws when a pool has < 3 messages
    - After two `getNextMessage` calls on the same level, messages are not identical
    - `getCurrentMessage()` returns same string between level-unchanged calls
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 5. Implement MonsterRenderer module
  - [x] 5.1 Implement `MonsterRenderer` class in `js/monsterRenderer.js`
    - Accept `containerEl` (the `#monster` div) and `ariaLiveEl` (`#strength-live`) in the constructor
    - Maintain `currentLevel`, `pendingLevel`, and `transitioning` internal state
    - `setState(newLevel)`: if `!transitioning`, immediately swap CSS class and update `ariaLiveEl.textContent`; if `transitioning`, store `newLevel` as pending (overwrite, not queue)
    - Listen for `transitionend` on `containerEl`; on fire, clear `transitioning`, apply pending level if any, update ARIA live region
    - Add a fallback `setTimeout` at 600ms to advance state if `transitionend` never fires
    - Update `#monster-face` emoji to match the new level's expression (😈/😒/😠/😨/😭)
    - `getCurrentLevel()` and `isTransitioning()` getters
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.2_

  - [ ]* 5.2 Write property test for monster state mirrors computed level (Property 6)
    - **Property 6: Monster state always mirrors computed strength level**
    - **Validates: Requirements 3.6, 3.1**
    - Use `fc.string()` (non-empty); call `setState(computeScore(s).level)`; assert `containerEl.className` contains the expected `monster--*` class

  - [ ]* 5.3 Write property test for ARIA live region reflects every level change (Property 13)
    - **Property 13: ARIA live region reflects every level change**
    - **Validates: Requirements 7.2**
    - Generate pairs of passwords producing different levels; after `setState`, assert `ariaLiveEl.textContent === newLevel`

  - [ ]* 5.4 Write unit tests for MonsterRenderer
    - `setState('Defeated')` adds `monster--defeated` class and removes others
    - Rapid `setState` calls while transitioning queue only the latest level
    - ARIA live region text matches level name after each transition
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 7.2_

- [x] 6. Implement ToggleManager module
  - [x] 6.1 Implement `ToggleManager` class in `js/toggleManager.js`
    - Accept `inputEl` and `toggleButtonEl` in the constructor
    - `toggle()`: flip `inputEl.type` between `'password'` and `'text'`; update `toggleButtonEl.ariaLabel` to `'Hide password'` or `'Show password'`; update button icon/text accordingly
    - `isVisible()`: return `inputEl.type === 'text'`
    - Toggling must NOT dispatch an `input` event on `inputEl`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.2 Write property test for toggle round-trip (Property 7)
    - **Property 7: Toggle visibility is a perfect round-trip**
    - **Validates: Requirements 5.2, 5.3**
    - Starting from either initial state, calling `toggle()` twice must restore original `inputEl.type`

  - [ ]* 6.3 Write property test for toggle label reflects mode (Property 8)
    - **Property 8: Toggle button label always reflects current mode**
    - **Validates: Requirements 5.4, 7.3**
    - After each `toggle()` call, assert `aria-label` equals `'Show password'` when masked and `'Hide password'` when unmasked

  - [ ]* 6.4 Write property test for toggle no recomputation (Property 9)
    - **Property 9: Toggle does not trigger score recomputation**
    - **Validates: Requirements 5.6**
    - Set a password, record score; call `toggle()`; assert no `input` event fired and score unchanged

  - [ ]* 6.5 Write unit tests for ToggleManager
    - Initial `aria-label` is `'Show password'`
    - `toggle()` switches type from `'password'` to `'text'`
    - `toggle()` again switches back to `'password'`
    - `isVisible()` reflects current state correctly
    - _Requirements: 5.2, 5.3, 5.4, 5.6_

- [x] 7. Checkpoint — Ensure all module tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement AppController and wire everything together
  - [x] 8.1 Implement `AppController` class in `js/appController.js`
    - Accept `{ inputEl, toggleBtn, monsterEl, messageEl, ariaLiveEl }` in constructor
    - `init()`: instantiate `StrengthCalculator` (import), `MessageManager` (with `MESSAGE_POOL`), `MonsterRenderer`, and `ToggleManager`; attach `input` listener on `inputEl` → `handleInput`; attach `click` and `keydown` (Enter/Space) listeners on `toggleBtn` → `handleToggle`
    - `handleInput(e)`: call `computeScore(inputEl.value)`; if level changed, call `MonsterRenderer.setState(level)` and inject `MessageManager.getNextMessage(level)` into `messageEl.textContent`; update internal `currentScore` and `currentLevel`
    - `handleToggle()`: call `ToggleManager.toggle()`; do NOT touch score/level
    - On `init()`, display the initial Godlike message in `messageEl` and set `MonsterRenderer.setState('Godlike')`
    - _Requirements: 1.2, 2.5, 3.4, 4.1, 5.5_

  - [x] 8.2 Write `js/main.js` entry point
    - Query all required DOM elements by ID
    - Instantiate `AppController` and call `init()`
    - _Requirements: 1.1_

  - [ ]* 8.3 Write integration tests for AppController
    - Typing a password triggers monster state change and message update
    - Clearing input returns monster to Godlike state
    - Toggle click updates aria-label without changing score
    - _Requirements: 1.2, 3.4, 5.6_

- [x] 9. Apply visual design and color palette
  - [x] 9.1 Style `index.html` with Tailwind classes for layout and color palette
    - Center all content horizontally and vertically in the viewport using Tailwind flex/grid utilities
    - Apply dusty purple, sage green, warm beige, and soft coral as accent colors (HSL saturation ≤ 60% for all colors)
    - Render the monster using emoji-based illustration as specified in the design data model table
    - Ensure the page displays without horizontal scroll between 320px and 1440px viewport widths
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

  - [x] 9.2 Finalize CSS transitions for monster state changes
    - Verify `css/style.css` `.monster` transition is `400ms ease-in-out` (within 300–600ms requirement)
    - Verify each `monster--*` size class is strictly smaller than the one above it (120 → 96 → 72 → 52 → 36px)
    - Add `@media (prefers-reduced-motion: reduce)` override to instant transition for accessibility
    - _Requirements: 3.2, 3.3, 6.5_

- [x] 10. Implement accessibility requirements
  - [x] 10.1 Add accessible label, ARIA attributes, and keyboard support
    - Confirm `<label for="password-input">` is present and visible, or add `aria-label` if label is visually hidden
    - Confirm `#strength-live` has `aria-live="polite"` and `aria-atomic="true"` and is `.sr-only`
    - Confirm toggle button has correct initial `aria-label="Show password"` and updates on each toggle
    - Confirm toggle button responds to Enter and Space keys (native `<button>` handles this automatically; verify no `type="submit"` conflict)
    - Verify all text elements meet 4.5:1 contrast ratio against their background using the chosen color palette
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breaks
- Property tests validate universal correctness properties using fast-check (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases using Vitest + jsdom
- The project needs `vitest` and `fast-check` as dev dependencies; install them with `npm install --save-dev vitest fast-check` before running tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "4.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "4.4", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "6.4", "6.5", "8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3", "9.1", "9.2"] },
    { "id": 6, "tasks": ["10.1"] }
  ]
}
```
