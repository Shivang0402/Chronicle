---
name: Quiet Editorial
colors:
  surface: '#fbf9f3'
  surface-dim: '#dbdad4'
  surface-bright: '#fbf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ed'
  surface-container: '#efeee7'
  surface-container-high: '#e9e8e2'
  surface-container-highest: '#e4e3dc'
  on-surface: '#1b1c18'
  on-surface-variant: '#444841'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f2f1ea'
  outline: '#747871'
  outline-variant: '#c4c8bf'
  surface-tint: '#52634d'
  primary: '#50614b'
  on-primary: '#ffffff'
  primary-container: '#687963'
  on-primary-container: '#f7fff0'
  inverse-primary: '#b9ccb2'
  secondary: '#596055'
  on-secondary: '#ffffff'
  secondary-container: '#dbe2d4'
  on-secondary-container: '#5e655a'
  tertiary: '#5c5c57'
  on-tertiary: '#ffffff'
  tertiary-container: '#75756f'
  on-tertiary-container: '#fffcf5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e8cd'
  primary-fixed-dim: '#b9ccb2'
  on-primary-fixed: '#101f0e'
  on-primary-fixed-variant: '#3b4b37'
  secondary-fixed: '#dee5d7'
  secondary-fixed-dim: '#c2c9bb'
  on-secondary-fixed: '#171d15'
  on-secondary-fixed-variant: '#42493e'
  tertiary-fixed: '#e4e2dc'
  tertiary-fixed-dim: '#c8c6c0'
  on-tertiary-fixed: '#1b1c18'
  on-tertiary-fixed-variant: '#474742'
  background: '#fbf9f3'
  on-background: '#1b1c18'
  surface-variant: '#e4e3dc'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 34px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: 0em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Playfair Display
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.01em
  body-md:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system translates the intimate ritual of putting fountain pen to archival cotton paper into a quiet, focused digital environment. It merges editorial book typography, generous negative space, and the tactile restraint of a fine notebook with modern, high-precision productivity mechanics.

The brand targets reflective thinkers, writers, and individuals seeking sanctuary from hyper-stimulating interfaces. The interface deliberately evokes stillness, slow clarity, and timeless elegance. There are no abrasive notifications, loud streaks, or neon gamification triggers. Instead, motion is gentle and purposeful, transitions mimic turning a heavyweight linen page, and interactive elements defer authority to the user's thoughts.

## Colors

The palette is rooted in organic, archival materials: raw cotton paper, faded linen bindings, weathered sage foliage, and carbon soot ink.

### Palette Architecture
- **Canvas Base (`#F8F7F3`)**: Warm Ivory provides a softened, eye-resting foundation that rejects stark digital white.
- **Surface Layer (`#FCFBF9` & `#FFFFFF`)**: Used for distinct sheet cards, side panels, and elevated writing planes.
- **Recessed Surface (`#F0EEE7`)**: Soft Beige signals metadata trays, auxiliary toolbars, and inactive reading wells.
- **Ink Primary (`#252622`)**: Deep Charcoal yields high, dignified contrast for sustained reading without the eye fatigue of pure `#000000`.
- **Ink Secondary (`#85857D`)**: Muted Gray softens timestamps, character counts, empty state hints, and peripheral markers.
- **Accent Primary (`#82947C`)**: Muted Sage Green governs active states, key confirmation triggers, and quiet emphasis.
- **Accent Soft (`#DCE3D5`)**: Pale Olive handles pill selections, text highlights, and badge fills.
- **Hairline Border (`#E8E6DF`)**: Subtle Warm Gray maintains component boundaries without visually dissecting the page.

## Typography

The typography system pairs **Playfair Display** (literary expression, emotional weight, editorial depth) with **DM Sans** (clarity, geometric neutrality, ergonomic reading).

### Structural Rules
- **Journal Entries & Long-form Narrative**: Render all active writing canvases and long-form prose entries using `body-lg` (Playfair Display, 19px on 32px line-height) to foster an authentic literary diary experience.
- **Application Chrome & Productivity Surfaces**: Reserve `DM Sans` strictly for user controls, entry dates, word counts, search bars, filter pills, and drawer navigation.
- **Display Tracking**: Ensure larger Playfair headlines carry subtle negative tracking (`-0.01em` to `-0.02em`) to maintain editorial tension and typographic authority.

## Layout & Spacing

The layout is structured around an asymmetrical, book-inspired fixed-fluid canvas. Instead of wall-to-wall dashboard blocks, content is centered within a focused reading column to minimize distraction.

### Layout Specs
- **Desktop (1200px+)**: Multi-column structure featuring a collapsible 280px navigation rail, a 360px entry timeline stream, and a central reading/writing desk locked between 680px and 760px maximum width. Outer margin defaults to `margin` (2rem / 32px), with `gutter` (1.5rem / 24px).
- **Tablet (768px – 1199px)**: Side-by-side split where the timeline collapses into a slide-over drawer; writing desk stays centered. Outer margins set to 1.5rem.
- **Mobile (< 768px)**: Pure single-column view with bottom navigation; content padding contracts to 1rem edge gutters.

Spacers emphasize breathing room around entry titles and paragraphs (`space-xl` for section separation, `space-md` for standard metadata pairings).

## Elevation & Depth

Visual hierarchy relies on warm tonal layering, paper-thin structural borders, and diffuse ambient shadows that mimic natural desk lamp illumination.

### Tonal Stacking
- **Desk Level 0**: Base background `#F8F7F3`.
- **Desk Level 1 (Cards, Entries, Panels)**: `#FCFBF9` bordered with 1px solid `#E8E6DF`.
- **Desk Level 2 (Floating Palettes, Popovers, Active Menus)**: `#FFFFFF` bordered with 1px solid `#E8E6DF`.

### Ambient Shadow Craft
- **Resting Cards**: `0 2px 8px -2px rgba(37, 38, 34, 0.03), 0 1px 3px 0 rgba(37, 38, 34, 0.02)`
- **Elevated Modals & Focus Overlays**: `0 16px 36px -8px rgba(37, 38, 34, 0.06), 0 4px 12px -2px rgba(37, 38, 34, 0.03)`
- Heavy drop shadows, colored glow boundaries, and aggressive blur filters are prohibited.

## Shapes

Shapes emulate high-grade stationery and bound volumes. Sharp clinical corners are replaced with soft, tactile curvature that feels comforting and organic.

- **Primary Cards & Modals**: Standardized at 14px to 16px radius (`rounded-lg` token), evoking leather-bound journal covers.
- **Interactive Controls (Inputs, Buttons, Chips)**: Scaled at 8px to 10px radius (`rounded` token) for clean ergonomic targeting.
- **Status Tags & Mood Badges**: Utilize full capsule / pill styling to set metadata distinctly apart from rectangular content blocks.

## Components

### Buttons
- **Primary Action (New Entry, Publish)**: Solid `#82947C` background, `#FFFFFF` text, 0.5rem radius, subtle hover transition shift to `#74856E`. No sharp hover scales.
- **Secondary Action (Discard, Archive)**: `#F0EEE7` background, `#252622` text, 1px border `#E8E6DF`. Hover background moves to `#E5E2D9`.
- **Ghost/Text Buttons**: Transparent background, `#85857D` text, transitioning to `#252622` text on hover with zero container fill.

### Inputs & Text Areas
- **Journal Canvas (Main Editor)**: Borderless, flat `#FCFBF9` or transparent canvas. Caret colored `#82947C`. Typography switches seamlessly between `headline-lg` (Title) and `body-lg` (Text).
- **Search & Settings Inputs**: Recessed `#F0EEE7` background, 1px solid `#E8E6DF`, text in `body-md`. Focus state shifts background to `#FFFFFF` with a 1px border in `#82947C`.

### Cards & Entry Previews
- **Timeline Card**: Surface `#FCFBF9`, 1px hairline border `#E8E6DF`, 16px radius. Displays date in `label-sm` (`#85857D`), title in `headline-sm` (`#252622`), and an excerpt in `body-sm`.
- **Hover State**: Elevates subtly with a 1px border shift to `#82947C` at 40% opacity.

### Chips & Metadata Badges
- **Mood / Category Pill**: Background `#DCE3D5` with `#252622` text, 12px padding, capsule radius.
- **Date Marker**: Plain text in `label-sm`, tracking wide (`0.05em`), uppercase, colored `#85857D`.

### Checkboxes & Selectors
- Custom 18px rounded square (4px radius). Unchecked: `#F0EEE7` with a 1px `#E8E6DF` border. Checked: `#82947C` background with an off-white inner check icon.

### Reflection Specific Components
- **Daily Prompt Capsule**: Soft `#F0EEE7` background panel, centered Playfair italic text, flanked by warm quotation marks, with an inline "Reflect" pill button.
- **Audio Memo / Voice Note Player**: Slim 36px pill containing an organic mini-waveform rendered in `#82947C` on `#F0EEE7`.