**THIS FILE OVERRIDES ANYTHING IN ALL OTHER FILES IN THIS DIRECTORY.**

ANYTHING IN THIS FILE IS THE SOURCE OF TRUTH IF IT CONTRADICTS WITH AN INSTRUCTION OR GUIDELINE IN ANOTHER FILE IN THIS DIRECTORY. 

# 3ncryp70M41l: Spatial / Depth UI Design

Binding design direction for the new 3ncryp70M41l (EncryptoMail) UI. Read it fully before touching anything under `frontend/`. If another file in `AGENTS/` conflicts with this one, this one wins.

## 1. Goal

3ncryp70M41l is a fork of Pelton with a new UI and a few bug fixes. The new UI is a **spatial / depth layout**: the interface is a small stack of layers along a z-axis, and moving through mail means moving between layers, not between flat panes.

The result should feel futuristic and calm. Depth, blur, and motion carry the design. Decoration does not.

## 2. Hard constraints

- **No terminal theme.** No monospace-everywhere styling, phosphor/CRT effects, scanlines, fake boot sequences, or hacker-console aesthetics.
- **Zero telemetry, no stray network calls.** The frontend must not request remote fonts, icons, scripts, avatars, or images. Bundle everything locally. Remote content in mail stays blocked by default, as in upstream.
- **Linux first.** Primary target is Linux (WebKitGTK via Wails). Windows is nice to have. Never add something that only works on one platform without a fallback.
- **Keep upstream mergeable.** The Go backend is shared with upstream Pelton. Change the Wails bindings (method names, signatures, event names) only when unavoidable, and note every such change in the commit message. Most work belongs in `frontend/`.
- **Licensing.** The project is GPL-3.0. Keep existing license headers, `LICENSE`, `DISCLAIMER.md`, and upstream attribution intact.
- **Stack.** Use whatever the frontend already uses (Svelte, as in upstream). Do not introduce a new framework or a heavy animation/3D library without asking. CSS transforms and the Web Animations API are the default tools.

## 3. Layer model

The UI is four layers. Each has a fixed role and a fixed place in the depth order, back to front.

| Layer | Role | Notes |
| --- | --- | --- |
| **0. Ambient** | Background | Subtle gradient or tint. Decorative only. May reflect account color. Must never reduce text contrast. |
| **1. Stack** | Conversation list | Conversations are cards in a vertical stack with slight depth falloff (scale, opacity, and blur increase with distance from the focused card). |
| **2. Focus** | Open message / thread | The opened conversation moves forward. Layer 1 recedes (scale down, blur, dim) but stays visible as context. |
| **3. Overlay** | Command bar, orbital folder menu, composer, dialogs | Always on top. Dismissing returns focus to where it came from. |

Rules:

- Opening a message is a move **forward** on the z-axis; closing it moves **back**. Keep that mapping consistent everywhere (composer opens forward, dismisses back).
- Only one layer is "active" at a time. Inactive layers are non-interactive (`inert`) and not in the tab order.
- Depth cues must be redundant with real structure: layout and DOM order must remain correct and usable even with all effects turned off.

## 4. Core components

### 4.1 Conversation stack
- Cards show sender avatar, sender, subject, a one-line preview, time, and compact status glyphs (unread, flag color, attachment, security state).
- The focused card is crisp and full size. Neighbors fall off smoothly in scale, opacity, and blur. Cap the falloff at a few cards so scrolling stays cheap.
- Selection moves with arrow keys / `j` `k` and the mouse wheel. Scrolling must stay smooth with thousands of messages, so virtualize the list.
- Avatars use the fallback chain: cached Gravatar (only if the user enabled it, fetched by the Go backend, never by the webview) then a generated hash-based glyph.

### 4.2 Focus view (reader)
- The reader slides forward over the dimmed stack. It does not cover the stack completely, so the user keeps a sense of place.
- **HTML mail renders in a sandboxed iframe (`srcdoc`) with a strict CSP.** Keep the iframe element itself free of 3D transforms, filters, and scaling. Animate only its container's opacity and translation, because transforms on the frame can cause blurry or mis-sized mail rendering.
- Reader modes: plain-text-first, original (as sent, sandboxed), and normalized dark (forced readable contrast). The user's choice persists.
- Show a **remote content blocked** strip per message with a one-click allow for that message.

### 4.3 Orbital folder menu
- Summoned with a key (default `g`) or a floating handle. Folders and accounts appear on a radial arrangement around the focus point at Layer 3.
- It must also work as a plain keyboard-navigable list: arrow keys, type-to-filter, `Enter` to select, `Esc` to dismiss.
- No permanent sidebar by default. Allow an optional pinned rail for wide windows.

### 4.4 Timeline scrub bar
- A slim bar along the bottom maps the current folder to time. Dragging it scrubs the stack to that point. Show date ticks and a small label while dragging.
- Keyboard equivalents: jump by day / week / month.

### 4.5 Command bar
- A floating input (default `Ctrl+K`) for fuzzy-finding messages, folders, and actions. Everything reachable by mouse must be reachable here.

## 5. Security as a visual signature

Encryption is the app's identity, so make it legible, not decorative.

- Every message shows compact glyphs for **signature** (verified / unverified / invalid), **encryption** (encrypted / not), and **transport** (TLS state).
- In the reader, a brief, subtle sweep plays once when a message is successfully verified or decrypted. Never loop it. Never play it for failures.
- Failures and warnings (invalid signature, mismatched key, TLS problem) must be unmistakable, using color plus shape plus text. They must not rely on the ambient/glow language.
- Never auto-load remote content to "improve" the look.

## 6. Visual language

These are defaults, not scripture. Put every value behind a CSS custom property so it can be changed in one place.

- **Tokens first.** Define color, spacing, radius, blur, elevation, and motion as CSS variables in a single theme file. No hard-coded colors in components.
- **Themes.** Ship a light and a dark theme that follow the system preference, with an override in settings.
- **Typography.** Use a clean, highly legible sans-serif for UI and message text, bundled locally. Reserve monospace for code blocks and headers/raw views where it helps.
- **Accent.** One primary accent plus semantic colors (ok / warn / danger / secure). Account colors are secondary tints, never the primary accent.
- **Depth.** Express depth through scale, soft shadow, and limited blur, not through heavy 3D perspective on text.

## 7. Motion

- Spring-style easing for layer transitions. Keep durations short (roughly 150 to 350 ms) and interruptible: a second keypress mid-transition must not queue animations.
- Animate `transform` and `opacity` only. Avoid animating `filter`, `box-shadow`, `width`, `height`, or `top`/`left` on large areas.
- Honor `prefers-reduced-motion`: replace movement with instant or cross-fade changes, and disable ambient animation.

## 8. Performance and effects levels

WebKitGTK handles `backdrop-filter` and large blurs less smoothly than Chromium. Treat effects as optional enhancements.

- Provide an **Effects** setting with three levels: **Full**, **Reduced** (no live blur, simpler shadows, no ambient animation), and **Off** (flat, no motion).
- Default to **Reduced** on first run until effects are confirmed to perform acceptably. Never silently change the user's choice.
- Limit the number of simultaneously blurred elements, and never blur the same region twice (no stacked `backdrop-filter`).
- Test on real Linux hardware under WebKitGTK, not only in a browser. Check scrolling, layer transitions, and the HTML mail reader.

## 9. Accessibility and input

- Every spatial interaction has a keyboard path and a plain-DOM fallback.
- DOM and focus order must match the visual front-to-back reading order. Use `inert` on non-active layers and manage focus when layers open and close (restore focus to the triggering element).
- Text contrast must meet WCAG AA in every theme and effects level, including over the ambient layer.
- Do not communicate state by color alone.
- Respect system font-size and scaling settings.
- Dragging (timeline, swipe actions) always has a non-drag alternative.

## 10. Instructions for agents

**Do**
- Read the existing frontend structure and follow its conventions before adding files.
- Build in small, reviewable steps: tokens and layer scaffolding first, then stack, then focus view, then overlays, then polish.
- Keep each change self-contained and describe what you verified.
- Add or update tests where the project already has them.
- Ask before introducing dependencies, changing Wails bindings, or touching the Go backend.

**Don't**
- Don't add a terminal/monospace "hacker" look in any form.
- Don't add telemetry, analytics, remote fonts, CDN assets, or any request to a third party.
- Don't render mail HTML outside the sandboxed iframe, and don't loosen the CSP to make a message look better.
- Don't make a depth effect the only way to convey information.
- Don't remove upstream license or attribution text.
- Don't rewrite large areas of the Go code as part of a UI task.

## 11. Definition of done (per feature)

- Works on Linux under WebKitGTK at all three effects levels.
- Fully usable with keyboard only and with reduced motion on.
- No network requests from the webview beyond what upstream already does.
- Light and dark themes both look correct, with AA contrast.
- HTML mail still renders correctly and safely in the reader.
- No Wails binding changes unless explicitly called out.

## 12. Color Palette
- Midnight #101827
- Deep blue #122D43
- Electric cyan #42D9FF
- Ice white #F0F6FC
- Steel #8B9BB4

## 13. Typography
Primary: GltpStarion.otf
Monospace: VictorMonoNerdFont.ttf
Branding: GlitchGoblin.otf

These three fonts are located in `/encrypto-fonts/`. Move them to their proper location in the project before using them.
