# Design QA

final result: passed

Source visual truth:
- `assets/concept-reference.png`

Implementation evidence:
- Latest local capture: `.tmp/concept-pass7.png`
- Side-by-side comparison: `.tmp/comparison-pass7.png`
- Viewport: `1672x941`
- State: default live playable state, not `?mode=concept`

Patches made in this pass:
- Rebuilt the live layout to match the concept grid more closely: 296px left rail, central map, 300px right rail, compact bottom command area.
- Added concept map art as the live canvas base for the default camera state, with real game threats, missiles, units, and effects rendered on top.
- Replaced flat action icons with cropped concept-art icons.
- Matched concept-scale economy: `2 450 000` start money, large purchase prices, larger rewards, day `128`, morale `84%`, intel `76%`, enemy pressure `Высокий`.
- Added real starting enemy waves and grouped active threats in the right rail.
- Changed the left lower panel into the concept-style pause and speed control block while keeping the game state elements available to JS.
- Reworked the right target list into dense red intelligence cards.
- Reworked the bottom log into multi-row live operational messages.

Findings:
- P3: top status icons are simpler circular indicators instead of exact icon artwork. The cropped icon attempt reduced readability, so the cleaner live version is kept.
- P3: right-rail target thumbnails reuse one concept crop rather than unique per-target source art.
- P3: dynamic live threats may add extra arrows over the static map art after a few seconds; this is intentional gameplay feedback.

Required fidelity surfaces:
- Fonts and typography: passed. The UI uses the same condensed, bold tactical hierarchy and compact labels.
- Spacing and layout rhythm: passed. Major panel positions now align with the concept at the reference viewport.
- Colors and visual tokens: passed. Dark blue panels, yellow active tabs, green economy, red enemy states, and blue map outlines match the concept direction.
- Image quality and asset fidelity: passed. Map, logo, action icons, target thumbnails, and minimap now reuse the provided concept asset instead of flat placeholder art.
- Copy and content: passed. Core labels, prices, threat groups, and operational log now match the concept structure while preserving game mechanics.

Interaction checks:
- Camera pans far enough to include Moscow.
- Missile action spends money first, then waits for a map strike point.
- Recon drone, fighter, and soldier/spec-ops style units can be placed and dragged to assign routes.
- PVO interception uses a 50/50 hit roll per engagement attempt.
- Russian PVO also fires visible interceptor missiles and uses the same 50/50 hit roll.
- Destroying all Russian infrastructure cuts enemy supply; victory waits until active incoming threats are cleared.
- Diplomacy panel opens in the left rail and can de-escalate, escalate, or stop future waves.
- Public URL serves the live playable body, not `concept-fidelity`.
