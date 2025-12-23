# English → Irish Lookup

Small project that opens a focloir.ie dictionary entry and a Pixabay image search from a local HTML page, and adds a Tampermonkey userscript to replace Connacht pronunciation audio spans on focloir.ie with a working "Copy link" button.

## Files
- `index.html` — local search UI. Type an English word and press Enter to open:
  - Pixabay images search for the word
  - focloir.ie dictionary entry for the word
- `Irish-Tampermonkey.js` — Tampermonkey/Violentmonkey userscript that:
  - targets only spans with `title="Click to hear the Connacht pronunciation"`
  - replaces each matching `<span class="dialect audio_play_button"...>` with a "Copy link" button that copies the `data-src-mp3` URL
  - watches for dynamically added content

## Prerequisites
- Opera (or any Chromium-based browser)
- Tampermonkey or Violentmonkey extension installed in Opera
- A local HTTP server or VS Code Live Server (recommended) to serve `index.html`

## Quick start

1. Serve the project folder
   - Recommended: open the folder in VS Code and use the Live Server extension (`Go Live`) to serve `index.html`.
   - Alternative (PowerShell): run a small server script (or use Python/Node if available).

2. Open `index.html` in Opera
   - From PowerShell (if using localhost:8000):
     Start-Process "C:\Program Files\Opera\launcher.exe" "http://localhost:8000/index.html"
   - Or copy the Live Server URL (e.g. `http://127.0.0.1:5500/index.html`) into Opera.

3. Install the userscript
   - Install Tampermonkey or Violentmonkey for Opera (Opera Add‑ons store or via "Install Chrome Extensions" + Chrome Web Store).
   - Open the extension, create a new script, and paste the contents of `Irish-Tampermonkey.js`.
   - Save and enable the script. It includes `@match https://www.focloir.ie/*` and runs at `document-idle`.

4. Use the tool
   - In `index.html`, type an English word and press Enter.
   - Two tabs should open: Pixabay and the focloir.ie entry.
   - On focloir.ie the userscript will replace Connacht pronunciation audio spans with a "Copy link" button. Click the button to copy the MP3 URL to the clipboard.

## Notes & Troubleshooting
- The userscript only targets spans with the exact title: `Click to hear the Connacht pronunciation`. If focloir changes their markup or title text the script will not match — update `Irish-Tampermonkey.js` accordingly.
- If "Copy link" does not copy:
  - Check the userscript is enabled and matches `https://www.focloir.ie/*`.
  - Some sites may block clipboard in certain contexts; the script falls back to showing a prompt with the URL.
  - Open DevTools Console on the focloir page to see log messages from the script.
- The local page cannot modify another site's DOM — that is why a userscript running on focloir is required.
- The script replaces every matching Connacht audio span and observes for content added later.

## Customization
- To change the matching condition (e.g. different dialect), edit the `TARGET_TITLE` constant at the top of `Irish-Tampermonkey.js`.
- To change the button label or styling, edit the button creation block in `Irish-Tampermonkey.js`.

## License
Use as you like. No warranty.

