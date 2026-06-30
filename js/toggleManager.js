// toggleManager.js
// Exports: ToggleManager class

export class ToggleManager {
  /**
   * @param {HTMLInputElement} inputEl - The password input element
   * @param {HTMLButtonElement} toggleButtonEl - The toggle button element
   */
  constructor(inputEl, toggleButtonEl) {
    this._inputEl = inputEl;
    this._toggleButtonEl = toggleButtonEl;
    // Sync the button label to match the input's initial state
    this._syncButton();
  }

  /**
   * Flip the input type between 'password' and 'text'.
   * Updates aria-label and button icon accordingly.
   * Does NOT dispatch an input event on the input element.
   */
  toggle() {
    this._inputEl.type = this._inputEl.type === 'password' ? 'text' : 'password';
    this._syncButton();
  }

  /**
   * Returns true when the password is currently visible (unmasked).
   * @returns {boolean}
   */
  isVisible() {
    return this._inputEl.type === 'text';
  }

  /**
   * Syncs the toggle button's aria-label and icon to the current input type.
   * Masked  → "Show password" / 👁
   * Visible → "Hide password" / 🙈
   * @private
   */
  _syncButton() {
    if (this.isVisible()) {
      this._toggleButtonEl.ariaLabel = 'Hide password';
      this._toggleButtonEl.textContent = '🙈';
    } else {
      this._toggleButtonEl.ariaLabel = 'Show password';
      this._toggleButtonEl.textContent = '👁';
    }
  }
}
