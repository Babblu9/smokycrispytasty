---
name: Stitch Kitchen
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cc'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#ffe9e1'
  surface-container-high: '#fce3da'
  surface-container-highest: '#f6ddd4'
  on-surface: '#251913'
  on-surface-variant: '#594238'
  inverse-surface: '#3c2d27'
  inverse-on-surface: '#ffede7'
  outline: '#8c7166'
  outline-variant: '#e0c0b2'
  surface-tint: '#a23f00'
  primary: '#9e3d00'
  on-primary: '#ffffff'
  primary-container: '#c64f00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb595'
  secondary: '#865300'
  on-secondary: '#ffffff'
  secondary-container: '#fea520'
  on-secondary-container: '#694000'
  tertiary: '#0058bd'
  on-tertiary: '#ffffff'
  tertiary-container: '#0070ec'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb595'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7c2e00'
  secondary-fixed: '#ffddb9'
  secondary-fixed-dim: '#ffb961'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#663e00'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004494'
  background: '#fff8f6'
  on-background: '#251913'
  surface-variant: '#f6ddd4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

The brand personality is authoritative yet warm—like a seasoned chef guiding a novice through a complex recipe. It prioritizes utility and clarity above all else, acknowledging that the user is often multi-tasking, perhaps with messy hands or in low-light kitchen environments. 

The visual style is **Modern "Stitch" Brutalism**. This translates to a structured, modular interface where information is compartmentalized into "stitched" cards. It utilizes high-contrast outlines, generous whitespace, and a flat but layered aesthetic. The goal is extreme scannability; a user should be able to glance at the screen from three feet away and understand the next step in a recipe. This design system avoids subtle gradients or soft shadows in favor of crisp lines and bold blocks of color to ensure maximum legibility.

## Colors

The palette is designed for high appetite appeal and high visual contrast.

*   **Primary (Terracotta - #D35400):** Used for the most critical actions, such as "Start Cooking" or "Next Step." It provides a grounding, earthy energy.
*   **Secondary (Saffron - #F39C12):** Used for highlighting active states, timers, and secondary interactive elements like "Add to List."
*   **Background (Soft Cream - #FCF9F2):** A warm, off-white base that reduces screen glare compared to pure white, making it easier on the eyes during long cooking sessions.
*   **Neutral (Rich Charcoal - #2C3E50):** The primary color for typography and iconography, ensuring a high contrast ratio against the cream background for AAA accessibility.
*   **Accents:** A deep "Stitch Black" (#1A1A1A) is used for all structural borders and dividers to define the modular grid.

## Typography

This design system utilizes **Inter** for its incredible legibility and neutral, modern tone. For headlines, we use the Extra Bold and Bold weights to create a clear visual hierarchy that "pops" off the screen. 

To reinforce the "Stitch" aesthetic and provide a technical, "recipe-card" feel, **JetBrains Mono** is used for labels, measurements, and metadata (e.g., cooking times, calorie counts). 

**Key Rules:**
- Paragraph text (Body LG) uses a generous 1.55x line height to prevent lines from blurring together while reading steps.
- All headings use a slightly tighter letter spacing to maintain a compact, "editorial" look.
- All measurements (e.g., "500g", "15 mins") must use the `label-bold` mono style.

## Layout & Spacing

The layout follows a **Rigid Modular Grid**. In a hands-busy environment, precise spacing prevents accidental taps and ensures visual separation of distinct tasks.

- **Grid Model:** 12-column fluid grid for tablet/desktop, but on mobile, it transitions to a single-column stack of high-impact cards.
- **The "Stitch" Margin:** A consistent 20px outer margin is maintained on all mobile screens.
- **Vertical Rhythm:** Content blocks (e.g., Ingredients list vs. Instructions) are separated by `lg` (40px) spacing to ensure clear mental context switching.
- **Click Targets:** No interactive element (button, checkbox, or link) should have a height/width smaller than 48px to accommodate clumsy or wet fingers.

## Elevation & Depth

This design system rejects traditional shadows and blurs in favor of **Layered Flatness**. 

- **Tonal Stacking:** Depth is communicated by stacking containers. The base is the cream background. Secondary "Step Cards" are white with a 2px solid charcoal border.
- **The Stitch Stroke:** All primary cards and interactive containers must use a 2px solid border (`#1A1A1A`). 
- **Hard Offsets:** Instead of soft shadows, use "Hard Shadows"—a solid 4px charcoal offset behind primary buttons and active cards to give them a physical, tactile presence.
- **Active States:** When an element is pressed, it "sinks" into the page (offset moves from 4px to 0px), providing immediate tactile feedback.

## Shapes

The shape language is "Soft-Edge Industrial." We use a standard 0.25rem (`rounded-sm`) radius for most elements to maintain the crisp, modern aesthetic while removing the harshness of true 90-degree corners.

- **Standard Containers:** 4px radius.
- **Featured Cards:** 8px radius (`rounded-lg`) to denote special content like "Recipe of the Day."
- **Inputs & Buttons:** 4px radius to match the structural grid.
- **Icons:** Should be stroke-based with a 2px weight to match the UI's border system.

## Components

### Buttons
- **Primary:** Terracotta background, 2px charcoal border, 4px hard charcoal shadow. Text in White, Bold Inter.
- **Secondary:** Saffron background, 2px charcoal border, no shadow.
- **Tertiary/Ghost:** Transparent background, 2px charcoal border, Mono label.

### Cards
- **Recipe Step Card:** White background, 2px charcoal border. Includes a "Stitch" header (a thin Saffron strip at the top) to indicate the active step.
- **Ingredient Card:** Features a large checkbox (min 32px) on the left and Mono-styled measurements on the right.

### Inputs & Controls
- **Checkboxes:** Large 32px squares with 2px borders. When checked, they fill with Saffron and show a thick charcoal checkmark.
- **Quantities:** Use large "+" and "-" steppers to allow users to scale recipes easily without using a keyboard.

### Specialized Components
- **The Timer Bar:** A persistent Saffron bar at the bottom of the screen with a large Mono countdown timer, accessible via a single tap from any screen.
- **"Done" State:** When a step is completed, the card's border changes from Charcoal to a muted Grey, and text opacity drops to 60%, visually "receding" the information.