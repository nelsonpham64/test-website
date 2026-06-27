# test Website

A GitHub Pages-ready anniversary website with:

- A dark ambient blue and pink chapter flow
- A pink and blue interactive background
- A glowing cursor tracker
- A more realistic animated heart lock with masked date entry
- A short "vibe coded with love..." loading screen
- A hover-opening heart envelope that starts the story
- Forward-only story navigation until the final reveal
- A press-and-hold scrapbook with a realistic open-book look and 3D page turns
- A Spotify-Wrapped-inspired year recap with animated stats and rankings
- A six-question date mood quiz
- Result cards for restaurant/theme/outfit/dessert ideas
- A memory jar with animated crumpled notes
- A blooming pink and blue tulip ending

## Customize it

Edit these files:

- `index.html` for the visible sections, memory cards, and final copy
- `script.js` for quiz questions, date result plans, memory jar notes, and final clue
- `styles.css` for colors and layout
- `assets/anniversary-hero.png` for the hero image

## Add real photos

The scrapbook photos are currently styled placeholders. To add real photos, replace each
`.photo-fill-*` background in `styles.css` with a photo URL, for example:

```css
.photo-fill-one {
  --photo-fill: url("assets/photo-01.jpg") center / cover;
}
```

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the repository.
3. In GitHub, go to Settings -> Pages.
4. Set the source to the `main` branch and root folder.
5. Open the Pages URL GitHub gives you.

No build step is needed.
