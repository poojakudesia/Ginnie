# Design Tokens

The Dream Life design system is driven entirely by **CSS custom properties** (variables). Every component references tokens like `var(--ink)` instead of hard-coded colors, so the whole app re-themes instantly when a palette changes.

- Base tokens live in `frontend/src/index.css` under `:root`.
- Palette swaps are applied at runtime by `applyPalette()` in `frontend/src/store/app.ts`.

---

## Color tokens

These are the semantic color variables every component uses. The values below are the default **Petal** palette.

| Token | Default value | Purpose |
|---|---|---|
| `--paper` | `#FCF1F0` | App background |
| `--card` | `#FFF8F7` | Card / input surface |
| `--ink` | `#3B1F26` | Primary text |
| `--ink-2` | `#5A3040` | Secondary text |
| `--muted` | `#9B7080` | Tertiary / label text |
| `--line` | `rgba(59,31,38,0.10)` | Hairline borders |
| `--line-strong` | `rgba(59,31,38,0.20)` | Stronger borders / inactive dots |
| `--btn` | `#7C3763` | Primary button base / accent |
| `--btn-deep` | `#5B2D5E` | Primary button gradient end |
| `--btn-text` | `#FFFFFF` | Text on primary button |
| `--accent` | `#C97BA8` | Highlight accent |
| `--accent-soft` | `rgba(124,55,99,0.12)` | Soft accent fill (banners, selected rows) |

---

## Palettes

Four palettes ship with the app. Selecting one rewrites the color tokens above on `document.documentElement`. Defined in `PALETTE_VARS` in `frontend/src/store/app.ts`.

### 🌸 Petal (default) — rose
| Token | Value |
|---|---|
| `--paper` | `#FCF1F0` |
| `--card` | `#FFF8F7` |
| `--ink` | `#3B1F26` |
| `--btn` | `#7C3763` |
| `--btn-deep` | `#5B2D5E` |
| `--accent` | `#C97BA8` |

### 🌿 Sage — earthy green/orange
| Token | Value |
|---|---|
| `--paper` | `#F4EFE5` |
| `--card` | `#FDFAF4` |
| `--ink` | `#211F1A` |
| `--btn` | `#DC8551` |
| `--btn-deep` | `#B86838` |
| `--accent` | `#C4A96A` |

### 🏜 Sand — warm neutral
| Token | Value |
|---|---|
| `--paper` | `#F5F0E8` |
| `--card` | `#FDFBF6` |
| `--ink` | `#2A2318` |
| `--btn` | `#A0845C` |
| `--btn-deep` | `#7A6040` |
| `--accent` | `#C4A96A` |

### 🌙 Dusk — dark mode (violet)
| Token | Value |
|---|---|
| `--paper` | `#1A1525` |
| `--card` | `#221D30` |
| `--ink` | `#EDE8F5` |
| `--btn` | `#8B5CF6` |
| `--btn-deep` | `#6D28D9` |
| `--accent` | `#C084FC` |

### Switching palettes

```ts
import { useAppStore } from './store/app';

const setPalette = useAppStore((s) => s.setPalette);
setPalette('dusk'); // 'petal' | 'sage' | 'sand' | 'dusk'
```

`setPalette` persists the choice in the store and calls `applyPalette()`, which writes every variable onto `:root`.

---

## Typography tokens

| Token | Stack | Used for |
|---|---|---|
| `--serif` | `'Instrument Serif', Georgia, serif` | Display headings (`DLDisplay`), editorial copy |
| `--sans` | `'Geist', system-ui, sans-serif` | Body text, buttons, inputs |
| `--mono` | `'JetBrains Mono', monospace` | Labels, eyebrows, metadata, timers |

Fonts are loaded from Google Fonts in both `index.css` (`@import`) and `index.html` (`<link>`).

### Type scale

**Display** (`DLDisplay`, serif):
| Size | px |
|---|---|
| `sm` | 28 |
| `md` | 34 |
| `lg` | 44 |
| `xl` | 56 |

**Body / UI** (sans): 12–17px
**Labels / eyebrows** (`DLLabel`, mono): 10px, `letter-spacing: 0.10em`, uppercase

---

## Spacing & radius

These are conventions used across components (not formal variables):

| Use | Value |
|---|---|
| Screen horizontal padding | `20px` (`DLScreen` default) |
| Card padding | `18px` typical |
| Input padding | `13px 16px` |
| Card radius | `14–22px` |
| Input radius | `14px` |
| Button / chip radius | `999px` (full pill) |
| Hairline border | `0.5px–1.5px solid var(--line)` |

---

## Animations

Defined as keyframes in `index.css`:

| Keyframe | Effect | Used by |
|---|---|---|
| `dlBreathe` | Scale 1 → 1.06, fade — breathing | `DLAura` glow/rings, welcome orbs |
| `dlFadeUp` | Fade + slide up 8px | `.dl-fade-up` entrance |
| `dlShimmer` | Background position sweep | Loading shimmer |
| `dlOrbit` | 360° rotation | Decorative orbits |
| `dlPulse` | Expanding box-shadow ring | Attention pulse |
| `dl-spin` | 360° rotation | `Spinner` (defined inline in SignInScreen) |

Standard easing: `cubic-bezier(.22,.61,.36,1)` for entrances, `ease-in-out` for loops.
