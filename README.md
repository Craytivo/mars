# Mars Countdown

A cinematic, full-screen countdown to December 3, 2026, built with Next.js, React Three Fiber, and Three.js.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm run start
```

## Countdown target

The countdown targets midnight at the start of December 3, 2026, using the visitor's local timezone. Update the target date in `app/page.tsx` inside `useCountdown()` if the date changes.

## Deploy

Import `Craytivo/mars` into Vercel and use the default Next.js build settings.
