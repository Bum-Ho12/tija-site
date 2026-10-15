# Plan: tija-site as the user guide and support site

Source of the public pages for Tija, served by GitHub Pages at
`https://bum-ho12.github.io/tija-site/`. Every fact on the site comes from the
`tija` app repo (code, `README.md`, `docs/`); file references below are in
that repo.

## 1. Starting point (Oct 12, 2026)

Three pages, each with its own copy of an inline `<style>` block in Material
purple (`#6750a4` / `#cfbcff`): a placeholder `index.html`, a detailed
`privacy.html` and `delete-account.html`. No shared CSS, favicon, Open Graph
tags, sitemap, 404 page or navigation. The app's brand is green
(`AppColors.lightPrimary #2E7D32`, `darkPrimary #4ADE80`).

Where the existing URLs are used, so they must not change:

| URL | Linked from |
| --- | --- |
| `privacy.html` | App: Profile → About Tija (`about_page.dart:11`); Play Console; README; `docs/ai.md`; App Store (planned, `release-ios.md:111`) |
| `delete-account.html` | Play Console data-deletion field (`release-android.md:145`); README; `privacy.html` |
| `/` (site root) | App Store Support URL (planned, `release-ios.md:138`); Microsoft Store Website field |

## 2. Problems fixed in the legal pages

| # | Where | Problem | Fix |
| --- | --- | --- | --- |
| 1 | `privacy.html` intro | "applies to the Tija app on Android" | Covers Android, Windows, and iOS/macOS when released |
| 2 | `privacy.html` summary | "never leave your phone" | "device" |
| 3 | `privacy.html` §3 | "The AI built into your phone" | Built-in AI is Apple Intelligence or Gemini Nano; on Windows only downloaded models run on the device |
| 4 | `privacy.html` | Nothing on where data is stored | New section: app sandbox on phones, `%LOCALAPPDATA%\Tija` on Windows (`release-windows.md`) |
| 5 | `privacy.html` §3 | **Missing:** "Your own model" says text goes only to the chosen provider, but when that model fails the app can retry on Claude through Tija Cloud. The setting is **on by default for API-key providers** and off for Ollama, LM Studio and on-device models (`docs/ai.md:45-51`) | Disclose the fallback, its defaults and the setting name "If it fails, use Claude" |
| 6 | `privacy.html` | Says "Settings → AI"; the app says **Profile → AI Assistant** (`profile_body.dart:104`) | Use the app's path |
| 7 | `delete-account.html` | "tap" | The flow is the same widget on every platform (`CloudSyncSettingsWidget`), so only the verb changes ("select") |

## 3. Corrections to the first draft of this plan

Verified against the app code:

- Navigation is **Home, Files, Add, Templates, Profile** (bottom bar on
  phones, sidebar on wide screens), not "Home, Tasks, Templates, Profile".
- The welcome tour is Welcome, Write, Plan, AI assistant, Sync, Reminders
  (`onboarding_step.dart:64`). There is no "Private by design" step; the
  landing page's privacy card is based on the privacy policy instead.
- The app links only `privacy.html`, not `delete-account.html`.
- `MarkdownSettingsPage` has a route but nothing in the app opens it, so the
  guide doesn't document it.
- AI settings are at **Profile → AI Assistant**. The connected-apps section
  is **Connect other AI apps** with the button **Connect an app**, the
  toggle **Allow changes** and the action **Disconnect**, and it only
  appears when signed in.
- The morning brief is a switch in **AI Assistant** settings and is
  "Android and iOS only".
- Exact labels: "If it fails, use Claude"; "The model can read images".
- Search by meaning has its own allowance (200 a day), separate from the
  model allowances (Haiku 15, Sonnet 10, Opus 5, reset at midnight UTC).
- Model sizes from `ai_assist.dart`: Qwen3.5 0.8B 0.53 GB, 2B 1.28 GB,
  4B 2.74 GB ("For computers and recent high-end phones (8 GB RAM)").
- The app's own reminder hint is about Android battery optimisation; Windows
  "Focus Assist" is called **Do not disturb** on Windows 11.
- Windows isn't live on the Microsoft Store yet and iOS/macOS aren't
  released, so all three show "Coming soon".

## 4. Decisions

| Question | Decision |
| --- | --- |
| Brand colour | Switch to the app's green |
| Microsoft Store link | "Coming soon" badge until the listing is live |
| Screenshots | None until real Android and Windows screenshots are supplied; no mock-ups |
| Support email | `npomhoyr@gmail.com`, as on the privacy page |
| Terms of use | Not now; add before charging for anything |
| Shared header/footer | Plain static HTML, copied into each page between `<!-- HEADER -->` / `<!-- FOOTER -->` markers. Keeps `python3 -m http.server` previews exact and needs no build. Jekyll includes were considered; revisit if the copies drift |
| Guide scope | 7 pages instead of 9: templates are merged into tasks, data & storage into sync |

## 5. Structure

```text
tija-site/
├── index.html               Landing
├── guide/
│   ├── index.html           Guide home
│   ├── getting-started.html
│   ├── notes-editor.html
│   ├── tasks-templates.html Tasks, calendar, search, templates
│   ├── reminders.html
│   ├── sync-account.html    Accounts, sync, data & storage
│   ├── ai-assistant.html
│   └── connect-ai-apps.html
├── support.html             Contact, FAQ, known issues
├── whats-new.html           Release notes
├── privacy.html             Same URL
├── delete-account.html      Same URL
├── 404.html
├── assets/css/site.css      Design system
├── assets/js/site.js        Theme toggle, menu, TOC, copy buttons, FAQ filter, reveal
├── assets/fonts/            Inter + JetBrains Mono, subset woff2 (+ OFL licence)
├── assets/img/              Icons, favicon, og-image
├── partials/                Shared head, header, footer, guide sidebar
├── tools/sync-partials.py   Copies partials into every page (see below)
├── tools/og-image.html      Source of assets/img/og-image.png
├── sitemap.xml, robots.txt, .nojekyll
└── PLAN.md                  This file
```

Pages are complete static HTML. Shared markup sits between
`<!-- PARTIAL:name -->` markers. After editing a file in `partials/`, run
`python3 tools/sync-partials.py` from the repo root; it also writes each
page's canonical and Open Graph tags from its `<title>` and description.
`404.html` uses absolute `/tija-site/` links because Pages serves it at any
depth, so it only previews correctly on the live site.

`robots.txt` only takes effect at a domain root, so on a project site
(`bum-ho12.github.io/tija-site/`) crawlers ignore it; submit `sitemap.xml`
in Google Search Console instead if wanted.

## 6. Design

- Tokens match the app: accent `#2E7D32` / `#4ADE80`; backgrounds
  `#ffffff` / `#0f1411`; cards `#f3f7f3` / `#18201b`.
- Inter and JetBrains Mono self-hosted (no Google Fonts requests, which the
  privacy policy's "no tracking" promise relies on).
- Theme follows the system; a toggle overrides it and is remembered in
  `localStorage` (wrapped in try/catch).
- Guide pages: sidebar, article, "On this page" contents generated from
  `h2`s. On phones the sidebar becomes a menu.
- Parts: buttons, cards, callouts (note/tip/warning), `kbd`, steps, code
  blocks with a copy button, store badges, platform chips.
- Motion: fade-and-rise on scroll, disabled for `prefers-reduced-motion`.
- Accessibility: AA contrast, focus rings, skip link, one `h1` per page.
- No analytics or third-party requests of any kind.

## 7. Phases

| Phase | Work | Status |
| --- | --- | --- |
| 1 | Foundation: CSS, JS, fonts, icons, `.nojekyll` | Done |
| 2 | Legal fixes (§2) on `privacy.html` and `delete-account.html` | Done |
| 3 | Landing page | Done |
| 4 | Guide (7 pages + home) | Done |
| 5 | Support, What's new, 404 | Done |
| 6 | SEO: meta, canonical, OG, `sitemap.xml`, `robots.txt`, JSON-LD | Done |
| 7 | App repo follow-ups (§8) | To do, in `tija` |

## 8. Follow-ups outside this repo

- **`SUPPORT_EMAIL`:** `email_service.dart` falls back to
  `support@yourapp.com` when it's missing from `.env`, and the local `.env`
  doesn't set it. Confirm release builds set it, or in-app bug reports and
  AI content reports go nowhere.
- **About page:** `about_page.dart` still says 0.2.0+20 while `pubspec.yaml`
  is 0.2.1+21. Add 0.2.1 notes there and on `whats-new.html`.
- **Markdown settings:** wire up `CallRoutes.toMarkdownSettings` or remove
  the page ("Editor Settings").
- **"Force Full Sync"** (`cloud_sync_settings_widget.dart:106-126`) only
  shows two snackbars and never syncs. Fix or remove it; the guide doesn't
  mention it.
- **Help & Feedback** never attaches screenshots or device info
  (`report_page.dart:44-55`), though `EmailService` supports both. The privacy
  policy says "if you add them", so it stays accurate either way.
- Small copy fixes in the app: "Cannot ser reminder" (reminder sheet),
  "Insert an mage" (block-type bar).
- Not supported yet, so the guide says so: repeating reminders, renaming
  folders, deleting folders on phones, a table button.
- Optional: link Help & Feedback / About to `support.html` and `guide/`.
- Confirm downloaded models run on Windows before the guide promises more
  than it does now.

## 9. Checking the work

1. `python3 -m http.server 8000` in this folder, then open
   `http://localhost:8000/`. Check light and dark, 375 / 768 / 1440 px,
   keyboard-only navigation.
2. Lighthouse ≥ 95 in every category.
3. Every internal link resolves, especially `privacy.html` and
   `delete-account.html`.
4. Push to `main`, wait for Pages, check the live URLs.
5. Partner Center: Website = site root, Privacy policy URL = `privacy.html`,
   Support contact = the support email or `support.html`.
