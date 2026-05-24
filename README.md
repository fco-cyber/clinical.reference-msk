# Clinical Reference — The Integrated Hub

An integrated clinical reference spanning nine musculoskeletal, osteopathic and
diagnostic compendia:

- Clinical Sports Medicine
- Compendium of Musculoskeletal Rehabilitation
- The Five Osteopathic Models
- Foundations of Osteopathic Medicine
- MSK Clinical Reference — Conditions & Examinations
- Murtagh — A Diagnostic & Clinical Reference
- Muscle Reference
- Pathophysiology (Banasik)
- Magee — Orthopedic Physical Assessment

The single-file HTML app has been packaged two ways from one codebase: as an
installable **Progressive Web App** hosted free on **GitHub Pages** (works on
Windows, macOS, Linux, iOS, iPadOS, Android and ChromeOS), and as **native
desktop applications** — a Windows `.exe`, a macOS `.dmg` and a Linux
`.AppImage` — compiled automatically by GitHub.

---

## What the packaging adds

The app logic and content are untouched. Only the packaging was added:

- **Fonts self-hosted.** The eight Google Font families the app uses (Fraunces,
  Inter Tight, Inter, Source Sans 3, Cormorant Garamond, IBM Plex Sans, IBM Plex
  Mono, JetBrains Mono) are bundled in `assets/fonts/`. The app never contacts
  Google — it works with **zero network access, even on first launch**.
- **PWA wrapper.** A web app manifest, an app icon set and a service worker make
  the app installable and fully offline.
- **Desktop wrapper.** A Tauri project (`src-tauri/`) lets the same app compile
  into native `.exe`, `.dmg` and `.AppImage` installers.
- **Auto-deploy.** Two GitHub Actions workflows: one publishes the web app to
  GitHub Pages, the other builds the desktop installers.

---

## Repository layout

```
.
├── index.html                  The app — a single-file hub (~13 MB)
├── manifest.webmanifest        PWA install metadata
├── service-worker.js           Offline cache controller (cache-first)
├── package.json                Desktop-build tooling (Tauri CLI)
├── package-lock.json
├── .nojekyll                   Serve files as-is on GitHub Pages
├── .gitignore
├── README.md
├── .github/
│   └── workflows/
│       ├── deploy.yml          Build & deploy the PWA to GitHub Pages
│       └── desktop.yml         Build the .exe / .dmg / .AppImage installers
├── assets/
│   ├── fonts/                  fonts.css + 20 self-hosted .woff2 files
│   └── icons/                  web app icons, maskable icons, favicons
└── src-tauri/                  Native desktop wrapper (Tauri)
    ├── tauri.conf.json         Desktop app config — name, window, icons
    ├── Cargo.toml              Rust crate manifest
    ├── build.rs
    ├── capabilities/           Tauri permissions
    ├── icons/                  Desktop app icons (.ico, .icns, .png)
    └── src/                    Minimal Rust entry point
```

---

## Deploy the web app to GitHub Pages

You only do this once. After that, every change you push goes live automatically.

**1. Create a repository.** On GitHub, click **New repository**, name it, and
leave it empty (no README — this folder already has one).

> **Public vs private:** GitHub Pages is free for **public** repositories. To
> keep a repository **private** and still use Pages you need a paid GitHub plan.

**2. Upload the files.** Upload the **entire contents** of this folder, including
the hidden `.github`, `.nojekyll` and `.gitignore` items. The most reliable way
is `git`, which never skips hidden files:

```bash
git init
git add .
git commit -m "Clinical Reference"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

If you upload through the browser instead, first reveal hidden files in your file
manager (on macOS, press Cmd+Shift+.) so the `.github` folder is included — it
holds the build workflows.

**3. Turn on Pages.** In the repo, go to **Settings → Pages**, and under
**Build and deployment → Source**, choose **GitHub Actions**.

**4. Wait for the build.** Open the **Actions** tab; the *Deploy to GitHub Pages*
workflow runs automatically. When it finishes, your app is live at
`https://<your-username>.github.io/<repository-name>/`.

The app uses only relative paths, so it works whether served from that sub-path
or a custom domain.

---

## Install the web app

Open the live URL, then:

- **Windows / macOS / Linux / ChromeOS (Chrome or Edge):** click the **install
  icon** in the address bar, or the browser menu → *Install Clinical Reference…*
- **macOS Safari:** **File → Add to Dock**.
- **iPhone / iPad (Safari):** **Share → Add to Home Screen**.
- **Android (Chrome):** menu **⋮ → Add to Home screen / Install app**.

Once installed it opens in its own window, has its own icon, and runs offline.

---

## Desktop apps (.exe / .dmg / .AppImage)

The repository can also build genuine native desktop installers. They are
compiled by GitHub's own Windows, macOS and Linux servers (desktop apps cannot
be cross-built — a `.dmg`, for instance, can only be produced on macOS), using
the [Tauri](https://tauri.app) wrapper in `src-tauri/`.

**To produce the installers:**

1. Make sure the repository is on GitHub (see the deployment steps above).
2. Open the **Actions** tab, choose **Build desktop apps** from the list on the
   left, and click **Run workflow**.
3. Wait roughly 10–15 minutes while all three platforms build.
4. A new **draft Release** appears under the repo's **Releases** section, holding
   the `.exe`, `.dmg` and `.AppImage`. Review it and click **Publish release**.

To issue a new version later, raise the `version` number in
`src-tauri/tauri.conf.json`, commit, and run the workflow again.

**Opening the apps.** These builds are **not code-signed**. They run perfectly
well, but the operating system shows a one-time caution the first time:

- **Windows** — at the SmartScreen prompt, click **More info → Run anyway**.
- **macOS** — right-click (or Control-click) the app and choose **Open**, then
  confirm; or approve it under **System Settings → Privacy & Security**.
- **Linux** — make the file executable (`chmod +x *.AppImage`) and run it.

---

## Offline behaviour

The service worker caches the whole app — the hub, every font and every icon —
the first time it is opened online. From then on it loads entirely from the
local cache and needs **no network at all**.

To preview locally, serve the folder over HTTP (service workers do not run from
`file://`):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

---

## Updating the app

Replace `index.html` with a fresh export, commit, and push to `main`. The Pages
workflow rebuilds and redeploys automatically, stamping a fresh version into the
service worker so installed copies pick up the change on their next launch.

If you regenerate `index.html` from an updated source export, keep the
`<link rel="manifest">`, the icon links and the service-worker registration
script in the document `<head>`, and keep the font links pointing at
`assets/fonts/fonts.css`.

---

## Notes on the source material

This app reproduces and reorganises material derived from clinical textbooks.
You are responsible for ensuring your use and distribution comply with the rights
of the original publishers — consider keeping the repository private if it is
intended for personal or restricted educational use. No software licence is
applied to this repository for that reason.

The bundled typefaces are distributed under the **SIL Open Font License 1.1**
via the [Fontsource](https://fontsource.org) project.

---

*This is a clinical reference aid and does not replace professional clinical
judgement.*
