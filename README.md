# Get a Grip Household

> **Being rebuilt (November 2026).** The app at the live address is now a copy (fork) of [Get a grip](https://github.com/DMHMca/get-a-grip), the personal to-do app, with its own separate storage. The household features described below (brainstorm wall, Share out, shared store) are being brought back into it step by step. See `CLAUDE.md` for the plan.

A planning tool for two people who share a household. Instead of a planning session that produces an overwhelming list of fifty jobs, it helps you:

1. **Brainstorm** together on a laptop: a warm-up, then a walk through each area of life (the house room by room, the garden, paperwork; bills, money, the car, the kids, health, business ventures and trips month by month through the coming year), then group the notes into big tasks with small steps.
2. **Share out** the tasks: each one goes to one person, who owns it from start to finish.
3. **Do a little each day**: one big step and a few small things, never the whole mountain.

It is a sister project of [Get a grip](https://github.com/DMHMca/get-a-grip), the personal to-do app built around the same idea. Live copy: https://dmhmca.github.io/get-a-grip-household/

## How it is built

- `index.html`: the whole app (HTML, CSS and vanilla JavaScript, no libraries, no build step). `sw.js` and `manifest.webmanifest` make it installable.
- `worker/worker.js`: a tiny Cloudflare Worker that stores one JSON document per household code in Cloudflare KV, with a version check so two devices cannot overwrite each other. The app merges changes item by item.
- Data on each device is kept in the browser (`localStorage`). The shared copy lives only in the Worker's store, keyed by a random 12-character household code.

## Privacy

Write down where things are, never account numbers, policy numbers, health details or passwords. The household code is the only key to the shared list, so keep it within the household.

## Licence

MIT. See [LICENSE](LICENSE).
