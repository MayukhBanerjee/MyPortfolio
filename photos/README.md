# Original photos

Put full-resolution originals here, then run:

```bash
npm run photos
```

That writes optimized versions to `public/images/`. Originals are gitignored; only the optimized files get committed.

| File | Used for | Output |
|---|---|---|
| `hero.jpg` | The portrait inside the name | `hero-mask.jpg` (shadows lifted), `hero-full.jpg` (full frame) |
| `football.jpg` | Off the pitch section | `football.jpg` (black and white) |
| `diary.jpg` | The diary | `diary.jpg` |

If a new hero photo has the face somewhere else, update `images.heroFocus` (0–1 position of the face) and `images.heroAspect` (height / width of the output) in `data/portfolio.ts`.
