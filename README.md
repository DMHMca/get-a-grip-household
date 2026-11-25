# Get a Grip Household

A shared to-do app for two people who run a household together. Instead of one planning session that produces an overwhelming list of fifty jobs, it helps you plan everything together, split it fairly, and then do a little each day.

It began as a sister project of [Get a grip](https://github.com/DMHMca/get-a-grip), the owner's personal to-do app, and is now a **fork** of it that goes its own way. Live copy: https://dmhmca.github.io/get-a-grip-household/ (a demonstration, with made-up data, until the owner says otherwise).

## How it is used

**Planning (on a computer).**

1. **Brainstorm**, in seven short rounds: a warm-up; a walk through each area of life (the house, cleaning, garden, car and paperwork part by part; bills, money, the kids, health and trips month by month); **Business ventures** (Well Spent, Bot League, StoryBella and any you add, each walked part by part); the year ahead; **Regular payments**; and finally **Group, sort and add details**, where notes become jobs, big tasks get steps, and each of the two lists (Big and Small) is put in priority order by dragging.
2. **Regular payments** (round 5) gives you a prompt to paste into an AI that can read your Gmail. It finds everything that comes round again (car tax, insurance, the TV licence and so on), goes through the list with you, and returns a small Markdown file. You bring the file in, say whose job each item is and when it should come into the list, and each one carries how to renew it and who with.
3. **Share out**: every job goes to one person, never both, who owns it from start to finish.

**Getting a grip (on a phone).** Each person's phone opens on **Getting a grip**, which is [Get a grip](https://github.com/DMHMca/get-a-grip)'s Today screen: one big step and a few small things, never the whole mountain. The household jobs shared out to that person sit alongside their own personal tasks, with a Household / Personal / Everything switch. The planning pages are tucked behind "Planning" in the ⋮ menu. A dated job can stay out of sight until a chosen time before it is due (four weeks is the default for regular payments), then it arrives at the top of the list, and a phone reminder comes a week and a day before.

Each device says once whether it is a **phone** (opens on Getting a grip) or a **computer** (opens on Brainstorm), and whose it is (Lauren or Josh); both can be changed in Settings. The **Planning ⇄ Getting a grip** button switches sides. There is no PIN: each device belongs to one person, and personal tasks never leave that person's own devices (apart from personal sync between them).

## Privacy by design

- **Personal tasks are never part of the household list.** They stay on the device they were typed on, unless that person turns on personal sync: then they are scrambled (encrypted) on the device and kept in step between their own devices under a personal code, and the store only holds unreadable data.
- **The household list is shared** through a small store, keyed by a random 12-character household code. Anyone with the code can read and change the list, so keep it between the two of you.
- Write down where things are and supplier references needed to renew, never passwords, card numbers or bank details.
- See [privacy.html](privacy.html) for the plain-English version.

## How it is built

No libraries and no build step: static files on GitHub Pages (branch `main`, root), plus one small Cloudflare Worker.

| File | What it is |
|---|---|
| `index.html` | The planning side: Brainstorm, Share out, and the Settings page (tabs: General, Link, This device, Reminders). |
| `tasks.html` | The Getting a grip side: Get a grip's code (Today, Big, Small, Master, Activities, every edit screen) plus the household link that brings a person's household jobs in and sends changes back. |
| `sw.js` | Service worker: keeps the app installable and always fetches the newest page, and shows reminder notifications. |
| `worker/worker.js` | The Cloudflare Worker: one JSON document per household code in KV (with a version check so two devices cannot overwrite each other), the reminder sign-ups, and a daily check that sends the reminders. |
| `privacy.html`, `help.html` | The privacy page, and the Help page: the idea in three paragraphs, how-tos for the less obvious parts, and a technical section for a developer (how it is built, how to fork it, how personal tasks could be scrambled). Reachable from the ⋮ menus. |
| `tests/` | Scripted-browser checks (see `tests/README.md`). |
| `CLAUDE.md` | The full project brief, with the current state first and every decision recorded. Read this before changing anything. |

Data on a device lives in `localStorage`: `household.doc.v2` (the shared list), `household.local.v2` (this device's settings) and `gagh.*` (My day's personal tasks and settings). The two sides of the app share one origin with the owner's personal Get a grip, so every key here is prefixed so that the two can never touch each other's data.

## Releasing

Bump `APP_VERSION` in **both** `index.html` and `tasks.html` (point releases: H1.8, H1.9, H1.10 …) and the cache name in `sw.js`, run the checks in `tests/`, and push to `main`. Pages publishes in about a minute. Deploying the Worker needs the owner's Cloudflare account (see `CLAUDE.md`).

## Handing it over

The repository sits on the owner's GitHub account (add a collaborator, or transfer it), and the shared store runs on the owner's Cloudflare account (a new owner would create their own Worker and KV namespace, and generate their own reminder key pair; the steps are in `CLAUDE.md`).

## Licence

MIT. See [LICENSE](LICENSE).
