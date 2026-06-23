# Component Library

All UI components live in `frontend/src/components/` and are prefixed `DL` (Dream Life). They are styled with inline styles that reference the [design tokens](./tokens.md), so they re-theme automatically with the active palette.

Every component accepts a `style?: CSSProperties` prop for one-off overrides unless noted.

---

## Layout & chrome

### `IOSFrame`
Wraps the whole app. On mobile (`innerWidth ≤ 500`) it renders full-bleed with a status-bar spacer; on desktop it renders a centered iPhone-style frame so the app always looks like a phone.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | App content |

```tsx
<IOSFrame>{renderScreen()}</IOSFrame>
```

### `DLScreen`
Standard screen container — full height, column flex, optional scroll and padding.

| Prop | Type | Default | Description |
|---|---|---|---|
| `bg` | `string` | `var(--paper)` | Background color |
| `pad` | `boolean \| number` | `true` | `true` → `0 20px`, number → `0 {n}px`, `false` → none |
| `scroll` | `boolean` | `false` | Enables vertical scroll |
| `style` | `CSSProperties` | — | Override |

```tsx
<DLScreen scroll pad>{/* ... */}</DLScreen>
```

### `DLTopBar`
Top navigation bar with optional back button, title, and trailing slot. Back defaults to `useAppStore().goBack`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Centered title |
| `showBack` | `boolean` | `false` | Show back chevron |
| `onBack` | `() => void` | `goBack` | Back handler override |
| `trailing` | `ReactNode` | — | Right-side content (e.g. progress dots) |
| `transparent` | `boolean` | `false` | Transparent vs `var(--paper)` background |

```tsx
<DLTopBar showBack title="Visualization" />
```

### `DLTabBar`
Bottom tab bar for the main app. Self-contained — reads `screen` and `goto` from the store directly, **takes no props**. Tabs: Today, Movie, Affirm, Path, You.

```tsx
{showTabs && <DLTabBar />}
```

---

## Typography

### `DLDisplay`
Large serif display text.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `md` | 28 / 34 / 44 / 56 px |
| `italic` | `boolean` | `false` | Italic |
| `center` | `boolean` | `false` | Center align |
| `color` | `string` | `var(--ink)` | Text color |

```tsx
<DLDisplay size="lg">close your eyes.<br /><em>be there already.</em></DLDisplay>
```

### `DLLabel`
Uppercase mono eyebrow/label, 10px with wide tracking.

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `string` | `var(--muted)` | Text color |

```tsx
<DLLabel>Today's practice</DLLabel>
```

---

## Inputs & actions

### `DLButton`
Pill button with press feedback.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'light'` | `primary` | Style |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | Padding/font |
| `onClick` | `() => void` | — | Handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `fullWidth` | `boolean` | `false` | Stretch to 100% |
| `type` | `'button' \| 'submit'` | `button` | HTML type |

```tsx
<DLButton variant="primary" size="lg" fullWidth onClick={next}>Continue →</DLButton>
```

### `DLInput`
Text or multiline input with optional label, hint, and prefix glyph.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label above |
| `hint` | `string` | — | Helper text below |
| `prefix` | `string` | — | Glyph inside left edge |
| `value` | `string` | — | **Required** controlled value |
| `onChange` | `(v: string) => void` | — | **Required** change handler (passes value, not event) |
| `placeholder` | `string` | — | Placeholder |
| `multiline` | `boolean` | `false` | Render `<textarea>` |
| `rows` | `number` | `3` | Rows when multiline |
| `type` | `string` | `text` | Input type |
| `autoFocus` | `boolean` | — | Autofocus |

```tsx
<DLInput label="Email" prefix="✉" type="email" value={email} onChange={setEmail} />
```

### `DLChip`
Selectable pill chip.

| Prop | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | `false` | Selected (gradient fill) |
| `onClick` | `() => void` | — | Handler |
| `size` | `'sm' \| 'md'` | `md` | Size |

```tsx
<DLChip active={len === 5} onClick={() => setLen(5)}>5 min</DLChip>
```

---

## Surfaces & indicators

### `DLCard`
Tinted surface container.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `'paper' \| 'sage' \| 'clay' \| 'plum' \| 'ink'` | `paper` | Background tint |
| `pad` | `number` | — | Padding |
| `radius` | `number` | — | Corner radius |
| `shadow` | `boolean` | — | Drop shadow |
| `onClick` | `() => void` | — | Makes card tappable |

```tsx
<DLCard tone="ink" pad={16}>{/* Aura tip */}</DLCard>
```

### `DLDots`
Progress / step dots — the current step renders as a wide pill.

| Prop | Type | Description |
|---|---|---|
| `total` | `number` | Total steps |
| `current` | `number` | Active index (0-based) |

```tsx
<DLDots total={4} current={step} />
```

---

## Brand & AI

### `DLAura`
The Aura avatar orb — gradient circle with optional glow and breathing rings. Falls back to a `✦` glyph if the avatar image is missing.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `number` | `80` | Diameter in px |
| `glow` | `boolean` | `true` | Radial glow halo |
| `rings` | `boolean` | `false` | Breathing concentric rings |

```tsx
<DLAura size={160} glow rings />
```

### `AuraChat`
Full streaming chat panel with the Aura AI coach. Streams responses via `streamAuraChat` (SSE) from `api/aura.ts` and shows a typing indicator.

| Prop | Type | Description |
|---|---|---|
| `onClose` | `() => void` | Close the chat panel |
| `initialMessage` | `string` | Optional opening assistant message |

```tsx
<AuraChat onClose={() => setOpen(false)} />
```

---

## Conventions

- **Controlled inputs** pass the *value* to `onChange`, not the DOM event: `onChange={setEmail}`.
- **Theming**: never hard-code colors — use `var(--token)` so palette switching works.
- **Navigation**: components read `goto` / `goBack` from `useAppStore()` rather than taking router props.
- **Overrides**: pass `style` for one-offs; prefer props for anything reusable.
- **Pills everywhere**: buttons and chips use `border-radius: 999px`; cards use 14–22px.

See [tokens.md](./tokens.md) for the underlying color, type, and animation tokens.
