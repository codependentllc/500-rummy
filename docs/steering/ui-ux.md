# UI/UX Steering

## Current Implementation

The app uses a custom mobile-first card table interface in `src/components/rummy` and `src/styles/rummy.css`.

| Flow | Components |
| --- | --- |
| Entry/setup | `WelcomeScreen`, `PlayerSetupScreen`, `OpponentSetupScreen`, `TableThemeScreen`, `CardBackScreen`, `SetupFrame` |
| Avatar selection | `AvatarCarousel`, `AvatarImage`, `SeatEditor` |
| Gameplay | `GameScreen`, `CardView`, `DiscardViewer`, `ScoreModal`, `BrandHeader` |
| PWA behavior | `RegisterServiceWorker`, `src/app/manifest.ts`, `public/sw.js` |

## Interaction Model

- Human player is always player `0`.
- Stock can be clicked with the Draw button or dragged to the hand.
- Discard pile can be opened to inspect legal pickup options.
- Hand cards can be clicked/tapped to select.
- A selected hand card can be dragged to discard after drawing.
- Actions are represented by enabled/disabled buttons: Draw, Meld, Lay Off, Discard.
- Hand sorting modes are Suit, Rank, and Group.
- End-of-hand and game-over states use `ScoreModal`.

## Visual System

- Theme and card back choices are data-driven from `src/data/themes.ts`.
- Avatars are data-driven from `src/data/avatars.ts`.
- Most styling is centralized in `src/styles/rummy.css`.
- The game relies on real raster assets in `public` for avatars, icons, backgrounds, and app art.

## Product Copy

Keep gameplay copy short and state-based:

- Use `game.message` for immediate result feedback.
- Avoid explaining all rules on-screen during normal play.
- Button labels should be action verbs or compact nouns.

## Recommended Next Steps

- Audit touch targets and card overlap on small screens after changes to `GameScreen` or CSS.
- Add accessibility labels where buttons depend on visual card state.
- Consider a compact rules modal only if user testing shows confusion around discard pickup or layoff.
- Avoid duplicating rule logic in components; use rule/engine helpers for enabled states.

