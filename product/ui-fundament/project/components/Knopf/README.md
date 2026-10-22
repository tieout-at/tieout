# Knopf

Primary in ink, otherwise with a border; a key hint shows the shortcut.

**Reference:** reebuild (radius 6, weight 500, primary button almost black), Attio (primary button `#242629`), Linear triage (keys 1/2/3/H).

**Usage**
- `sw-btn--primary` at most once per area. Verb first: „Übernehmen“ (accept), „Freigeben als Insider“ (approve as insider).
- Sizes: `control-h` (32) in content, `sw-btn--sm` (`tab-h`, 28) in headers and panel headers.
- Border `field-border` (≥ 3:1). Disabled: `aria-disabled="true"` and a tooltip with the reason.
- Shortcuts do not fire with Ctrl, Alt or Cmd and not on held keys.
