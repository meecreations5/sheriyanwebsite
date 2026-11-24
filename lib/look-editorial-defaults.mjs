// Keep only legacy, uncustomised copy in sync with updated SHANERYN editorial defaults.
// User-edited CMS copy remains untouched.
const EDITORIAL_COPY_UPDATES = Object.freeze({
  f00217: ['MADE TO MEASURE', 'MEASUREMENTS REQUIRED'],
  f00222: ['Optional measurements for a personalised discussion. Nothing is submitted or stored on this prototype.', 'Enter measurements in inches, then add your contact details to send them to the SHANERYN studio.'],
  f00227: ['ENQUIRE WITH MEASUREMENTS ', 'SUBMIT YOUR MEASUREMENTS '],
  f00235: ['MADE FOR THE MOMENT', 'clothes to empower'],
  f00236: ['Clothing that lives ', 'effortless moments'],
  f00238: ['Considered silhouettes. Personal expression. Your own way of being.', 'for fun celebrations'],
});
export function upgradeLookEditorialPatches(slug, patches) {
  if (slug !== 'look' || !patches || typeof patches !== 'object') return patches || {};
  const next = {...patches};
  for (const [id, [before, after]] of Object.entries(EDITORIAL_COPY_UPDATES)) {
    const patch = next[id];
    if (patch && typeof patch === 'object' && patch.value === before) next[id] = {...patch, value:after};
  }
  return next;
}
