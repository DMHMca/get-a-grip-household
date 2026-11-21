# Get a Grip Household: project brief for Claude Code

Read this first. It is the sister project of `DMHMca/get-a-grip` (the owner's personal to-do app). Keep the two separate: household work happens here; changes to Get a grip itself happen in that repository.

## The owner and how to work with him

- David McAughtry. Very little coding experience. Explain in plain English, give step-by-step instructions for anything he must do, and say exactly what he should see on screen.
- British English. Short, practical, direct prose, not bullet lists, when talking to him.
- Always give web addresses as CLICKABLE markdown links with the full address and a few words on what each opens.
- Never ask him to paste secrets into chat. Use a secure credential form or the tool's own sign-in.
- He dictates by speech-to-text, so messages can be garbled. When a request is ambiguous or he is thinking aloud, first restate in one or two sentences what you understand and wait for a yes. When it is clear, just do it. Never remove or rename something he has not clearly asked to remove.
- No red or green anywhere (colour-blind). Blue and amber are safe; the app accent is plum.
- Tell him what changed after each piece of work, and how to see it (wait for the green tick on the repository's Actions page, then reload once or twice).
- Test in a scripted browser (Playwright, Chromium is pre-installed) before pushing, and say honestly what was and was not tested.

## Who it is for

The owner's daughter Lauren and her partner Josh (names hard-coded in `NAMES`). The owner's view of the household: Lauren juggles most things; Josh is charming but often lets big jobs slide for weeks, sometimes expensively. Big jobs feel overwhelming, so the Get a grip approach (big things in small steps, fitted around small things) should help. Keep ALL wording and design neutral: the app must work whichever person is letting things slip and must never feel like a case being built against one person. Work is deliberately NOT an area (it is individual).

Demo only, with made-up data, until the owner says otherwise. The owner is not yet sure they will use it.

## Where things are

- Live: https://dmhmca.github.io/get-a-grip-household/ (GitHub Pages, branch `main`, root). The earlier copy lived at `https://dmhmca.github.io/get-a-grip/household/` in the get-a-grip repository; same origin, so `localStorage` data carries over.
- `index.html`: the whole app. `sw.js`: cache `gagh-vNN` (bump on every release; it only deletes caches starting `gagh-`, so it never touches Get a grip's caches). `manifest.webmanifest`: name "Get a Grip Household", plum icons in this folder.
- Storage: `household.doc.v2` (shared document: `tasks`, `gone`, `day`, `cats`) and `household.local.v2` (this device: `code`, `me`, `tab`, `stage`, `idx`, `area`, `part`, `walkOpen`, `welcomed`, `local`).
- Shared store: Cloudflare Worker `household-store` on the OWNER's Cloudflare account, `https://household-store.dmhmca-apps.workers.dev` (constant `SERVER`), code in `worker/worker.js`, KV namespace `household-demo` bound as `HOUSEHOLD`. `GET /h/<CODE>` returns `{v,doc}`; `PUT /h/<CODE>` with `{base,doc}` saves only if `base` equals the stored version (else 409 with the current copy). CORS allows `https://dmhmca.github.io`. The Cloudflare API token used to deploy expires 20 December 2026; to redeploy after that, ask the owner for a new token through the secure credential form (Edit Cloudflare Workers template, account resources = his account, zone = all zones, 30 days).
- Sync in the app: on open, on return, 1.2 s after a change, every 20 s; `merge` takes the later `updated` per task, honours `gone` tombstones (90 days), merges `day` and `cats` by key; `stable` compares documents to avoid needless writes.

## The app today

- Tab "1 · Brainstorm": welcome card; rounds (stepper) Warm up (six questions with number and Back buttons; Q2 reworded to avoid blame), Walk each area (opens on TILES; a tile brings in its walk: House, Garden and Paperwork go part by part, the House parts being Whole house, Kitchen, Utility room, Boot room, Larder, Living room, Bathroom, Bedrooms, Halls stairs and corridors, Loft and storage, Annex; Major bills, Money, Car, Kids, Health, Business ventures, Trips & fun go month by month through the coming year with month hints; "Add your own" area stored in `D.cats`; "← All areas", Back, Next, jump buttons; note counts on tiles), The year ahead (general month sweep; the owner may drop it), Group into big tasks (drag a note onto another to make it a step; Not now pile). Tappable examples ("starters") in every part. Two-minute timer. Notes are sticky notes on "the wall", grouped by area and tagged with the part or month. "Remove the example notes" and "Clear the whole wall".
- Tab "2 · Share out": columns Still to share out, Lauren, Josh, Both; drag or tap the round buttons; steps go with their task; balance strip with a neutral note.
- "My day": one big step plus up to three small things for the chosen person. "Sharing": start a household (code) or join with a code, or "Just try it on this device".

## Next, as the owner has described it (NOT built; confirm before building)

1. After the wall, set each task up with Get a grip's characteristics: subtasks, wait (a day, week, month, a date, or until another task is finished), big/small, time and equipment, details. Best done by storing tasks in exactly Get a grip's task shape (see the get-a-grip CLAUDE.md: `text`, `size:'big'`, `parent`, `wait`, `wf`, `wh`, `dur`, `dev`, `notes`, `done`, `updated`) so nothing needs translating.
2. Pass each person's tasks into their personal Get a grip: they enter the household code once in Get a grip, tasks arrive in a "Household" activity, ticks flow back to the shared store. That part is built in the get-a-grip repository and must follow one agreed format, written down in both CLAUDE.md files.
3. A compulsory daily household slot in Get a grip (open questions: one a day minimum, swap allowed, on top of the six small ones).
4. Parked until they have tried it: a wall display (an e-ink panel such as TRMNL preferred over a tablet), and accountability helpers (a first step for every big job, a "why it matters" line, an "I'm stuck" button, a weekly ten-minute check-in screen).
5. Idea from a podcast the owner liked (How I AI, household knowledge base): a "house file" of appliances, policies (renewal months only), tradespeople, with "how often" so recurring jobs appear by themselves.
