# @onair/skp-framer-components

Production-ready **Framer Motion** and **Swiper** React components crafted for ON AIR:

## Components Included

1. **`Skiper47` (`Skiper47.tsx`)**
   - 3D Perspective Coverflow Carousel with Swiper & Framer Motion.
   - Exact match for `skiper-ui.com/v1/skiper47`.
   - Features: `depth: 100`, `modifier: 2.5`, centered active slide, 3D perspective wings, custom pagination bullets, navigation buttons, and responsive breakpoints.
   - Pre-configured with 4K Ultra-HD photography.

2. **`Skiper58` (`Skiper58.tsx`)**
   - Full-screen / inline Text Roll Navigation with staggered individual character animations.
   - Exact match for `skiper-ui.com/v1/skiper58`.
   - Characters smoothly roll up and reappear from the bottom on hover (`TextRoll`).

3. **`MagneticButton` (`MagneticButton.tsx`)**
   - Magnetic spring physics button (`@unlumen-ui/magnetic-button`).
   - Damped harmonic spring movement tracking cursor distance within a configurable radius.
   - Variants: `default`, `dark`, `gradient`, `outline`, `accent`.

4. **`Highlight` (`Highlight.tsx`)**
   - Animated spring highlight tracking pill (`@unlumen-ui/highlight`).
   - Glides smoothly underneath the hovered and active category tabs using Framer Motion `layoutId`.

5. **`StaysShowcase` (`StaysShowcase.tsx`)**
   - Integrated full-page showcase combining all 4 components into a cohesive, responsive React experience.

## Installation

```bash
cd skp
pnpm install
# or
npm install
```

## Usage Example

```tsx
import { Skiper47, Skiper58, MagneticButton, Highlight, StaysShowcase } from "./skp";

export default function App() {
  return <StaysShowcase />;
}
```
