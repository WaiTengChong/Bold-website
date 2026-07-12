# Bold Pickleball — Design System

Canonical design reference for all Bold Pickleball UI. Screen-level mockups live in `UI/`; each folder contains a `code.html` prototype that implements these tokens.

**Tagline:** Play Hard. Stay Humble.

---

```yaml
---
name: Bold Pickleball
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#424844'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#727974'
  outline-variant: '#c1c8c3'
  surface-tint: '#476557'
  primary: '#00150d'
  on-primary: '#ffffff'
  primary-container: '#0d2b20'
  on-primary-container: '#759485'
  inverse-primary: '#adcebd'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#0f1112'
  on-tertiary: '#ffffff'
  tertiary-container: '#232627'
  on-tertiary-container: '#8b8d8e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9ead9'
  primary-fixed-dim: '#adcebd'
  on-primary-fixed: '#022016'
  on-primary-fixed-variant: '#2f4d40'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.02em
  display-md:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  headline-sm:
    fontFamily: Bebas Neue
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '300'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.08em
  headline-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.03em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-xl: 120px
  stack-lg: 64px
  stack-md: 32px
  stack-sm: 16px
---
```

## Screens

| Screen | Path | Purpose |
|--------|------|---------|
| Bold Homepage | `UI/Bold Homepage/` | Marketing landing, hero, values, CTAs |
| Brand Introduction | `UI/Brand Introduction/` | Brand story and positioning |
| The Facility | `UI/The Facility/` | Facility amenities and environment |
| The Elite Team | `UI/The Elite Team/` | Coaching staff and expertise |
| Membership Plans | `UI/Membership Plans/` | Tier comparison and enrollment |
| Court Booking Portal | `UI/Court Booking Portal/` | Member court reservation flow |

## Brand & Style

The design system embodies a **High-Performance Luxury** aesthetic, bridging the gap between elite athletic competition and premium lifestyle hospitality. It is designed for an affluent, discerning audience that values precision, exclusivity, and modern sophistication.

The visual style is a blend of **Minimalism** and **High-Contrast Boldness**. It utilizes expansive negative space to create a sense of "breathing room" found in luxury editorial layouts, contrasted against aggressive, powerful typography that signals the strength and speed of the sport. The interface should feel like an enterprise-grade SaaS platform reimagined for a private members' club.

## Colors

The palette is intentionally restricted to evoke a sense of prestige and focus.

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| **Primary** (Deep Forest Green) | `primary` | `#00150d` | Primary actions, heavy typography, brand-defining surfaces. Represents the court and brand heritage. |
| **Primary Container** | `primary-container` | `#0d2b20` | Elevated primary surfaces, CTAs on dark hero sections |
| **On Primary** | `on-primary` | `#ffffff` | Text and icons on primary backgrounds |
| **Background / Surface** | `background`, `surface` | `#f9f9ff` | Default page background — ultra-light cool gray |
| **Pure White** | `surface-container-lowest` | `#ffffff` | Cards, elevated panels, maximum contrast surfaces |
| **Surface Containers** | `surface-container-*` | `#f0f3ff` → `#dce2f3` | Subtle sectioning and tonal layering without harsh lines |
| **On Surface** | `on-surface` | `#151c27` | Primary body text |
| **On Surface Variant** | `on-surface-variant` | `#424844` | Secondary text, captions |
| **Outline** | `outline` | `#727974` | Borders, dividers, disabled states |
| **Outline Variant** | `outline-variant` | `#c1c8c3` | Low-contrast structural borders |
| **Secondary** | `secondary` | `#5d5f5f` | Neutral UI accents |
| **Tertiary** | `tertiary` | `#0f1112` | Dark accent surfaces |
| **Error** | `error` | `#ba1a1a` | Destructive actions, validation errors |

### Color Principles

- **Primary (Deep Forest Green):** Used for primary actions, heavy typography, and brand-defining surfaces. It represents the "court" and the heritage of the brand.
- **Surface (Ultra-light Gray):** Used for subtle sectioning, grouping elements without the use of harsh lines.
- **Accent Grays:** Utilized for borders, secondary text, and disabled states to maintain a low-noise environment.

## Typography

Typography is the primary driver of the brand's voice.

| Style | Token | Font | Size | Weight | Use |
|-------|-------|------|------|--------|-----|
| Display Large | `display-lg` | Bebas Neue | 80px | 700 | Hero statements |
| Display Medium | `display-md` | Bebas Neue | 48px | 700 | Section titles, marquee text |
| Headline Large | `headline-lg` | Bebas Neue | 32px | 700 | Page headings (desktop) |
| Headline Large Mobile | `headline-lg-mobile` | Bebas Neue | 28px | 700 | Page headings (mobile) |
| Headline Small | `headline-sm` | Bebas Neue | 20px | 700 | Subheadings, button labels |
| Body Large | `body-lg` | Inter | 18px | 300 | Lead paragraphs |
| Body Medium | `body-md` | Inter | 16px | 300 | Default body copy |
| Label Medium | `label-md` | Inter | 14px | 500 | Navigation, buttons |
| Label Small | `label-sm` | Inter | 12px | 600 | Form labels, badges |

**Headlines** use *Bebas Neue* in all-caps. This provides a vertical, architectural strength to the layout. Tracking (letter spacing) should be slightly increased to ensure a premium feel even at large scales.

**Body and UI elements** use *Inter* set in light weights (300). This creates a sharp, technical contrast against the heavy headlines. For functional labels and buttons, use medium or semi-bold weight in uppercase to maintain the authoritative tone of the system.

### Font Loading

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;500;600;700&display=swap" rel="stylesheet"/>
```

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop to control the composition tightly, switching to a fluid model for smaller breakpoints.

| Token | Value | Use |
|-------|-------|-----|
| `unit` | 8px | Base spacing unit — all padding and margins are multiples of 8 |
| `container-max` | 1440px | Maximum content width |
| `gutter` | 32px | Column gutter in 12-column grid |
| `margin-desktop` | 64px | Horizontal page margin (desktop) |
| `margin-mobile` | 20px | Horizontal page margin (mobile) |
| `stack-xl` | 120px | Major section separation |
| `stack-lg` | 64px | Section padding, hero bottom spacing |
| `stack-md` | 32px | Component group spacing |
| `stack-sm` | 16px | Tight element spacing |

### Layout Principles

- **Negative Space:** Generous vertical spacing (`stack-xl`) is used between major sections to emphasize exclusivity.
- **Grid:** A 12-column grid with wide 32px gutters. Elements should often span 6 or 8 columns, centered, to maintain the minimalist "boutique" feel.
- **Rhythm:** An 8px linear scale governs all padding and margins. For high-end marketing pages, use "oversized" padding (e.g., 120px) to frame content.

### Breakpoints

| Name | Min width | Notes |
|------|-----------|-------|
| Mobile | default | Fluid layout, `margin-mobile`, `headline-lg-mobile` |
| Desktop | 768px (`md`) | Fixed grid, `margin-desktop`, `headline-lg` |

## Elevation & Depth

To maintain the "Luxury SaaS" feel, this design system avoids heavy drop shadows. Depth is communicated through:

- **Tonal Layering:** Use `surface` (`#f9f9ff`) or `surface-container-low` against `surface-container-lowest` (`#ffffff`) to define cards or sidebars.
- **Low-Contrast Outlines:** Elements are defined by 1px solid borders using `outline-variant` (`#c1c8c3`) or `outline` (`#727974`). This provides a crisp, architectural structure without the weight of shadows.
- **Subtle Surface Blurs:** For floating navigation or modals, use `backdrop-blur-xl` (32px) with a semi-transparent `surface` fill at 90% opacity to suggest glass without being trendy.

## Shapes

The design system utilizes **Sharp (0px)** roundedness.

Right angles are used across all buttons, input fields, and containers to reinforce a sense of precision, discipline, and architectural permanence. This "brutalist-lite" approach distinguishes the brand from the "soft" corners of consumer-grade apps, signaling a more professional and elite environment.

```css
/* All interactive surfaces */
border-radius: 0;
```

## Components

### Buttons

| Variant | Background | Border | Text | Typography |
|---------|------------|--------|------|------------|
| **Primary** | `primary` | none | `on-primary` | Inter, 600, uppercase |
| **Secondary** | transparent | 1px `primary` | `primary` | Inter, 600, uppercase |
| **Ghost** | transparent | none | `primary` | Inter, 500, underline on hover |

All buttons use sharp corners (0px radius). No drop shadows on default state.

### Input Fields

- **Style:** Underline-only or 1px `outline-variant` border. No background fill.
- **Focus State:** Border thickness increases to 2px in `primary`.
- **Labels:** `label-sm` — uppercase Inter (600 weight) placed above the field.

### Badges / Chips

- **Style:** Small, sharp-edged rectangles.
- **Color:** `surface-container` background with `primary` text. No icons unless strictly functional.

### Data Tables

- **Header:** `primary` background with `on-primary` uppercase text.
- **Rows:** Thin 1px horizontal `outline-variant` borders only. No vertical lines.
- **Typography:** Use monospaced numbers if available, or Inter Light for numerical data to ensure alignment and readability.

### Cards

- **Style:** Minimalist. Either a 1px `outline-variant` border **or** a subtle color shift to `surface-container` — never both.
- **Padding:** Minimum 40px internal padding (`stack-md` + 8px).

### Navigation (Top App Bar)

- Sticky, full-width, `surface` at 90% opacity with `backdrop-blur-xl`.
- Bottom border: 1px `outline-variant` at 30% opacity.
- Logo: `headline-lg`, uppercase, `primary` color.
- CTA: `primary-container` background, `on-primary-container` text.

## Implementation

Prototypes use **Tailwind CSS** (CDN) with a custom `tailwind.config` that maps design tokens to utility classes.

### Token → Tailwind mapping

```
colors.primary          → bg-primary, text-primary, border-primary
typography.display-lg   → font-display-lg text-display-lg
spacing.stack-xl        → py-stack-xl, gap-stack-xl, mb-stack-xl
spacing.container-max   → max-w-container-max
spacing.margin-desktop  → px-margin-desktop
```

### Global styles

```css
body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### Icons

Use **Material Symbols Outlined** for functional icons only. Default variation: `'FILL' 0, 'wght' 400`.

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Dark mode

Prototypes support `darkMode: "class"`. In dark contexts, swap `surface` ↔ `primary` pairings and preserve contrast ratios for `on-primary` / `on-surface` text.

## Do / Don't

| Do | Don't |
|----|-------|
| Use generous whitespace between sections | Crowd content into full-width blocks |
| Keep headlines in Bebas Neue, all-caps | Mix decorative or script fonts |
| Use 1px borders for structure | Add drop shadows or heavy gradients |
| Limit palette to defined tokens | Introduce bright accent colors |
| Center content in 6–8 column spans | Stretch content edge-to-edge on desktop |
| Use sharp 0px corners everywhere | Apply rounded corners "for friendliness" |
