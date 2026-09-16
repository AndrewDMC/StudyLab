---
name: StudyLab
description: Pipeline AI + ripasso spaziale in un vault Markdown portabile
colors:
  ground: "#f2f1ef"
  surface: "#ffffff"
  surface-2: "#eeede9"
  text: "#101010"
  text-2: "#5a5a55"
  text-3: "#8a8a85"
  accent: "#1e4080"
  accent-fg: "#ffffff"
  verde: "#3f8f5f"
  ambra: "#b8860b"
  arancio: "#c96a1f"
  rosso: "#b3423a"
  rule: "#d4d3cc"
typography:
  display:
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0.07em"
  body:
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.4
  micro:
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.07em"
  mono:
    fontFamily: "ui-monospace, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "3px"
  md: "6px"
  pill: "999px"
spacing:
  xs: "0.4rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.25rem"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0.6rem 1rem"
  cta-pill:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
  chip-azione:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.7rem"
  tab-attiva:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 0.9rem"
  card-editoriale:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "1.25rem 1.5rem 1.5rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0.55rem 0.8rem"
---

# Design System: StudyLab

## Overview

**Creative North Star: "The Front Page"**

StudyLab now opens like a newspaper front page, not a lab notebook. Every subject is a story: the masthead row states the subject name and, when an exam is set, a countdown badge that outranks every other piece of metadata on the card. A hairline separates masthead from body. The lead headline — the single most urgent action for that subject — runs large and black (800 weight, tight tracking); everything else (secondary line, three-column pipeline/concepts/exams strip, action chips) sits visibly subordinate below a second hairline. This replaces an earlier equal-weight layout (pipeline strip, heatmap, four chips, and a countdown all competing at the same rank) that the user found confusionario; the build's whole point is a strict, legible priority order rather than a grid of equal cells.

The ground is cool and crisp (`#f2f1ef`), not warm — a deliberate departure from the previous avorio world. Structure is carried almost entirely by 1px hairlines and by whitespace, not by borders or shadows: the flagship subject cards on the Dashboard have no border at all, separated from each other only by a `1.25rem` gap and from their own internal sections by hairline rules. Secondary surfaces (Materiali, Active Recall, Concetti) keep the older bordered-container idiom for lists, rows, and panels — restyled to the new palette and radius scale but structurally little-changed, so the vault's utility screens read as calmer, denser instruments next to the Dashboard's editorial front page.

Dark mode flips the ground/surface pair to near-black (`#141418`/`#1c1c22`) and headlines to warm off-white (`#eceae6`); the accent lightens to `#7fa6dd` to stay legible against dark surfaces. The four semantic status colors (verde/ambra/arancio/rosso) are untouched between light and dark — they are read the same way regardless of theme.

**Key Characteristics:**
- Newspaper editorial hierarchy: one dominant lead headline per subject card, everything else demoted
- Hairlines (`1px solid var(--rule)`), not borders or shadows, do the Dashboard's structural work
- Countdown badge is a visual tier of its own — larger and bolder than any other metadata on the card
- System sans at extreme weights (800 for headlines/labels, 400 for body); no web fonts
- Two coexisting card idioms: borderless editorial cards (Dashboard) and bordered utility cards (everywhere else)

## Colors

Cool, near-monochrome ground with one editorial-blue accent and four semantically closed status colors.

### Primary
- **Editorial Blue** (`#1e4080`): the color of the one clickable, trusted action — CTA buttons, the masthead's "N carte" pill, active nav underline, evidenzia chips, focus rings, confidence bar fill, link hover on the lead headline. In dark mode it lightens to `#7fa6dd` (`--accent-fg` flips to `#10141c` so text on it stays legible) to hold contrast against dark surfaces.

### Status (Semantic)
- **Verde Progresso** (`#3f8f5f`): mastery/completion — approved-card action, "schematizzato"/"done" badges, and the FaseTracker's filled segments (a pipeline phase that has caught up).
- **Ambra Attenzione** (`#b8860b`): intermediate confidence level; reserved for the confidence context, not used as an active UI accent elsewhere in the shipped build.
- **Arancio Urgenza** (`#c96a1f`): "there's something to do" — pipeline attention counts (`.info-col-valore.attenzione`), "grezzo"/"queue" badges, near exam countdown (≤30 days), active filter chip, blockquote accent in the Markdown viewer.
- **Rosso Critico** (`#b3423a`): deficit/alarm — urgent exam countdown (≤7 days), failed job badge, discard action, error text.

### Neutral
- **Cool Ground** (`#f2f1ef`): page background. Cooler and crisper than the retired warm-avorio ground — the OWN-WORLD's deliberate break from the old world.
- **Surface** (`#ffffff`): card, panel, input, and row backgrounds. Distinguishes any interactive or contained element from the ground.
- **Surface-2** (`#eeede9`): inset backgrounds for nested elements — code blocks, the schema/markmap editor body, tab-group well, badge default background.
- **Near-Black Text** (`#101010`): primary text and headlines. Deliberately darker/colder than the old `#1c1c1a`.
- **Text-2** (`#5a5a55`): secondary text — card secondary line, chip default text, meta rows.
- **Text-3** (`#8a8a85`): tertiary/quiet text — masthead nav inactive links, metadata micro-labels, mono IDs.
- **Rule / Border** (`#d4d3cc`): hairline dividers and container borders. One token, two jobs — inside editorial cards it's a structural rule (`.card-rule`, info-strip top/bottom); on utility surfaces it's still a literal `1px solid` box border.

### Named Rules
**The Front Page Rule.** Each subject card carries exactly one lead headline (`.card-lead`, 800/1.85rem) — the single most urgent action for that subject, chosen by a fixed priority order (ripasso dovuto > cura > cattura > schematizza > flashcard scoperte > "tutto a posto"). Never render two same-weight competing calls to action in one card.

**The Countdown Dominance Rule.** The exam countdown badge (0.95rem/800w) is deliberately larger and heavier than the metadata tier around it (info-strip labels at 0.62rem, masthead date at 0.72rem) — it must out-rank every other number on the card except the lead headline itself.

**The Status Vocabulary Rule.** Each status color keeps exactly one semantic role — verde mastery, ambra intermediate, arancio action-needed, rosso deficit/error. Never used decoratively or interchangeably.

## Typography

**Body Font:** `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
**Mono Font:** `ui-monospace, Consolas, monospace`

**Character:** System sans pushed to extreme weight contrast — 800 for anything that must be scanned in two seconds (lead headline, subject name, countdown, info values), 400 for anything read in full (body copy, secondary line). No web fonts anywhere; the type does its work through weight and size tiering, not through a distinct display face.

### Hierarchy
- **Display** (800, `1.85rem` desktop / `1.5rem` at ≤600px, line-height 1.05, letter-spacing −0.025em): the card lead headline (`.card-lead`) — the single primary action per subject. A resolved "tutto a posto" state demotes to `.card-lead.ok` (700, 1.4rem, muted color).
- **Title** (800, 1.4rem, line-height 1.2): page `h1`. One per screen.
- **Headline** (800, 1rem, uppercase, letter-spacing 0.07em): the card masthead row — subject name (`.card-nome`); truncates with ellipsis rather than wrapping, so the countdown badge never gets pushed to a second line. Also the masthead logo treatment (0.82rem/800/uppercase/0.1em).
- **Body** (400, 0.95rem, line-height 1.5–1.6): lesson Markdown content, flashcard text, list rows.
- **Label** (400, 0.9rem, line-height 1.4): card secondary line, chip/tab text, form inputs.
- **Micro** (700, 0.62–0.72rem, uppercase, letter-spacing 0.02–0.07em): info-strip column labels, masthead date, section group titles, status badges. Sits one full tier below the countdown badge by design (see The Countdown Dominance Rule).
- **Mono** (400, 0.75–0.85rem): concept IDs (`C-ARCH-0042`), skill names (`/schematizza`), job queue output.

### Named Rules
**The Mono Gate.** Monospace appears only where the context is explicitly computational: stable IDs, CLI/skill names, job output. Never for stylistic emphasis.

## Layout

Single centered container, `max-width: 900px`, `padding: 1.5rem`, unchanged from the previous world — it keeps horizontal scan length bounded for study sessions on a mid-size screen.

Dashboard subject cards are a vertical stack (`.stack-materie`, `flex-direction: column`, `gap: 1.25rem`) — full-width, one per row — not the auto-fit grid the previous world used. This is a deliberate density choice from the direction contract: a front page reads top-to-bottom, not left-to-right across columns. Each card's internal three-column info strip (`grid-template-columns: repeat(3, 1fr)`) is the only grid inside the card.

The concepts grid (`.griglia-concetti`) still uses `repeat(auto-fill, minmax(230px, 1fr))`, unchanged — utility surfaces did not adopt the stacked-card layout.

The masthead is a sticky, thin horizontal strip (`height: 46px`, `padding: 0 1.5rem`) with a hairline bottom border — logo left, nav center, date + global review CTA right. At ≤600px the date hides and the CTA/nav compress; no sidebar, no hamburger.

## Elevation & Depth

**Flat, hairline-structured — no shadows anywhere in the shipped CSS.** Depth reads differently depending on surface:

1. **Editorial cards (Dashboard):** no border at all. Cards are white on cool-ground, separated purely by `1.25rem` of whitespace; internal sections are separated by `1px` hairline rules (`.card-rule`, `.card-info-strip`'s top/bottom border), not by nested background shifts.
2. **Utility surfaces (Materiali, Active Recall, Concetti):** the older bordered-container idiom persists — `1px solid var(--border)` on rows, panels, inputs, the flashcard, and concept cards. This is a real, load-bearing split in the system, not an inconsistency to silently unify: the brief scoped the redesign's structural rewrite to the Dashboard's front-page cards and left the other three surfaces "restyled but structurally mostly unchanged."

### Named Rules
**The Hairline-as-Structure Rule.** Inside an editorial card, structure is drawn with `1px solid var(--rule)` rules between sections, never with a card border or a background-color step. Reserve `border` boxes for utility-surface containers (rows, panels, inputs).

**The No-Shadow Rule.** No `box-shadow` anywhere in the system. Depth and separation come from hairlines and whitespace only.

## Shapes

The radius scale shrank from the old three-tier system (10px/8px/4px) to a tighter two-tier one plus pill:

- **Standard** (`6px`, `--r`): cards, buttons, inputs, panels, code blocks — the default corner across both editorial and utility surfaces.
- **Micro** (`3px`, `--r-sm`): keyboard-shortcut tags, inline code, the confidence bar. Near-flat, for text-scale elements.
- **Pill** (`999px`, `--r-pill`): action chips, filter chips, tabs, status badges, the masthead CTA, the `.btn-cta` link. Reserved for interactive selection/filter elements and small labels read as standalone tags.

### Named Rules
**The Pill Hierarchy Rule.** Pill shape is exclusive to interactive selection/filter elements and status labels. It never appears on a primary action button or a content card — pill signals "selectable/categorizing," not "primary."

## Components

### Buttons
- **Shape:** standard (`6px`)
- **Primary (`.bottone-grande`):** Editorial Blue background, white text, `padding: 0.75rem 1.25rem`, 700 weight. One per screen, for the single most important action (e.g. "Mostra risposta").
- **Secondary (`.bottone-secondario`):** white surface background, `1px solid var(--border)`, primary text, `padding: 0.6rem 1rem`; hover shifts border and text to accent.
- **CTA pill (`.btn-cta`, `.masthead-cta`):** same Editorial Blue fill as primary but pill-shaped, smaller (`0.5rem 1rem` / `0.3rem 0.85rem`), 700 weight — used for the card's "Vai" action and the masthead's global review CTA.
- **Hover/Focus:** opacity dip on fill buttons (`opacity: 0.85–0.88`), border/color shift on outline buttons; no scale or shadow transitions anywhere.

### Chips
- **Action chip (`.chip-azione`):** pill, `1px solid var(--border)`, `text-2` color, `0.3rem 0.7rem` padding, 0.8rem. Evidenzia state: accent border + accent text, 600 weight, used for the highlighted navigation link inside a card.
- **Filter chip (`.chip-filtro`):** pill, surface background, `text-2`; active state turns border+text arancio (a filter is "on" = "needs attention" visual language, reused from status vocabulary).
- **Tab (`.tabs .tab`):** pill in a pill container (`surface-2` well, `1px solid var(--border)`). Active tab: accent fill, white text, 600 weight.
- **Completed pipeline chip (`.azioni-pipeline .chip-azione.completata:disabled`):** the Transformation Raise's static counterpart — verde border/text with a faint verde tint background when a pipeline phase has no more backlog.

### Cards / Containers
- **Editorial Subject Card (signature component, Dashboard):** no border; corner radius standard (`6px`); background white on cool-ground; internal structure is hairlines, not borders (see Elevation & Depth). Padding `1.25rem 1.5rem 1.5rem`. This is the flagship, direction-contract-defining component.
- **Utility card/row (Materiali rows, Concetti concept cards, flashcard, panels):** standard radius, white surface, `1px solid var(--border)`. Internal padding varies by density: `0.85rem 1rem` (concept card), `2rem 1.75rem` (flashcard), `1rem 1.2rem` (action/upload panels).

### Inputs / Fields
- **Style:** `1px solid var(--border)`, white surface, standard radius (`6px`), `padding: 0.55–0.6rem 0.8rem`.
- **Focus:** border shifts to accent (`.ricerca:focus`); global `:focus-visible` also draws a 2px accent outline with 2px offset.
- **Select (`.select-materia`):** identical stroke/radius/color treatment to text inputs.

### Navigation (Masthead)
- **Style:** thin sticky horizontal strip, ground-colored, `1px` hairline bottom border — not a card, not a sidebar.
- **Typography:** logo 800/0.82rem/uppercase; nav links 0.88rem, `text-3` inactive, `text-2` on hover, `text` + 600 weight when active (no underline — color/weight carries the active state, unlike the old world's underline).
- **Mobile:** date hides below 600px; nav gap and CTA padding compress; no drawer or hamburger.

### Editorial Subject Card internals (signature component detail)
- **Masthead row:** subject name (Headline tier, truncates with ellipsis) + countdown badge (its own dominant tier, 0.95rem/800w — colorless by default, arancio at ≤30 days, rosso at ≤7 days) on one line, never wrapping.
- **Lead + secondary:** Display-tier lead link, then a muted secondary line (reserves its line height even when empty, via `min-height`, so the card doesn't jump between states).
- **Info strip:** three columns (Pipeline / Concetti / Esami), each a Micro-tier label over a bold value; the Pipeline column also renders the FaseTracker — five small segments that fill verde as each pipeline phase's backlog clears (the Transformation Raise).
- **Action strip:** optional CTA pill (only when the lead isn't already resolved) plus three navigation chips (Pipeline / Studia / Concetti) to the subject's other surfaces.

## Do's and Don'ts

### Do:
- **Do** give each subject card exactly one Display-tier lead headline; resolve competing candidates through the fixed priority order in `calcLead`, never render two.
- **Do** make the exam countdown badge visually outrank all other metadata (Micro tier) on the card — see The Countdown Dominance Rule.
- **Do** build structure inside editorial cards with `1px solid var(--rule)` hairlines, not borders or background steps.
- **Do** keep pill shape exclusive to chips, tabs, badges, and the CTA — never on a primary button or content card.
- **Do** use monospace only for concept IDs, skill names, and job output.
- **Do** show a filling FaseTracker segment (verde) when a pipeline phase's backlog reaches zero, not just a decrementing number.

### Don't:
- **Don't** add `box-shadow` anywhere: the system has none, on either editorial or utility surfaces.
- **Don't** put a border on an editorial subject card — its separation is whitespace (`1.25rem` gap) and hairlines only. (Utility-surface cards keep their border; that split is intentional, not a lapse to unify.)
- **Don't** use the four status colors decoratively or interchangeably — each has exactly one semantic role.
- **Don't** introduce a radius outside `3px` / `6px` / `999px` — the old `10px`/`8px`/`4px` scale is retired.
- **Don't** introduce a kicker/eyebrow line above the lead headline: the masthead row (subject name + countdown) already carries that identifying role natively in this newspaper world — a separate small-caps eyebrow above `.card-lead` would be a redundant, uncredentialed addition, not a documented component.
