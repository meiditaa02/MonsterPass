// monsterRenderer.js
// Exports: MonsterRenderer class

/**
 * Maps each StrengthLevel to its corresponding CSS modifier class.
 * @type {Record<string, string>}
 */
const LEVEL_TO_CLASS = {
  Godlike:  'monster--godlike',
  Strong:   'monster--strong',
  Annoyed:  'monster--annoyed',
  Scared:   'monster--scared',
  Defeated: 'monster--defeated',
};

/**
 * Maps each StrengthLevel to the expression emoji displayed inside the monster.
 * @type {Record<string, string>}
 */
const LEVEL_TO_EMOJI = {
  Godlike:  '😈',
  Strong:   '😒',
  Annoyed:  '😠',
  Scared:   '😨',
  Defeated: '😭',
};

/** All recognised monster CSS modifier classes (used for cleanup). */
const ALL_MONSTER_CLASSES = Object.values(LEVEL_TO_CLASS);

/**
 * Duration (ms) of the fallback timer used when `transitionend` never fires.
 * Matches the maximum allowed transition duration from Requirement 3.3.
 */
const TRANSITION_FALLBACK_MS = 600;

/**
 * Manages the #monster DOM element, its CSS state classes, the #monster-face
 * emoji, and the ARIA live region.  Implements the transition-queuing state
 * machine described in the MonsterPass design document.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.2
 */
export class MonsterRenderer {
  /**
   * @param {HTMLElement} containerEl  – The #monster div.
   * @param {HTMLElement} ariaLiveEl   – The #strength-live element.
   */
  constructor(containerEl, ariaLiveEl) {
    this._containerEl = containerEl;
    this._ariaLiveEl  = ariaLiveEl;

    /** @type {string} The level whose CSS class is currently applied. */
    this._currentLevel = 'Godlike';

    /**
     * The level that should be applied once the active transition finishes.
     * `null` means no pending update.
     * @type {string|null}
     */
    this._pendingLevel = null;

    /** Whether a CSS transition is currently in progress. */
    this._transitioning = false;

    /** Handle to the fallback setTimeout, kept so we can cancel it if needed. */
    this._fallbackTimer = null;

    // Listen for transitionend on the container element.
    this._onTransitionEnd = this._handleTransitionEnd.bind(this);
    this._containerEl.addEventListener('transitionend', this._onTransitionEnd);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Requests a state change to `newLevel`.
   *
   * - If no transition is in progress: apply immediately.
   * - If a transition is already running: store as pending (overwrite any
   *   previous pending value — no queue build-up).
   *
   * @param {string} newLevel – One of the StrengthLevel values.
   */
  setState(newLevel) {
    if (!LEVEL_TO_CLASS[newLevel]) {
      // Unknown level — silently ignore to avoid breaking the UI.
      return;
    }

    if (!this._transitioning) {
      this._applyLevel(newLevel);
    } else {
      // Overwrite — only the most recent pending level is kept (Req 3.5).
      this._pendingLevel = newLevel;
    }
  }

  /**
   * Returns the level whose CSS class is currently active on the container.
   * @returns {string}
   */
  getCurrentLevel() {
    return this._currentLevel;
  }

  /**
   * Returns whether a CSS transition is currently in progress.
   * @returns {boolean}
   */
  isTransitioning() {
    return this._transitioning;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Immediately swaps the CSS class, updates the emoji, updates the ARIA live
   * region, and marks the renderer as transitioning.  A fallback timer is
   * started in case `transitionend` never fires (e.g. prefers-reduced-motion
   * set to `reduce` or the element is hidden).
   *
   * @param {string} level
   */
  _applyLevel(level) {
    this._currentLevel  = level;
    this._pendingLevel  = null;
    this._transitioning = true;

    // Swap CSS class: remove all state classes, then add the new one.
    this._containerEl.classList.remove(...ALL_MONSTER_CLASSES);
    this._containerEl.classList.add(LEVEL_TO_CLASS[level]);

    // Update the #monster-face emoji.
    const faceEl = this._containerEl.querySelector('#monster-face');
    if (faceEl) {
      faceEl.textContent = LEVEL_TO_EMOJI[level];
    }

    // Update ARIA live region so assistive technologies announce the change
    // (Req 7.2).
    this._ariaLiveEl.textContent = level;

    // Cancel any previously scheduled fallback before starting a new one.
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
    }

    // Fallback: advance state if transitionend never fires within 600ms.
    this._fallbackTimer = setTimeout(() => {
      this._fallbackTimer = null;
      this._completeTransition();
    }, TRANSITION_FALLBACK_MS);
  }

  /**
   * Called when a transition finishes (either via `transitionend` or the
   * fallback timer).  Clears the transitioning flag and applies any pending
   * level.
   */
  _completeTransition() {
    // Guard: if we've already been called (e.g. both transitionend AND the
    // timer fired), do nothing on the second call.
    if (!this._transitioning) {
      return;
    }

    this._transitioning = false;

    if (this._pendingLevel !== null) {
      const next = this._pendingLevel;
      this._pendingLevel = null;
      this._applyLevel(next);
    }
  }

  /**
   * Handler for the `transitionend` DOM event.
   *
   * `transitionend` fires once per transitioned CSS property, so we guard
   * against processing it multiple times for a single visual transition by
   * checking `this._transitioning`.
   *
   * @param {TransitionEvent} _event
   */
  _handleTransitionEnd(_event) {
    // Cancel the fallback timer — the real event fired first.
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }

    this._completeTransition();
  }
}
