# Lenon Adriano: Developer Portfolio

Cloud | DevOps | Security portfolio built with React, Vite and Tailwind CSS, deployed to GitHub Pages.

**Live:** https://l3n8n-ocd.github.io/portfolio/

## Run locally

```bash
npm ci
npm run dev       # http://localhost:5173/portfolio/
npm run build     # production build in dist/
npm run preview   # serve the production build
```

Every push to `main` builds and deploys through `.github/workflows/deploy.yml`.

## Dynamic feature: contact dispatch form

The `#contact` section has a working contact form. It sends a JSON `POST` to a free-tier form relay (FormSubmit.co), which emails the message to my inbox. The visitor then sees a "Message sent successfully" confirmation.

- Plain-words explainer, data-flow diagram and test checklist: [`docs/MAKE_IT_DO_SOMETHING.md`](docs/MAKE_IT_DO_SOMETHING.md)
- Optional: set `VITE_WEB3FORMS_ACCESS_KEY` at build time (for example in `.env.local`) to send through Web3Forms instead of FormSubmit.

## Mobile check

The site was tested at 320–1280 px in both themes: no sideways scroll, every tap target at least 44×44 px, 16 px form inputs, AA/AAA text contrast, and WebP images sized per screen. Before/after screenshots and the full fix log are in [`docs/OPEN_IT_ON_YOUR_PHONE.md`](docs/OPEN_IT_ON_YOUR_PHONE.md).

## Deployed file map

| File | Purpose |
| --- | --- |
| `index.html` | HTML shell, page title, favicon |
| `src/main.jsx` | React entry point |
| `src/App.jsx` | Page layout, hero section, dark/light theme state |
| `src/App.css` | Theme variables (dark default, light toggle) and all section styles |
| `src/index.css` | Tailwind import and global resets |
| `src/Scanner.jsx` | Animated WebGL background |
| `src/GooeyNav.jsx`, `src/PillNav.jsx` | Navigation effects |
| `src/LogoLoop.jsx` | Scrolling skills/logo strip |
| `src/components/Navbar.jsx` | Top bar, mobile menu, theme toggle |
| `src/components/About.jsx` | About section |
| `src/components/Projects.jsx` | Project cards |
| `src/components/Skills.jsx` | Skills section |
| `src/components/Testimonials.jsx` | Testimonials |
| `src/components/Contact.jsx` | Contact section copy; mounts the dispatch form |
| `src/components/ContactDispatchForm.tsx` | **Live contact form:** validation, honeypot spam trap, double-submit lock, HTTPS `POST` to FormSubmit.co / Web3Forms, success message |
| `src/assets/` | Original project diagrams and photos |
| `src/assets/optimized/` | WebP versions sized for display (these are what the site loads) |
| `public/` | Favicon and icons, copied as-is |
| `docs/MAKE_IT_DO_SOMETHING.md` | Explainer for the contact form (FlyRank "Make It Do Something") |
| `docs/OPEN_IT_ON_YOUR_PHONE.md` | Mobile fix log with before/after screenshots in `docs/assets/mobile-audit/` (FlyRank "Open It on Your Phone") |
| `.github/workflows/deploy.yml` | Build and deploy to GitHub Pages |
| `vite.config.js` | Vite config; `base: '/portfolio/'` for the Pages subpath |
