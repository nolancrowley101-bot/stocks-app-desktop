# stocks-app-desktop

Native desktop client for [stocks-services.com](https://stocks-services.com).
React + Vite frontend wrapped with Tauri 2 (Rust). All market data flows through
the existing VPS backend — there is no separate API.

## What's in here

- `src/` — React UI (markets overview, quote view + chart, watchlist, alerts,
  settings, download links). Tailwind v4 styling matched to the website.
- `src-tauri/` — Rust shell. Plugins: `http` (CORS-free fetch), `notification`
  (native OS alerts), `opener` (open external links).
- `.github/workflows/release.yml` — Builds `.exe` / `.dmg` / `.AppImage` on tag
  push and uploads them to the VPS `/srv/stocks-downloads/` directory.

## Local development

Prereqs (once):

```powershell
winget install Rustlang.Rustup
# Plus "Desktop development with C++" workload from the VS Build Tools installer:
#   https://aka.ms/vs/17/release/vs_BuildTools.exe
```

Then:

```bash
npm install
npm run tauri dev
```

The first `tauri dev` compiles all Rust deps and takes a few minutes; later
builds are incremental.

## Production builds

Locally (Windows only — produces `.exe`):

```bash
npm run tauri build
# → src-tauri/target/release/bundle/nsis/Stocks-Services_0.1.0_x64-setup.exe
```

Cross-platform builds happen in CI. Push a tag like `v0.1.0` and GitHub Actions
will:

1. Build `.exe` on `windows-latest`
2. Build universal `.dmg` on `macos-latest`
3. Build `.AppImage` + `.deb` on `ubuntu-22.04`
4. Attach all four to a GitHub Release
5. SCP the files (plus `latest`-aliased copies and a `SHA256SUMS`) to the VPS at
   `/srv/stocks-downloads/`, which nginx serves at
   `https://stocks-services.com/downloads/`.

Required GitHub Actions secrets:

| Secret | Value |
|---|---|
| `VPS_HOST` | `45.79.217.21` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Private SSH key authorized in `deploy@`'s `authorized_keys` |

## VPS prep (one-time)

```bash
ssh deploy@45.79.217.21
sudo mkdir -p /srv/stocks-downloads
sudo chown deploy:deploy /srv/stocks-downloads
# nginx config update is already in stocks-app/nginx.conf — reload after deploy:
sudo nginx -t && sudo systemctl reload nginx
```

## How the app talks to the backend

It calls these public endpoints on `stocks-services.com`:

- `GET /api/search?q=…`
- `GET /api/quote/[symbol]`
- `GET /api/quote/[symbol]/chart?range=…`

Requests go through Tauri's HTTP plugin (Rust-side `reqwest`) so there's no
browser CORS to worry about. The allowed origin list is locked down in
`src-tauri/capabilities/default.json`.

Watchlist and alerts are stored locally (`localStorage`) — no auth needed.
