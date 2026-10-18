/**
 * scripts/submit_indexnow.mjs
 * Submit updated URLs to Bing / IndexNow search engines.
 * Run after live deployment:
 *   node scripts/submit_indexnow.mjs
 */

const KEY = '4a9b7365c1024d27bf9e7826a7985331';
const HOST = 'www.seniorsaudit.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URL_LIST = [
  'https://www.seniorsaudit.com/',
  'https://www.seniorsaudit.com/social-security/',
  'https://www.seniorsaudit.com/tools/social-security-cola-calculator/',
  'https://www.seniorsaudit.com/social-security/social-security-cola-2027/',
  'https://www.seniorsaudit.com/social-security/social-security-cola-2026/',
];

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: URL_LIST,
};

async function submit() {
  console.log('Submitting URLs to IndexNow (Bing / Yandex / Seznam)...');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response Status: ${res.status} ${res.statusText}`);
    if (res.status === 200 || res.status === 202) {
      console.log('Successfully submitted to IndexNow!');
    } else {
      const text = await res.text();
      console.log(`Server response: ${text}`);
    }
  } catch (err) {
    console.error('Failed to submit to IndexNow:', err);
  }
}

submit();
