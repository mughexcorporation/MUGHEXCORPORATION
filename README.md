# MUGHEX Corporation — Video Editor Portfolio

A responsive, cinematic static website (HTML + CSS + vanilla JavaScript) that works on GitHub Pages. No build step, no dependencies.

## What's in the project

| File | Purpose |
|---|---|
| `index.html` | Page structure and text (hero, services, about, contact) |
| `css/style.css` | All styling and animations |
| `js/portfolio.js` | **The file you edit most**: email, social links, filters, project list |
| `js/main.js` | Gallery, filters, video player, navigation, animations (normally no edits needed) |
| `images/mughex-logo.png` | Your logo (also used as the favicon) |
| `videos/` | Optional: MP4s if you host them in the repository |

## 1. Customize your content

Everything below is in `js/portfolio.js` (`site` block):

| Setting | Current value |
|---|---|
| `email` | mughexcorporation@gmail.com |
| `whatsapp` | 03402816840 (written the Pakistani way; the site converts it to `923402816840` for the chat link) |
| `countryCode` | `"92"` (Pakistan). Change it only if your number is from another country |
| `whatsappMessage` | The pre-filled message visitors see when the chat opens |
| `instagram` | https://www.instagram.com/mughex.corporation/ |
| `youtube` | **Placeholder.** Empty `""` until you add your channel URL, e.g. `"https://www.youtube.com/@yourchannel"`. The YouTube card then becomes a working link automatically |

**Contact options (all wired up):** WhatsApp direct chat (`wa.me` link, also a floating button), Email (open mail app, open Gmail in the browser, or copy the address — a plain `mailto:` link does nothing on devices without a mail app, so the extra options always work), Instagram, and YouTube (placeholder until set).

**Light / Dark mode:** the sun/moon button in the header switches themes. The choice is remembered in the visitor's browser. Dark is the default. Theme colors live at the top of `css/style.css` (`:root` for dark, `:root[data-theme="light"]` for light).

**About text, hero text, services:** edit `index.html`. **Accent color:** `--accent` in `css/style.css`.

## 2. Add your video projects

Each project is one block in `js/portfolio.js`:

```js
{
  title: "Founder Podcast Highlights",
  category: "Podcast Editing",      // must match a name in `filters`
  year: "2026",
  description: "Cleaned audio, tightened pacing, and added dynamic captions.",
  thumbnail: "images/thumbs/podcast-01.jpg",   // optional, "" = placeholder
  video: "https://YOUR-HOST/podcast-01.mp4",   // DIRECT .mp4 link
  format: "vertical"                           // optional: adds a 9:16 tag on the card
}
```

- **Two video slots for now.** The site has one category, "Short-Form Podcast", with two slots (`maxPerCategory: 2`). Fill in the two project blocks with your video links. Anything beyond the limit is ignored (a note appears in the browser console). To add more later, raise `maxPerCategory` (3 fits one row), or add a new category name to `filters` and give new projects that category.
- Every video card uses the same fixed-size frame (16:10 thumbnail, 16:9 player), so vertical Reels/Shorts and landscape videos line up neatly. Vertical videos are centered inside the player frame.
- The site currently has **two** video slots, both in the `Short-Form Podcast` category: a Hindi/Urdu clip and an English clip. The optional `language` field shows a label on each card.
- Delete a block to remove a project.
- While `video` is `""`, the card shows a **PLACEHOLDER** badge and no play button. Nothing fake is presented as real work. Once you fill in `video`, the card becomes playable in the in-page player.
- The six starter cards are placeholders only. There are no sample videos and no invented URLs.
- Thumbnails: 1280×800 JPG/WebP, under ~300 KB. Without one, a placeholder tile is shown. A frame exported from Premiere works well.

### What is a "direct MP4 link"?

A URL that ends in `.mp4` and plays by itself when opened in a new browser tab. These do **not** work: YouTube links, Google Drive or Dropbox "share" pages, and Vimeo page links. If you paste one, the player shows an explanatory message instead of failing silently.

### The "Make yours" call-to-action
Right under the videos there is a large, colorful **"Want a video like this? Make yours."** banner with a WhatsApp button (opens a chat with a pre-filled message) and an "Email & other options" button that scrolls to the contact section. Each video card also has a small "Make yours →" link to it. To change the wording, edit the `make-yours` block in `index.html`; to change the WhatsApp message, edit its `data-wa-message` attribute.

### Portrait (9:16) frames
All video cards and the player use a portrait 9:16 frame, which suits Reels, Shorts and short-form podcast clips. Your Hindi/Urdu thumbnail is already set (`images/thumbs/podcast-hindi-urdu.jpg`). For new thumbnails, export 1080×1920 JPG or WebP images. To switch back to landscape frames, set `frameRatio: "16 / 9"` in `js/portfolio.js`.

## 3. Hosting your videos (10–100 MB each)

### Prepare the files first
Export H.264 video + AAC audio MP4s. Smaller files start faster. With ffmpeg:

```
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart output.mp4
```

`-movflags +faststart` lets playback begin before the whole file downloads. 1080p (or 1080×1920 for vertical) is plenty. Premiere's "H.264, Match Source – High bitrate" preset works too.

### Option A — Same GitHub repository (simplest, free)
1. Put MP4s in the `videos/` folder, with no spaces in filenames (`podcast-01.mp4`).
2. Set `video: "videos/podcast-01.mp4"`.
3. Limits to know: GitHub **rejects any single file over 100 MiB**. The website upload page only accepts files up to **25 MiB**, so for larger files use [GitHub Desktop](https://desktop.github.com/) or git on the command line. GitHub recommends keeping a repository under about 1 GB, and Pages has bandwidth limits, so this suits a small portfolio (roughly 5–10 videos compressed to 15–50 MB each). If traffic grows, move to Option B or C.

### Option B — GitHub Releases (keeps videos out of the repo)
1. In your repo, open **Releases → Draft a new release**, create a tag (e.g. `videos`), and drag your MP4s into the assets area. Release assets can be much larger than regular repo files.
2. Publish, then right-click an asset → **Copy link address**. It looks like `https://github.com/USER/REPO/releases/download/videos/podcast-01.mp4`.
3. Paste it into `video:`. Test it on your live site; it should play, but if your browser refuses to stream it, use Option C.

### Option C — Free object storage / video CDN
Services such as Cloudflare R2, Cloudinary, Bunny, or Backblaze B2 give you a public URL for each file. Free tiers and file-size limits change, so **check the provider's current limits and terms** before relying on them. In general: create a bucket or media library, make files public, upload the MP4, copy the public file URL, and paste it into `video:`. Remember that development URLs such as `r2.dev` are rate-limited, so use a custom domain for real traffic.

### Test every link
Open the URL in a new browser tab. If it plays there, it will play on your site. Then click the card on your site and confirm the player starts.

## 4. Preview locally
Open `index.html` in a browser. For the most accurate test, run a local server in the folder: `python3 -m http.server 8000` and visit http://localhost:8000.

## 5. Deploy to GitHub Pages
1. Create a repository on GitHub (e.g. `mughex-portfolio`).
2. Upload the **contents** of this folder so `index.html` sits at the repository root (not inside a sub-folder).
3. Go to **Settings → Pages**. Under *Build and deployment*, select **Deploy from a branch**, choose `main` and `/ (root)`, then **Save**.
4. After a minute or two your site appears at `https://YOUR-USERNAME.github.io/mughex-portfolio/`.
5. To update: edit `js/portfolio.js`, commit, and wait for Pages to redeploy. If you don't see changes, hard-refresh (Ctrl/Cmd+Shift+R).

All paths in the project are relative, so it works both at a project URL (`/repo-name/`) and a custom domain.

## Notes
- **Mobile friendly:** the layout adapts from 320 px phones to desktop, including landscape phones. Tap targets are at least 44 px, the menu closes when you tap outside it, the video player opens as a bottom sheet on phones, the floating WhatsApp button shrinks to an icon, notch/safe-area spacing is handled, and heavy visual effects are lightened on small screens.
- Animations (cinematic light beams, film grain, floating dust, scroll reveals, running timecode) are pure CSS/JS and are switched off automatically for visitors who enable "reduce motion" in their OS.
- Fonts (Inter, Fraunces) load from Google Fonts; the site falls back to system fonts if they are unavailable.
- Keyboard: **Esc** closes the video player; focus returns to the card you opened.

## Inquiry form (sends to your email) and certificate
**How it works:** the form in the Contact section posts to the free **FormSubmit** service (`site.formEndpoint` in `js/portfolio.js`), which emails each inquiry (name, email, service, project description, date/time) to `mughexcorporation@gmail.com`. No signup is needed, but you must activate it **once**:
1. Publish the site (the form does not work when `index.html` is opened as a local file).
2. Open the live site and send one test inquiry.
3. Check Gmail (also Spam/Promotions) for a FormSubmit email and click **Activate**. Until you do, inquiries are not delivered.
4. Send a second test inquiry and confirm it arrives. The form only says "sent" when the service confirms success.

**Free alternative:** create a free **Formspree** form with your email and paste its URL (`https://formspree.io/f/xxxxxxxx`) into `formEndpoint`. Both have free-plan limits, so check their current terms.
**Spam protection:** hidden honeypot field, input validation, a 30-second cooldown, and the service's own filtering.

**Certificate:** the "Always learning" section is plain HTML in `index.html` (image in `images/`). Visitors can open it full size in a viewer, and there is no download option. To add another, copy the `cert-stage` block.

## Scroll experience (inspired by studio-style sites)
- **Entry screen:** a film-leader gate ("Enter with sound" / "Enter silent") followed by a 3-2-1 countdown. It shows once per browser session.
- **Sound:** all sounds are generated in the browser (no audio files): a soft ambient drone, a quiet wind that follows your scroll speed, light ticks on hover, a chime when you reach a new section. Overall volume is low, and the SOUND button (bottom-left) turns it off. Sound only starts after a visitor chooses it.
- **Scroll story:** a pinned manifesto (CUT / PACE / CAPTION / SOUND / STORY) with an editing-timecode scrubber, cinema bars, a scroll-percentage readout, section dots, a depth effect on project cards, words that light up as you scroll the About text, and a scroll-driven marquee.
- **Quick menu:** press Ctrl/Cmd + K to jump to any section, open WhatsApp, or toggle theme and sound.
- **Visitor counter:** set `goatcounter` in `js/portfolio.js` after creating a free GoatCounter site (enable "Allow adding visitor counts on your website"). Until then nothing is shown.
- Files: `js/experience.js`, `css/experience.css`. Everything respects "reduce motion" (the manifesto becomes a simple list and the countdown is skipped). To remove the whole layer, delete the `experience.css` and `experience.js` lines in `index.html`.

## Design rules (kept strict)
One palette only: deep navy + white/slate neutrals + a single sky-blue accent (`--accent`, `--accent-2` at the top of `css/style.css`). Even the WhatsApp buttons use the accent. Effects are limited to: the entry gate and countdown, the pinned manifesto, section dots, scroll progress, soft hover lifts, and glass surfaces.

## Interactive editor (hero)
The timeline at the bottom of the intro is a small working editor: click a clip to cut it, drag clips to rearrange, drag the playhead to scrub (it also scrubs the hero footage), double-click to reset. Keyboard: Tab to focus it, Space play/pause, arrows scrub, C cut at the playhead, R reset. Headings have hoverable letters and a soft spotlight follows the cursor. The entry screen has no countdown any more: choose "Enter with sound" or "Enter silent". Code: `js/edit-bg.js`; to remove it, delete that script line in `index.html`.

## Liquid glass UI
`css/glass.css` turns panels, cards, the header, the form and the editor into frosted-glass surfaces (blur, soft highlights, thin light borders) over soft blue light. Every button is glass and fills with the accent color from left to right on hover; primary buttons fill with a lighter blue. Light and dark themes both have glass styles. Colors come from `--accent` and `--accent-2`. To go back to the flat look, delete the `glass.css` link in `index.html`. The hero has no background footage or photo any more, and the certificate appears once, in its own section.
