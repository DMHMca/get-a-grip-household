# Checks

Scripted-browser checks for Get a Grip Household, kept here so that whoever works on the app next (a person or a Claude session) can run the same ones that were run before every release. They need no build step.

## Running them

```
npm install --no-save playwright     # once
npx playwright install chromium      # once
tests/run.sh                         # everything
tests/run.sh -v                      # also print what each check saw
tests/run.sh device-kind devices-page  # just these
```

`run.sh` serves the repository at `http://localhost:8765/get-a-grip-household/` (the checks expect exactly that address), makes the sample data files in `tests/data/make.js` with dates relative to today, and runs each file in `tests/checks/`. A check **fails** if it crashes or if the `errors` line it prints at the end is not empty. Most checks also print what they saw, and those lines are the real test: each file starts with a comment saying what it should show. `worker-logic` is different: it needs no browser and asserts its own results.

## Things to know when adding or changing checks

- The first time a device opens the planning page it shows a "What is this device?" card, which pushes the page down. A check that drags things must answer it first (set `kind` in `household.local.v2`).
- A device that is a phone, or that has jobs shared out and is not in Household view, may be redirected to Getting a grip on open. Reopen the planning page with `?home=1` to stay put.
- The shared store is pretended with Playwright's `context.route` in the two-phone checks (`two-phones-link`, `payments-shared`), because the real one is reachable only from the owner's Cloudflare account.
- The Help page is checked by `help-page`; update it when screens or button names change.
- A real phone, real notifications and a real AI reading real Gmail have not been tested by these checks.
