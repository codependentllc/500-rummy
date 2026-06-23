# Roadmap Steering

## Current Implementation

The repository currently delivers a playable local 500 Rummy app with setup, AI opponents, scoring, themes, static assets, PWA metadata, a service worker, and unit tests for core game logic.

## Near-Term Recommendations

| Priority | Work | Why |
| --- | --- | --- |
| High | Align README with Next app reality | README currently says Vite while `package.json` runs Next. |
| High | Add deterministic engine test helpers | Random deals make deep turn-flow tests harder. |
| High | Expand discard pickup tests | Buried discard behavior is central and easy to regress. |
| Medium | Define stock exhaustion rule | Current engine blocks stock draw when empty but does not reshuffle/end hand. |
| Medium | Improve accessibility labels | Card/table interactions are visual-heavy. |
| Medium | Validate service worker asset list | Some cached icon paths may not match current public assets. |

## Later Options

- Persist local preferences such as name, avatar, theme, card back, and difficulty.
- Add optional game settings only after [game-rules.md](./game-rules.md) defines supported variants.
- Add animation/sound controls if public sound assets become active in UI.
- Add multiplayer only with an explicit backend/server-authoritative architecture.
- Add richer AI difficulty only after current AI behavior is better covered by tests.

## Non-Goals Until Approved

- Online multiplayer.
- Accounts or cloud saves.
- Monetization flows.
- Rule variants that conflict with current canonical rules.
- Replacing the existing UI framework or rewriting the app shell.

