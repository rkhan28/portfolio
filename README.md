# rkhan.ca

My portfolio, built from **rk. bricks**, a toy-brick design system. The hero is a green baseplate covered in loose bricks you can drag (they snap to the studs) or click to open. Below it, the site reads like an instruction booklet: each project is a numbered build with its parts list.

## Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. `npm run build` writes a static site to `dist/`.

## Deploy

The live site is [rkhan.ca](https://rkhan.ca), served by Cloudflare Pages. Build command `npm run build`, output directory `dist`, Node 22.

## Where things live

```
src/
├── data/content.js      # every word and link on the site
├── world/               # the hero's brick physics: BrickWorld (drop, stack, knock down, rebuild)
│   └── letters.js       # the "rk." sculpture, drawn on a stud grid
├── motion/              # SmoothScroll (Lenis) and its scrollTo helper
├── bricks/              # the design system's components: Brick, BrickButton, BrickToggle,
│                        # PartsList, BuildCard, Baseplate, BrickStack, FlipTile
├── components/          # page sections: Nav, Scene (hero), Streetcar, Marquee, Builds,
│                        # HowIBuild (scroll-built robot), Experiments, About, Contact, Footer
│   ├── Art.jsx          # the little brick builds used as illustrations
│   ├── Letters.jsx      # big type whose letters drop in and wobble
│   └── RevealWords.jsx  # headings that rise out of a mask
├── hooks/usePrefs.jsx   # Night build (with the circular theme reveal), click sounds, brick tally
└── styles/
    ├── tokens.css       # generated from the design system's tokens.json: don't edit by hand
    ├── bricks.css       # component styles from the design system
    └── site.css         # page layout and every animation
```

- **Change copy or links:** edit `src/data/content.js`. The hero's jokes live in `HINTS` in `Scene.jsx`, the build steps in `STEPS` in `HowIBuild.jsx`.
- **Change the sculpture:** redraw the `RK` grid in `src/world/letters.js` (X = a stud of brick).
- **Add a project:** add an entry to `builds`, then give it an illustration in `Art.jsx` and map it in `Builds.jsx`.
- **Résumé:** every Résumé button links to `public/assets/Rahmat-Khan-Resume.pdf`. Replace that file to update them all.

## Design rules (from rk. bricks)

- One stud is 20px. Bricks are studs × 20 wide and 24px tall.
- Red is the one primary action per view, blue is for outbound links, and yellow is for what's new.
- Interactions snap: lift on hover, seat on press, spring back with a small overshoot. Ambient loops (sunlight, the 510, the marquee, falling bricks) never stop, but stay slow.
- `prefers-reduced-motion` turns off Lenis, the intro rain, weather and loops, and shows every scroll-built scene finished.
- Text is DM Sans, headings are Bricolage Grotesque and labels are DM Mono, all from Google Fonts.
