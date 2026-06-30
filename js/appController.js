// appController.js
// Exports: AppController class

import { computeScore } from './strengthCalculator.js';
import { MessageManager, MESSAGE_POOL } from './messageManager.js';
import { MonsterRenderer } from './monsterRenderer.js';
import { ToggleManager } from './toggleManager.js';

/**
 * Wires all MonsterPass modules together and manages top-level event handling.
 *
 * Data flow:
 *   input event → computeScore(value) → if level changed →
 *     MonsterRenderer.setState(level) + MessageManager.getNextMessage(level)
 *     → messageEl.textContent
 *
 * Toggle flow:
 *   click / keydown (Enter|Space) on toggleBtn → ToggleManager.toggle()
 *   No score recomputation occurs.
 *
 * Requirements: 1.2, 2.5, 3.4, 4.1, 5.5
 */
export class AppController {
  /**
   * @param {object} params
   * @param {HTMLInputElement}  params.inputEl    – The password <input> element.
   * @param {HTMLButtonElement} params.toggleBtn  – The show/hide toggle button.
   * @param {HTMLElement}       params.monsterEl  – The #monster container div.
   * @param {HTMLElement}       params.messageEl  – The <p> that shows the reactive message.
   * @param {HTMLElement}       params.ariaLiveEl – The #strength-live ARIA live region.
   */
  constructor({ inputEl, toggleBtn, monsterEl, messageEl, ariaLiveEl }) {
    this._inputEl    = inputEl;
    this._toggleBtn  = toggleBtn;
    this._monsterEl  = monsterEl;
    this._messageEl  = messageEl;
    this._ariaLiveEl = ariaLiveEl;

    /** Last computed strength score. Initialised to Godlike state (score 0). */
    this._currentScore = 0;

    /** Last computed strength level. Initialised to 'Godlike'. */
    this._currentLevel = 'Godlike';

    // Module instances — populated in init().
    this._messageManager  = null;
    this._monsterRenderer = null;
    this._toggleManager   = null;

    // Bind handlers so the same reference can be used for removal if needed.
    this._handleInput  = this._handleInput.bind(this);
    this._handleToggle = this._handleToggle.bind(this);
  }

  /**
   * Initialises all sub-modules, attaches DOM event listeners, and sets the
   * initial Godlike state so the monster and message are visible on page load.
   */
  init() {
    // Instantiate sub-modules.
    this._messageManager  = new MessageManager(MESSAGE_POOL);
    this._monsterRenderer = new MonsterRenderer(this._monsterEl, this._ariaLiveEl);
    this._toggleManager   = new ToggleManager(this._inputEl, this._toggleBtn);

    // Attach input listener — fires on typing, paste, cut, and autofill.
    this._inputEl.addEventListener('input', this._handleInput);

    // Attach toggle listeners.
    // The native <button> element already fires 'click' on Enter/Space, but
    // we add an explicit 'keydown' handler to cover Requirement 5.5 explicitly.
    this._toggleBtn.addEventListener('click', this._handleToggle);
    this._toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // prevent page scroll on Space
        this._handleToggle();
      }
    });

    // Set initial Godlike state: monster visual + first message (Req 3.4, 4.1).
    this._monsterRenderer.setState('Godlike');
    this._messageEl.textContent = this._messageManager.getNextMessage('Godlike');
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  /**
   * Handles every `input` event on the password field.
   *
   * Recomputes the strength score; if the level changed, updates the monster
   * state and picks a new reactive message.  Always keeps `_currentScore` and
   * `_currentLevel` in sync.
   *
   * @param {Event} _e – The native input event (unused; value read from DOM).
   */
  _handleInput(_e) {
    const { score, level } = computeScore(this._inputEl.value);

    if (level !== this._currentLevel) {
      // Level changed — update monster and message.
      this._monsterRenderer.setState(level);
      this._messageEl.textContent = this._messageManager.getNextMessage(level);
    }
    // Always update internal score/level so the next comparison is accurate.
    this._currentScore = score;
    this._currentLevel = level;
  }

  /**
   * Handles toggle click / keyboard activation.
   *
   * Delegates entirely to ToggleManager.  Does NOT touch score or level
   * (Requirement 5.6).
   */
  _handleToggle() {
    this._toggleManager.toggle();
  }
}
