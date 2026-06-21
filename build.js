#!/usr/bin/env node
/*
 * Fogberry Games — static site build.
 * Zero dependencies. Reads src/content.json, renders src/index.template is
 * not used; the page is assembled here, then static files are copied to _site.
 *
 * Run:  node build.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, '_site');

// ---------- helpers ----------
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Body fields are plain multi-paragraph strings (blank line = new paragraph).
// Render each paragraph as a <p>. Text is escaped to keep output valid HTML.
const paras = (text) =>
  String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('\n          ');

// Navigation is structural (anchor ids must match section ids), so it lives
// here rather than in the CMS to keep editing safe and simple.
const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'games', label: 'Games' },
  { id: 'about', label: 'About' },
  { id: 'email', label: 'Email list' },
  { id: 'contact', label: 'Contact' },
];

function copyRecursive(from, to) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from)) {
      copyRecursive(path.join(from, entry), path.join(to, entry));
    }
  } else {
    fs.copyFileSync(from, to);
  }
}

// ---------- load content ----------
const c = JSON.parse(fs.readFileSync(path.join(SRC, 'content.json'), 'utf8'));
const year = new Date().getFullYear();
const siteTitle = `${c.site.company} — ${c.site.tagline}`;
const metaDesc = `${c.site.company}: a self-publishing board game company in ${c.site.location}. Home of Jig, a competitive card game of memory, deduction, and revenge.`;

// ---------- section renderers ----------
const navLinks = NAV.map((n) => `<a href="#${esc(n.id)}">${esc(n.label)}</a>`).join(
  '\n            '
);

// Email list section: render a real signup form when a form action is set,
// otherwise a graceful "email us to be added" fallback.
function emailSection() {
  const e = c.email;
  let inner;
  if (e.form_action && e.form_action.trim()) {
    inner = `
          <form class="signup" action="${esc(e.form_action)}" method="post" target="_blank" novalidate>
            <label class="sr-only" for="signup-email">Email address</label>
            <input id="signup-email" type="email" name="${esc(e.form_email_field || 'email')}"
                   placeholder="you@example.com" autocomplete="email" required>
            <button type="submit">${esc(e.button_label || 'Sign up')}</button>
          </form>`;
  } else {
    inner = `
          <p class="signup-fallback">
            Our sign-up form is on its way. In the meantime,
            <a href="mailto:${esc(c.site.email)}?subject=${encodeURIComponent('Add me to the Fogberry email list')}">email us</a>
            and we'll add you to the list.
          </p>`;
  }
  return `
      <section id="email" class="section section--tint">
        <div class="wrap narrow center">
          <h2>${esc(e.heading)}</h2>
          ${paras(e.body)}
          ${inner}
        </div>
      </section>`;
}

function aboutCards() {
  const a = c.about;
  const link =
    a.artist_link_url && a.artist_link_url.trim()
      ? ` <a href="${esc(a.artist_link_url)}" target="_blank" rel="noopener">${esc(
          a.artist_link_label || 'See more of his work.'
        )}</a>`
      : '';
  return `
          <article class="card">
            <h3>${esc(a.author_heading)}</h3>
            ${paras(a.author_body)}
          </article>
          <article class="card">
            <h3>${esc(a.artist_heading)}</h3>
            ${paras(a.artist_body)}${link ? `\n            <p>${link.trim()}</p>` : ''}
          </article>`;
}

// ---------- page ----------
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(siteTitle)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta name="theme-color" content="#e8551f">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(siteTitle)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="assets/logo-social.jpg">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="icon" href="assets/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#home">Skip to content</a>

  <header class="nav">
    <div class="wrap nav__inner">
      <a class="nav__brand" href="#home" aria-label="${esc(c.site.company)} home">
        <img src="assets/logo.webp" width="240" height="120" alt="${esc(c.site.company)} logo">
      </a>
      <button class="nav__toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav__links" id="nav-links">
        ${navLinks}
      </nav>
    </div>
  </header>

  <main>
    <section id="home" class="hero">
      <div class="wrap center">
        <p class="eyebrow">${esc(c.site.location)}</p>
        <h1>${esc(c.home.heading)}</h1>
        <div class="lede">
          ${paras(c.home.body)}
        </div>
        <a class="btn" href="#games">Meet Jig &rarr;</a>
      </div>
    </section>

    <section id="games" class="section">
      <div class="wrap games">
        <div class="games__text">
          <h2>${esc(c.games.heading)}</h2>
          ${paras(c.games.body)}
          <p class="badge">${esc(c.games.release)}</p>
        </div>
        <figure class="games__art">
          <img src="assets/jig-card.webp" width="500" height="688"
               alt="Illustration of a traditional Newfoundland jigger: a wooden handline reel wound with twine and a fishing hook." loading="lazy">
          <figcaption>The jigger &mdash; art from the Jig deck</figcaption>
        </figure>
      </div>
      <div class="wrap narrow history">
        <h3>${esc(c.games.history_heading)}</h3>
        ${paras(c.games.history_body)}
      </div>
    </section>

    <section id="about" class="section section--tint">
      <div class="wrap">
        <h2 class="center">About</h2>
        <div class="cards">
          ${aboutCards()}
        </div>
      </div>
    </section>

    ${emailSection()}

    <section id="contact" class="section">
      <div class="wrap narrow center">
        <h2>${esc(c.contact.heading)}</h2>
        ${paras(c.contact.body)}
        <a class="btn" href="mailto:${esc(c.site.email)}">${esc(c.site.email)}</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap center">
      <p><strong>${esc(c.site.company)}</strong> &middot; ${esc(c.site.location)}</p>
      <p class="muted">&copy; ${year} ${esc(c.site.company)}. All rights reserved.</p>
    </div>
  </footer>

  <script>
    // Mobile nav toggle + close on link tap.
    var toggle = document.querySelector('.nav__toggle');
    var links = document.getElementById('nav-links');
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  </script>
</body>
</html>
`;

// ---------- write output ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyRecursive(path.join(SRC, 'assets'), path.join(OUT, 'assets'));
copyRecursive(path.join(SRC, 'admin'), path.join(OUT, 'admin'));
fs.copyFileSync(path.join(SRC, 'styles.css'), path.join(OUT, 'styles.css'));
// .nojekyll tells GitHub Pages to serve files as-is (no Jekyll processing).
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(
  path.join(OUT, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /admin/\n'
);

// CNAME for the custom domain, when configured (set DOMAIN env or edit src/CNAME).
const cnameSrc = path.join(SRC, 'CNAME');
if (fs.existsSync(cnameSrc)) {
  fs.copyFileSync(cnameSrc, path.join(OUT, 'CNAME'));
}

console.log('Built _site/ ✓');
