# Fogberry Games — website

The marketing site for **Fogberry Games**, a self-publishing board game company
in Corner Brook, Newfoundland, and home of the card game **Jig**.

It's a fast, single-page static site hosted free on **GitHub Pages**, with a
built-in content editor at **`/admin`** so the text can be updated without
touching code.

---

## What's in here

| Path | What it is |
|------|------------|
| `src/content.json` | **All the words on the site.** This is what the editor changes. |
| `src/index` *(none — see below)* | The page is assembled by `build.js`, not hand-edited. |
| `build.js` | Zero-dependency build: turns `content.json` → `_site/index.html`. |
| `src/styles.css` | All styling (colours, fonts, layout). |
| `src/assets/` | Logo, Jig card art, favicons (optimised for web). |
| `src/admin/` | The content editor (Sveltia CMS) + its `config.yml`. |
| `.github/workflows/deploy.yml` | Builds and publishes the site on every push. |
| `_site/` | Build output. Generated — never edit by hand (git-ignored). |

---

## Editing the site

### The easy way — the `/admin` editor (for non-technical edits)

Once it's turned on (see **Turning on the editor** below), go to
**`https://<your-site>/admin/`**, log in with GitHub, change any text, and click
**Publish**. The site updates itself in 1–2 minutes.

Tip: in body fields, leave a **blank line between paragraphs** to start a new one.

### The direct way — edit the file

Edit `src/content.json` and commit. GitHub rebuilds and republishes automatically.

To preview locally first:

```bash
npm run build      # writes _site/
npm run serve      # builds + serves at http://localhost:8099
```

(Only Node.js and Python 3 are required — no other tools.)

---

## Hosting on GitHub Pages

1. Create a GitHub repo and push this folder to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. That's it. The included workflow (`.github/workflows/deploy.yml`) builds the
   site and deploys it on every push to `main`.

Your site will be at `https://<owner>.github.io/<repo>/`.

---

## Connecting the domain (fogberrygames.ca / .com) — later

When the domain is purchased:

1. Create a file `src/CNAME` containing just the domain, e.g.:
   ```
   fogberrygames.ca
   ```
   (`build.js` copies it into the published site automatically.)
2. At your domain registrar, point DNS at GitHub Pages:
   - **A records** for the apex (`fogberrygames.ca`) →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME record** for `www` → `<owner>.github.io`
3. In **Settings → Pages → Custom domain**, enter the domain and tick
   **Enforce HTTPS** once the certificate is issued.

You can own both `.ca` and `.com` and redirect one to the other at the registrar.

---

## Turning on the editor (`/admin`) — one-time setup

The editor commits changes straight to GitHub, so it needs permission to log in.
On GitHub Pages this requires a small, free, one-time setup by someone technical.
**The site works fully without this — the editor is a convenience.** Until it's
set up, edits can be made directly in `src/content.json`.

The editor is **[Sveltia CMS](https://github.com/sveltia/sveltia-cms)** (a modern,
drop-in replacement for Decap/Netlify CMS). To enable GitHub login:

1. **Register a GitHub OAuth app**
   (GitHub → Settings → Developer settings → OAuth Apps → New):
   - Homepage URL: your site URL
   - Authorization callback URL: your OAuth relay URL (next step)
2. **Deploy a tiny OAuth relay.** The simplest free option is a Cloudflare Workers
   relay — Sveltia documents this here:
   <https://github.com/sveltia/sveltia-cms#working-with-a-local-git-repository> and
   <https://github.com/sveltia/sveltia-cms#getting-started>. (The community
   `sveltia-cms-auth` Worker is a one-click deploy.)
3. **Edit `src/admin/config.yml`:**
   - set `repo:` to `OWNER/REPO`
   - set `base_url:` to your relay URL
   - update `site_url` / `display_url`
4. Whoever edits the site needs a (free) GitHub account with write access to the repo.

> Prefer zero setup? A simpler alternative is to skip the relay and just edit
> `src/content.json` on github.com directly (pencil icon → commit). It's less
> pretty but needs nothing extra.

---

## The email sign-up form

The "Email list" section shows a sign-up form when a form URL is configured, and a
friendly "email us to be added" message when it isn't (the current default).

To connect a real newsletter (Mailchimp, Buttondown, Beehiiv, etc.):

1. In that tool, create an embedded/hosted form and copy its **form action URL**.
2. In the `/admin` editor → *Email list section*, paste it into
   **Sign-up form action URL** (and set the email field name if it isn't `email`).

The form then posts subscribers straight to your provider — no backend needed.

---

## Source assets

The original files this site was built from live in `assets/` at the repo root
(`fogberry_logo.jpg`, `Handline 3.jpg`, `fogberry_webpage.rtf`). The web-optimised
versions used by the site are in `src/assets/`.
