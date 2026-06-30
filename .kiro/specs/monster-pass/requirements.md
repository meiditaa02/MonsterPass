# Requirements Document

## Introduction

MonsterPass is a single-page password strength checker web app built with HTML5, Tailwind CSS, and Vanilla JavaScript. As the user types a password, a chibi-style monster appears and reacts in real-time — the stronger the password, the weaker and more pitiful the monster becomes. The app combines playful visual feedback with practical password strength guidance, using a cozy-spooky aesthetic with smooth animations and a sarcastic monster personality.

## Glossary

- **App**: The MonsterPass single-page web application
- **Password_Input**: The text input field where the user types a password
- **Strength_Calculator**: The module responsible for computing password strength score from input
- **Monster**: The animated chibi-style character that reacts to password strength
- **Monster_State**: One of five discrete visual and behavioral states the Monster can occupy
- **Strength_Score**: A numeric value from 0–5 representing the computed password strength level
- **Strength_Level**: A named tier corresponding to a Strength_Score: Godlike (0), Strong (1), Annoyed (2–3), Scared (4), Defeated (5)
- **Reactive_Message**: A short sarcastic or dramatic text phrase displayed by the Monster matching the current Monster_State
- **Toggle**: A button that switches the Password_Input between masked and unmasked display
- **Transition**: An animated change between Monster states including size, expression, and color

---

## Requirements

### Requirement 1: Password Input

**User Story:** As a user, I want to type my password into an input field, so that the app can evaluate its strength in real-time.

#### Acceptance Criteria

1. THE App SHALL render a single Password_Input field on page load.
2. WHEN the user types into, pastes into, cuts from, or autofills the Password_Input, THE Strength_Calculator SHALL recompute the Strength_Score in response to the input value change.
3. WHEN the Password_Input is empty, THE Strength_Calculator SHALL return a Strength_Score of 0.
4. WHEN the Password_Input value has a character length of exactly 1, THE Strength_Calculator SHALL return a Strength_Score of 0 regardless of the character used.
5. WHEN the Password_Input value has a character length greater than 1, THE Strength_Calculator SHALL return a Strength_Score greater than 0 if at least one strength criterion is met.
6. THE Password_Input SHALL accept a maximum of 128 characters; any character input beyond 128 SHALL be ignored.
7. THE Password_Input SHALL default to masked display (password type) on page load.

---

### Requirement 2: Password Strength Calculation

**User Story:** As a user, I want the app to evaluate my password across multiple criteria, so that I receive an accurate measure of its strength.

#### Acceptance Criteria

1. THE Strength_Calculator SHALL award one point for each of the following criteria met by the current Password_Input value:
   - Contains at least one uppercase letter (A–Z)
   - Contains at least one lowercase letter (a–z)
   - Contains at least one numeric digit (0–9)
   - Contains at least one symbol (any character that is not a letter or digit)
2. WHEN the Password_Input value has a character length greater than or equal to 12, THE Strength_Calculator SHALL award one additional point, for a maximum Strength_Score of 5.
3. IF the Password_Input value has a character length of 0 or 1, THEN THE Strength_Calculator SHALL return a Strength_Score of 0 regardless of any criteria met.
4. THE Strength_Calculator SHALL map the Strength_Score to a Strength_Level using the following thresholds:
   - Score 0 → Godlike
   - Score 1 → Strong
   - Score 2–3 → Annoyed
   - Score 4 → Scared
   - Score 5 → Defeated
5. WHEN the Password_Input value changes, THE Strength_Calculator SHALL recompute and display the updated Strength_Score within 100ms of the change event.

---

### Requirement 3: Monster State Display

**User Story:** As a user, I want the monster to visually change based on my password strength, so that I get immediate and entertaining feedback.

#### Acceptance Criteria

1. THE Monster SHALL display one of five Monster_States at all times, corresponding to the current Strength_Level.
2. THE Monster SHALL display visually distinct appearances per Monster_State, where each state is unambiguously distinguishable from any other state, and the visual properties follow the relative ordering below:

   | Strength_Level | Size (relative ordering) | Expression character |
   |---|---|---|
   | Godlike | Largest | Menacing |
   | Strong | Second largest | Confident or mocking |
   | Annoyed | Middle | Worried or irritated |
   | Scared | Second smallest | Frightened or distressed |
   | Defeated | Smallest | Dejected or despairing |

   Each Monster_State's rendered size SHALL be strictly smaller than the state above it in the table, such that no two states share the same rendered size.

3. WHEN the Strength_Level changes, THE Monster SHALL transition to the new Monster_State using an animation with a duration of no less than 300ms and no more than 600ms.
4. WHEN the Password_Input is empty, THE Monster SHALL display the Godlike Monster_State.
5. IF the Password_Input is cleared while a Monster Transition animation is in progress, THEN THE Monster SHALL complete the in-progress Transition animation within its remaining duration (not exceeding 600ms total from its start), then transition to the Godlike Monster_State.
6. WHILE the Password_Input is not empty, THE Monster SHALL always reflect the Monster_State that corresponds to the current Strength_Level.

---

### Requirement 4: Reactive Monster Messages

**User Story:** As a user, I want the monster to say funny, sarcastic things as my password changes, so that the experience feels playful and engaging.

#### Acceptance Criteria

1. THE Monster SHALL display a Reactive_Message at all times, beginning from page load using the Godlike Monster_State's message pool.
2. THE App SHALL associate at least three distinct Reactive_Message strings with each Monster_State.
3. WHEN the Monster_State changes, THE Monster SHALL display a Reactive_Message randomly selected from the strings associated with the new Monster_State, excluding the most recently displayed message for that state if more than one message exists for that state.
4. WHEN the Monster_State does not change between input value changes, THE Monster SHALL retain the currently displayed Reactive_Message.
5. THE App SHALL prevent any Monster_State from being entered if fewer than 3 Reactive_Message strings are defined for that state.
6. THE Reactive_Messages for each Monster_State SHALL convey the following tones such that a reviewer can confirm their appropriateness without ambiguity:

   | Monster_State | Message tone |
   |---|---|
   | Godlike | Supremely menacing and dismissive |
   | Strong | Sarcastic and mocking |
   | Annoyed | Irritated but still confident |
   | Scared | Visibly nervous and dramatic |
   | Defeated | Pathetic, crying, and defeated |

---

### Requirement 5: Show/Hide Password Toggle

**User Story:** As a user, I want to toggle password visibility, so that I can verify what I have typed without clearing the field.

#### Acceptance Criteria

1. THE App SHALL render a Toggle button adjacent to the Password_Input.
2. WHEN the user activates the Toggle while the Password_Input is in masked mode, THE App SHALL switch the Password_Input to unmasked display.
3. WHEN the user activates the Toggle while the Password_Input is in unmasked mode, THE App SHALL switch the Password_Input back to masked display.
4. WHEN the Toggle state changes, THE App SHALL update the Toggle's icon or label to reflect the current display mode.
5. THE Toggle SHALL be operable via keyboard activation (Enter or Space key) in addition to mouse click, without requiring any additional user configuration.
6. WHEN the Toggle state changes, THE Strength_Calculator SHALL retain the last computed Strength_Score without triggering a recomputation.

---

### Requirement 6: Visual Design and Layout

**User Story:** As a user, I want the app to feel cohesive and visually appealing, so that using it is a pleasant experience.

#### Acceptance Criteria

1. THE App SHALL render all content on a single page without navigation or routing.
2. THE App SHALL center all content horizontally and vertically within the viewport.
3. THE App SHALL apply a color palette of dusty purple, sage green, warm beige, and soft coral as its primary colors. THE App MAY use additional colors provided all colors used have an HSL saturation value of 60% or below. THE App SHALL NOT use colors with an HSL saturation value above 60%.
4. THE Monster SHALL be rendered using CSS art or an emoji-based illustration.
5. THE App SHALL apply animated transitions to all Monster_State changes, with a total transition duration of no less than 300ms and no more than 600ms.
6. WHEN the viewport width is between 320px and 1440px, THE App SHALL display without horizontal scrolling and without any content being clipped or hidden outside the viewport boundaries.

---

### Requirement 7: Accessibility

**User Story:** As a user with assistive technology, I want the app to communicate password strength without relying solely on visual cues, so that I can use it regardless of my abilities.

#### Acceptance Criteria

1. THE Password_Input SHALL have an accessible label associated via a visible label element or an aria-label attribute that describes its purpose.
2. WHEN the Strength_Level changes, THE App SHALL update an ARIA live region with the new Strength_Level name so assistive technologies announce the change.
3. WHEN the Toggle state changes, THE App SHALL update the Toggle's accessible label to reflect the current display mode (e.g., "Show password" or "Hide password").
4. THE App SHALL maintain a color contrast ratio of at least 4.5:1 between text and its background for all visible text elements.
