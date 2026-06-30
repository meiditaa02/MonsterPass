// messageManager.js
// Exports: MessageManager class, MESSAGE_POOL constant

/**
 * The default message pool for all five monster states.
 * Each state has at least 3 distinct messages matching the tone requirements.
 *
 * @type {Record<string, string[]>}
 */
export const MESSAGE_POOL = {
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

/**
 * Manages reactive monster messages, ensuring no immediate repeat per level.
 *
 * @example
 * const manager = new MessageManager(MESSAGE_POOL);
 * manager.getNextMessage('Godlike'); // returns a Godlike message
 * manager.getCurrentMessage();       // returns the same message
 */
export class MessageManager {
  /**
   * @param {Record<string, string[]>} messagePool - A map of StrengthLevel → message strings
   * @throws {Error} If any level's pool has fewer than 3 distinct strings
   */
  constructor(messagePool) {
    // Validate that each level has at least 3 distinct strings
    for (const [level, messages] of Object.entries(messagePool)) {
      const distinct = new Set(messages);
      if (distinct.size < 3) {
        throw new Error(
          `MessageManager: pool for level "${level}" must contain at least 3 distinct strings, ` +
          `but only ${distinct.size} distinct string(s) were found.`
        );
      }
    }

    /** @private */
    this._pool = messagePool;

    /**
     * Tracks the last-shown message index per level to avoid immediate repeats.
     * Initialized to -1 (no message shown yet for that level).
     * @private
     * @type {Map<string, number>}
     */
    this._lastIndexByLevel = new Map(
      Object.keys(messagePool).map((level) => [level, -1])
    );

    /**
     * The most recently returned message string.
     * Defaults to the first Godlike message before any call to getNextMessage().
     * @private
     * @type {string}
     */
    this._currentMessage = messagePool['Godlike'][0];
  }

  /**
   * Returns a randomly selected message for the given level, excluding the
   * most recently shown message for that level (when the pool has > 1 message).
   *
   * @param {string} level - A StrengthLevel key (e.g. 'Godlike', 'Defeated')
   * @returns {string} The selected message string
   * @throws {Error} If `level` is not found in the pool
   */
  getNextMessage(level) {
    const messages = this._pool[level];
    if (!messages) {
      throw new Error(`MessageManager: unknown level "${level}".`);
    }

    const lastIndex = this._lastIndexByLevel.get(level) ?? -1;

    let index;
    if (messages.length === 1) {
      // Only one message — no choice; return it regardless
      index = 0;
    } else {
      // Build a list of candidate indices that excludes the last-shown index
      const candidates = messages
        .map((_, i) => i)
        .filter((i) => i !== lastIndex);

      // Pick a random candidate
      index = candidates[Math.floor(Math.random() * candidates.length)];
    }

    this._lastIndexByLevel.set(level, index);
    this._currentMessage = messages[index];
    return this._currentMessage;
  }

  /**
   * Returns the most recently returned message string.
   * Before any call to getNextMessage(), returns the first Godlike message.
   *
   * @returns {string}
   */
  getCurrentMessage() {
    return this._currentMessage;
  }
}
