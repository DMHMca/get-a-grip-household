// Makes the sample files the checks bring in. Dates are relative to today, so they never go stale.
// Usage: node make.js <output folder>
const fs = require('fs'), path = require('path');
const out = process.argv[2] || __dirname;
fs.mkdirSync(out, { recursive: true });
const day = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const H8 = '| What | Action | How often | Next due | Last amount | From | Area | Notes |\n|---|---|---|---|---|---|---|---|\n';
const HR = '| What | Action | How often | Next due | Last amount | From | How to renew | Reference | Area | Notes |\n|---|---|---|---|---|---|---|---|---|---|\n';
fs.writeFileSync(path.join(out, 'agreed.md'),
  "Here's the agreed list.\n\n# Get a Grip recurring items\n\n" + H8 +
  `| TV licence | pay | yearly | ${day(20)} | £174.50 | TV Licensing | bills | |\n` +
  `| Car insurance | renew | yearly | ${day(60)} | £412.60 | Admiral | car | Shop around |\n` +
  `| Car tax | pay | yearly | ${day(10)} | £190 | DVLA | car | |\n` +
  `| Travel insurance | review | yearly | ${day(200)} | £89 | Staysure | trips | |\n`);
fs.writeFileSync(path.join(out, 'recurring.md'),
  'Here is your file:\n\n```markdown\n# Get a Grip recurring items\n\n' + H8 +
  `| Netflix | automatic | monthly | ${day(9)} | £10.99 | Netflix | bills | |\n` +
  `| Car insurance | review | yearly | ${day(110)} | £412.60 | Admiral | car | Renewal notice ~3 weeks before |\n` +
  `| TV licence | pay | yearly | ${day(26)} | £174.50 | TV Licensing | bills | estimated |\n` +
  `| Boiler service | task | yearly | ${day(-50)} | | British Gas | house | Last done last autumn |\n` +
  `| Window cleaner | pay | monthly | ${day(7)} | £18 | Local | cleaning | |\n` +
  `| Domain name | review | every 2 years | ${day(190)} | £24 | Namecheap | business | |\n` + '```\n');
fs.writeFileSync(path.join(out, 'renew.md'),
  '# Get a Grip recurring items\n\n' + HR +
  `| Car insurance | renew | yearly | ${day(110)} | £412.60 | Admiral | https://www.admiral.com/account; 0333 220 2000; paid online by card | Policy P1234567 | car | Shop around |\n` +
  `| TV licence | pay | yearly | ${day(57)} | £174.50 | TV Licensing | https://www.tvlicensing.co.uk/pay; 0300 790 6165 | Licence 1234 5678 9 | bills | |\n`);
