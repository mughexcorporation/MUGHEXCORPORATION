/*
  ============================================================
  MUGHEX CORPORATION — PORTFOLIO CONFIGURATION
  ============================================================
  This is the ONE file you edit to manage contact details,
  social links, categories and your video projects.

  HOW TO ADD A VIDEO
  1. Host your MP4 (see README.md → "Hosting your videos").
  2. Copy the DIRECT link to the .mp4 file.
  3. Paste it into the project's  video:  field below.
  4. Optional: add a thumbnail image (JPG/PNG/WebP) in  thumbnail:

  A "direct MP4 link" ends in .mp4 and plays in the browser on its
  own. Google Drive / Dropbox share pages and YouTube links are NOT
  direct MP4 links and will not play in the player.

  VIDEO SLOTS
  The site currently has ONE category, "Short-Form Podcast", with TWO
  video slots (see maxPerCategory). Extra videos beyond the limit are
  ignored (a note appears in the browser console). To add more room,
  raise maxPerCategory (up to 3 fits one row) or add categories to
  `filters` and give new projects that category name.

  Leave  video: ""  (empty) until a real file is ready. Cards with
  an empty video show a "PLACEHOLDER" badge and no play button, so
  nothing fake is ever presented as real work.
*/
window.MUGHEX_PORTFOLIO = {

  site: {
    brand: "MUGHEX Corporation",
    owner: "Abdullah Iqbal",
    location: "Lahore, Pakistan",
    email: "mughexcorporation@gmail.com",

    // WhatsApp: write the number the way you normally dial it in Pakistan.
    // The site converts it to the international form (92340...) for the chat link.
    whatsapp: "03402816840",
    countryCode: "92",
    whatsappMessage: "Hi MUGHEX, I'd like to talk about a video editing project.",

    // INQUIRY FORM -> EMAIL (free, no account): FormSubmit sends each inquiry to the email above.
    // One-time activation: after publishing, submit the form once and click the confirmation link FormSubmit emails you.
    // To use Formspree instead, paste its endpoint here, e.g. "https://formspree.io/f/xxxxxxxx". Set to "" to switch the form off.
    formEndpoint: "https://formsubmit.co/ajax/mughexcorporation@gmail.com",

    // VISITOR COUNTER (free): create a GoatCounter site, enable "Allow adding visitor counts on your website", paste its code here. "" = hidden.
    goatcounter: "mughex",

    instagram: "https://www.instagram.com/mughex.corporation/",

    // PLACEHOLDER: paste your YouTube channel URL between the quotes,
    // e.g. "https://www.youtube.com/@yourchannel". Leave "" until then.
    youtube: ""
  },

  // Shape of every video frame (card thumbnail AND player). "9 / 16" = portrait
  // (Reels/Shorts style). Use "16 / 9" if you prefer landscape frames.
  frameRatio: "9 / 16",

  // Max videos shown per category (fixed-size frames).
  maxPerCategory: 3,

  // Categories. Each project's `category` must match one of these names
  // (except "All"). With only one category, the filter buttons are hidden.
  filters: ["All", "Short-Form Podcast"],

  /*
    PROJECT FIELDS
      title        Project name shown on the card and in the player
      category     Must match a name in `filters` above
      language     Optional label on the card, e.g. "Hindi / Urdu" or "English"
      year         e.g. "2026"
      description  One or two sentences about the edit
      thumbnail    Image URL or path, e.g. "images/thumbs/podcast-01.jpg" ("" = placeholder).
                   Best size: 1080x1920 (9:16) JPG/WebP so it fills the portrait frame
      video        DIRECT .mp4 URL, e.g. "https://example.com/my-edit.mp4"
                   or a repo path like "videos/my-edit.mp4"  ("" = not added yet)
      format       Optional label only; the frame shape is set by frameRatio above
      thumbnail    Best size: 1080x1920 (9:16) JPG/WebP so it fills the portrait frame
      tag          Optional small badge on the card, e.g. "Hindi / Urdu" or "English"
  */
  projects: [
    {
      title: "Founder of OYO podcast edit Short-Form Podcast: Hindi / Urdu",
      category: "Short-Form Podcast",
      year: "2026",
      description: "MAKE THIS EDIT WITH FOCUSING ON HOOK ,PACING, COOL CAPTIONS, SFX AND OVERALL FLOW WITH COLOR GRADING.",
      thumbnail: "images/thumbs/podcast-hindi-urdu.jpg",
      video: "videos/samplerrr1.mp4",
      format: "vertical",
      language: "Hindi / Urdu"
    },
    {
      title: "Founder of FAM industry edit Short-Form Podcast: English",
      category: "Short-Form Podcast",
      year: "2026",
      description: "MAKE THIS EDIT WITH SIMPLE, MINIMAL AND ATTRACTIVE LOOKS WHICH INCLUDE HIGHLIGHTED CAPTIONS MINIMAL MOTION GRAPHICS AND SIMPLE SFX ALONG WITH ENGAGING HOOKS IN MIDDLE AND START.",
      thumbnail: "images/thumbs/podcast-english.jpg",
      video: "videos/samplerrr2.mp4",
      format: "vertical",
      language: "English"
    }
  ]
};
