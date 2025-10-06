/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

fetch(
  'https://script.google.com/macros/s/AKfycbxgeWR1Qa3bhcfW_P_0pDAQWGUu4S-gehbxn7B6XVcfFJvINNQCVQwwzOaSHyP9Q0m0_A/exec',
  { method: 'POST' }
)
  .then((response) => response.json())
  .then((json) => {
    const locales = Object.keys(json);
    locales.forEach((locale) => {
      fs.writeFileSync(
        `constants/locales/${locale}.json`,
        JSON.stringify(json[locale], null, 2)
      );
    });
  });
