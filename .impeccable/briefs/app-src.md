# Surface Brief: StudyLab Web App — Full Redesign

## Scope
All surfaces: Dashboard, Materiali, ActiveRecall, Concetti, App shell + navigation.
Mode: **Operate**. The visitor completes study tasks; expression never obscures the task.

## Audience and job
Italian university student (engineering/CS). Primary trigger: after class — arrives with new material, wants to process it quickly and see the subject's full state. Mental model: per subject, not per phase.

## Chosen direction
**The Front Page** (seed 4eab5afd, assigned index 4).

## Direction contract

**THESIS:** Every subject opens like a newspaper front page: the most urgent action is the lead story in large bold type, secondary stories go into column sidebars, the masthead is the subject name + exam countdown. This refuses the current equal-weight overload (pipeline strip, heatmap, 4 chips, countdown all competing at the same visual rank).

**OWN-WORLD:** Cool light ground (`#f2f1ef`) — not warm cream, colder and crisper than the old avorio. Very dark near-black headlines (`#101010`). Hairline rules (`1px`) as the only structural element between sections. System sans at extreme weights: 800 for lead headlines, 400 for body, 700 for masthead dateline. Accent: deep editorial blue (`#1e4080`) for interactive actions. Semantic status colors intact (verde/ambra/arancio/rosso). No shadows; borders replaced by hairlines where possible. Dark-mode: surfaces flip to `#141418`/`#1c1c22`, headlines to `#eceae6`.

**Raises from declined challengers:**
- *Transformation Raise* (from silk-cape): pipeline step completion shows as a visible state change — not just a number decrement; the phase visually "advances".
- *Density Raise* (from cloud-quarry): visual weight (size, weight, spacing) strictly tiered: primary action at 2rem/800w, secondary info at 0.88rem/400w, metadata at 0.72rem/uppercase.
- *Time Raise* (from calendar): exam countdown is dominant at the top of every subject card — bold, dated, larger than any metadata.

**STORY:** Student opens app after class. Each subject card reads immediately: exam in N days, primary action ("3 CARTE DA RIPASSARE" or "2 LEZIONI GREZZE"), pipeline state in columns. Click the lead → task starts. Subject state is scannable in 2 seconds without reading every cell.

**FIRST VIEWPORT (Dashboard):**
- Thin masthead strip: "STUDYLAB" left, formatted date right, global review CTA (pill button) if cards are due.
- Subject cards stacked vertically (not a 2-col grid), each card full-width.
- Card internal layout: [masthead row: SUBJECT NAME (800w, 1.1rem uppercase) + EXAM COUNTDOWN badge] → hairline → [lead headline: primary action text (800w, 1.9rem, tight letter-spacing)] → [secondary line: second-priority item (400w, 0.9rem, muted)] → hairline → [three-column info strip: Pipeline | Concetti | Esami with counts] → [action strip: primary CTA button + secondary chips].
- Cards separated by visible whitespace, no card border — hairline rules inside the card do all the structure.

**FORM:** Newspaper editorial hierarchy. Position 4 on grounded list. Seed: 4eab5afd.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
