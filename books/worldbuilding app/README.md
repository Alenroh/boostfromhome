# Worldbuilder

A private encyclopedia of your story, styled after Wikipedia. It runs entirely on
this computer and never connects to the internet.

## Start it
Worldbuilder now lives inside **Jules Apps**, together with Boost and SIE Study. Double-click
**Start Jules Apps.bat** in the Jules Apps folder, or **Start Worldbuilder.bat** here, which
opens Jules Apps straight on the Worldbuilder tab. Your browser opens at http://localhost:4747.
Leave the black window open while you work; close it to stop the app.

To use Worldbuilder in a browser tab of its own, click **↗** in the Jules Apps header while on the
Worldbuilder tab. To run only Worldbuilder's own server instead, run `node server.js` in this folder.

## How it works
- Every character and location is an **article**, with an infobox, a contents box,
  sections, a gallery and categories. Use the **Edit** tab to change it (it saves as you type)
  and **Talk** for notes to yourself.
- In any text box, `[[Name]]` links to another page. Links to pages that don't exist yet
  show in red; click one to create that page. `''italic''`, `'''bold'''`, and lines starting
  with `*` for bullet lists also work.
- **Characters** have where they live, where they often go, relationships, and a dropdown
  for each month from **March to February** (where they're based, where they travel,
  what happens, notes, and who else is there).
- **Locations** can sit inside each other (country › city › tavern), and list who lives
  there and who is there each month.
- **Story notes** are general pages for everything that isn't a person or place (rules,
  structure, production). Any page can also have **extra infobox rows** and **your own sections**
  (on its Edit tab), and `<pre> … </pre>` keeps a document exactly as typed.
- **The Year** shows everyone × every month in one table; **Relationship web** is a
  draggable map of who knows whom; **Random article** picks one of your pages.

## Your data
Everything is saved in the `data` folder next to this file (created when you first save):
`data/world.json` for text, `data/photos/` for images, and `data/backups/` for a snapshot
every 10 minutes while you work. It's in OneDrive, so it's backed up. Settings › Export
also downloads a copy.
