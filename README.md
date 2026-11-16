# Wubbzy Heardle

A static, GitHub Pages-ready music guessing game for *Wow! Wow! Wubbzy!* Open `index.html` to play locally, or host the folder with GitHub Pages. No build step or server is required. The dark layout and six-row game flow were modelled on [TMBG Heardle](https://github.com/jjbott/tmbg-heardle); this project uses its own HTML, CSS, JavaScript, and local audio clips.

## Play

Guess the song from a randomly chosen part of its audio. Each track has three different 20-second excerpts; one is selected for a puzzle and stays the same through all six clues. The clue lengths are 1, 2, 4, 7, 11, and 16 seconds. A wrong guess or skip unlocks the next clue. Everyone gets the same daily song and segment, changing at 00:00 UTC; practice puzzles are unlimited and independent. Daily progress is saved in that browser's local storage. Matching album artwork appears with the answer after the puzzle ends. When a matching upload is available, the result also shows an embedded YouTube video and a direct link.

## Track selection

The main soundtrack uses *Wubbzysongs Complete!*. Answers use **Artist - Track** labels. The final Beyoncé, Tara Strong & Grey DeLisle recording is simply "Sing a Song"; Brad Mossman's distinct recording is "Sing a Song (Early Version)"; the Maurice Joshua remix keeps its remix tag. The opening and closing themes retain the `(From "Wow! Wow! Wubbzy!")` suffix. One version each of Daizy's, Widget's, and Madame Zabinga's themes is included. "Ziggity Zig-Zag" is included from the Beauty Salon source.

The *Sing-A-Song* album contributes 27 tracks, all tagged `(Album Version)`; its "Sing a Song" file is excluded as a duplicate. The selected Wubb Idol, early "Come Play with Me," alternate "Dance Dance Party," promotional and pilot openings, two alternate "Wubbzy Wiggle" versions, and "Time for Fun (Demo / Single Version)" are also included.

Excluded: the season 2 opening theme, the instrumental pilot opening, other unselected alternate takes, duplicate album copies, and instrumental/jingle loops of songs that have vocal versions. The site includes 20-second MP3 excerpts, not the original full-length files.

Verified YouTube links are included for 90 of the 97 recordings. All 27 *Sing-A-Song* album versions point to the [topic playlist](https://www.youtube.com/playlist?list=PLST0Gpiu83aWOgARLL4tHc78v0QCwcru3). Most other links come from the [main archive playlist](https://www.youtube.com/playlist?list=PLemRbSHAurvnXdo4gQWdcZR-J4mIwFnTi) and [additional archive playlist](https://www.youtube.com/playlist?list=PLemRbSHAurvnUJbsU2iTiAbkL44k3vF1l). The Wubb Idol recording links to BolderMedia's matching upload. No verified match was found for Jukebox Robot, the three character themes, Ziggity Zig-Zag, Dance Dance Party (Alternate Take), or Time for Fun (Demo / Single Version).

## Publish on GitHub Pages

1. Create a repository and upload the contents of this folder to its root.
2. In repository **Settings → Pages**, choose **Deploy from a branch**, then select the main branch and root (`/`).
3. Wait for GitHub to show the Pages URL.

The social preview uses the first GIF frame in `assets/favicon-512.png`. Once the Pages URL is known, replace the relative `og:image` and `twitter:image` values in `index.html` with its absolute image URL for reliable previews across social platforms. The embed theme colour is `#fee072`.

The audio clips are supplied from the user's local collection. Check that you have permission to publish audio before making a public repository.

## Files

- `index.html` — page structure
- `style.css` — responsive styling
- `script.js` — game logic
- `tracks.js` — curated track list
- `audio/` — three 20-second MP3 excerpts per song
- `art/` — fourteen album covers extracted from the selected source files
- `fonts/` — the user-supplied Wubbzy Logo and Valken fonts
- `assets/` — favicons extracted from the first GIF frame
- `site.webmanifest` — icon and theme colour metadata
