/* SHANERYN front-end content controls. These settings can move to the CMS later.
 * hero.mode = 'single' or 'carousel'; desktop and mobile are independent image assets.
 * Set fashionFilm.youtubeId to the 11-character ID of the APPROVED SHANERYN film.
 */
window.SHANERYN_SITE_CONFIG = {
  hero: {
    // Final client-approved single photograph. Hero carousel is disabled.
    mode: 'single',
    slides: [
      {desktop:'hero-client-shaneryn7231.jpg',mobile:'hero-client-shaneryn7231.jpg',alt:'SHANERYN fashion portrait featuring a chocolate ruffled outfit and sunglasses'}
    ]
  },
  fashionFilm: {
    youtubeId: '', // Replace with the approved video ID. An unrelated brand film will not be shown as SHANERYN.
    autoplayOnView: true,
    muted: true
  },
  founder: {linkedin: ''}, // Real profile URL pending.
  social: {instagram:'', facebook:'', pinterest:'', youtube:'', linkedin:''}, // Add official SHANERYN URLs to activate footer icons.
  studioAddress: '', // Needed to enable an accurate Google Maps embed.
};
