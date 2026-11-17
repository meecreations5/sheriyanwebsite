/* SHANERYN front-end content controls. These settings can move to the CMS later.
 * hero.mode = 'single' or 'carousel'; desktop and mobile are independent image assets.
 * Set fashionFilm.youtubeId to the 11-character ID of the APPROVED SHANERYN film.
 */
window.SHANERYN_SITE_CONFIG = {
  hero: {
    mode: 'carousel', // Choose 'single' or 'carousel'; carousel autoplays automatically.
    intervalMs: 6500, // Milliseconds between autoplay transitions.
    slides: [
      {desktop:'hero-desktop-01.jpg',mobile:'hero-mobile-01.jpg',alt:'SHANERYN editorial hero photograph one'},
      {desktop:'hero-desktop-02.jpg',mobile:'hero-mobile-02.jpg',alt:'SHANERYN editorial hero photograph two'},
      {desktop:'hero-desktop-03.jpg',mobile:'hero-mobile-03.jpg',alt:'SHANERYN editorial hero photograph three'}
    ]
  },
  fashionFilm: {
    youtubeId: '', // Replace with the approved video ID. An unrelated brand film will not be shown as SHANERYN.
    autoplayOnView: true,
    muted: true
  },
  founder: {linkedin: ''}, // Real profile URL pending.
  social: {instagram:'', facebook:'', pinterest:'', youtube:''},
  studioAddress: '', // Needed to enable an accurate Google Maps embed.
};
