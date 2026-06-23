# TODOS

## Presenter / Fullscreen Mode
**What:** A "Present" button that triggers `document.requestFullscreen()` and hides all editor chrome (NavBar, editing controls).
**Why:** The D8 fix hides the NavBar in game mode, but a dedicated button makes the fullscreen entry point obvious to the host without needing to know F11.
**Pros:** Self-documenting; no browser shortcut knowledge required.
**Cons:** ~1 hour of work; incremental over the D8 NavBar fix.
**Context:** NavBar is hidden in Game mode (D8). The "Present" button is an additional polish step, not a blocker. Place button in the PlayerPanel or at the top-right of Game mode.
**Depends on:** T4 (NavBar hidden in Game mode) must land first.

## ARIA Accessibility Pass
**What:** Add `role="grid"`, `role="gridcell"`, `aria-label` attributes to the game board. Add `aria-live="polite"` to the score display so screen readers announce score changes.
**Why:** The app currently has no ARIA landmarks. Not blocking for a personal game-night tool, but 30-minute investment that makes the app keyboard-navigable.
**Cons:** Low priority — single user with mouse/trackpad.
**Depends on:** All core components shipped first (Step 9 polish).

## Double Daily (Wager Mechanic)
**What:** Mark specific tiles as "Double Daily" in the editor. Before the clue reveals, the player inputs a wager (up to their score or the max board value, whichever is higher).
**Why:** Authentic Jeopardy experience; common game-night expectation.
**Pros:** Authentic feel; well-understood mechanic.
**Cons:** Adds a new state to ClueModal (wager input before Question state); editor needs a per-tile toggle.
**Context:** Explicitly deferred in the design doc. The ClueModal state machine (T2, step 3) must be stable before adding a new pre-state.
**Depends on:** Core ClueModal state machine must be shipped and stable first.
