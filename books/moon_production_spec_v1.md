# As the Moon Swallows the Stars — Production Spec v1

Handoff document. Everything decided in session one. Attach to a new chat to resume.

---

## 1 · The book

Book 1 of the trilogy. Anthony Messina's desk drawer across one year, told as discrete facsimile documents in chronological order — session notes, court orders, post-its, calendars, receipts, voicemail transcripts, his pocket notebook. Twelve two-page calendar spreads serve as chapter breaks.

Part One is entirely facsimile. After Eva's death and a nearly blank dated page, Part Two drops into roughly 30 pages of third-person prose. The final page returns to facsimile: lined notebook paper, his hand, the title line, initialed *A. M.*

Art-object book in the *S.* / *Building Stories* family. Seven or eight visual registers. Three handwriting modes for Anthony alone across 350+ pages.

---

## 2 · Production method (decided)

**Never round-trip the typed layer.** Rescanning printed type destroys it — soft edges, halftone artifacts, moiré. The typed layer stays native and vector forever.

**The ink-only overlay workflow:**

1. Print the typed page as a *guide* at 15–20% gray, or in light blue
2. Handwrite annotations on it
3. Scan at 600 dpi, grayscale, TIFF — all auto-enhance and auto-crop OFF
4. Levels: pull the white point until the gray guide and paper vanish, leaving only ink
5. Place as a **Multiply** layer over the untouched digital page in layout

Variant: print only registration corners and a faint content box, write around it, same knockout. Zero contamination, slightly more guesswork on placement.

**Materials:** laser prints, not inkjet (wet ink over inkjet toner smears). Pigment pens — Sakura Micron, Uni Pin — scan far crisper than ballpoint. Fountain pen looks right but feathers on laser stock; test before committing. Flatbed scanner, never phone.

**Handwriting consistency:** build custom fonts from your own hand via Calligraphr — one for clinical marginalia, one for the sloppy notebook, one for Theresa. Multiple alternates per letter so it doesn't read as a font. Reserve genuine pen-on-paper scans for scored moments: the anniversary receipt, the mass program, the final notebook page.

**Order of operations:** write the entire manuscript as tagged plain text FIRST — `[SESSION NOTE]`, `[NOTEBOOK]`, `[MARGINALIA — blue, dated]`. Lock the text. Then do one production pass. Every revision after a page is handwritten and scanned costs an hour of redone work.

---

## 3 · Physical specs

| | |
|---|---|
| Trim | **7 × 10 in** |
| Binding | Sewn signatures (must lie flat for spreads) |
| Margins | Mirrored — inside **0.75"**, outside **0.375"**, top **0.375"**, bottom **0.5"** |
| Gutter field | **0** (allowance is baked into the inside margin — never set both) |
| Usable area | **5.875" × 9.125"** per page |
| Bleed | 0.125" all sides — Affinity only, Word can't do it |

**Why 7 × 10:** in-world documents are US Letter. At 6 × 9 you'd reproduce them at ~55%, turning 10pt clinical type into 5.5pt. At 7 × 10 you're at ~70%. Calendar spreads also need the width.

**Design at trim, not at Letter.** The forms are rendered to fit the book, not photographed 1:1.

### The safety line

An invisible boundary, not a drawn element. Exists because of trim drift (printer blades wander ~1/16", sometimes 1/8"), the gutter curve (~0.25" each side of the fold is compressed or shadowed even when flat), and thumbs on the bottom outer corner.

**Readable content never crosses it. Paper edges may.** A document's edge disappearing into the spine reads as a page underneath another page — which is what a real stack on a desk looks like. On collage pages, put readable content toward the outside and let small items run off the inside edge.

To see it: View → tick **Ruler**; File → Options → Advanced → Show document content → tick **Show text boundaries**.

### Collage logic

Most pages combine several small documents — a journal page with a phone call and a text message. Major documents (court orders, full case notes) get a page alone, centered and calm. The contrast does work: collage pages feel accumulating, single documents feel formal and isolated.

---

## 4 · Word setup

- Layout → Size → **7" × 10"**
- Layout → Margins → Custom → **Mirror margins** (Multiple pages dropdown) with the values above
- Layout → Breaks → Page break between documents
- Turn OFF: widow/orphan control (except Prose), snap objects to grid
- File → Options → Save → **embed fonts**
- **Kill autocorrect entirely** — Options → Proofing → AutoCorrect Options, both tabs. It will capitalize `pt.`, curl quotes inside typewriter documents, convert `--` to em dashes, and autocapitalize after `x3.`

### Hyphenation

Layout → Hyphenation → Hyphenation Options:

- Automatically hyphenate document — **ON**
- Hyphenate words in CAPS — **OFF**
- Limit consecutive hyphens to — **2**

**Hyphenation Zone is permanently disabled in .docx** and cannot be enabled — the engine changed in Word 2013 and the field only works in legacy .doc. Ignore it. It's a raggedness control and does nothing for justified text anyway.

Per-style **Don't hyphenate** is ON for everything except Newsprint and Prose.

### Word's limits

No bleed, no CMYK, no Multiply blending. Word handles drafting, register-tagging, and mocking up the typed layer. Final assembly needs **Affinity Publisher** (~$70 one-time) or InDesign. Set the same 7 × 10 in both and nothing is wasted.

---

## 5 · Style sheet

All paragraph styles: **Based on (no style)**, Automatically update **OFF**, **Only in this document**. All line spacing set to **Exactly**, never Multiple.

Dialog: `Alt+Ctrl+Shift+S` → New Style. Everything beyond font/size/color lives behind the **Format** button, bottom-left.

### Document registers

**Clinical note** · `Ctrl+Alt+1`
Courier New 10 Regular · kerning off · Left · Right indent 0.65" · Exactly 13pt · Before/After 0 · Tabs: 1.0" Left, 1.4" Left
*The 0.65" right indent gives a 62-character measure. Don't widen it.*

**Court document** · `Ctrl+Alt+2`
Times New Roman 11 · kerning on above 8pt · Justified · Right 0.35" · First line 0.5" · Exactly 15pt · Tabs: 0.5" L, 1.0" L, 5.4" Right with dot leader

**Institutional form** · `Ctrl+Alt+3`
Arial 8.5 · Condensed 0.1pt · Left · Right 0.5" · **Hanging 1.6"** · After 3pt · Exactly 12pt · Tabs: 1.6" Left, 5.35" Right with underline leader
*The hanging indent is what makes a form look like a form.*

**Newsprint** · `Ctrl+Alt+4`
Georgia 8 · Condensed 0.15pt · Justified · First line 0.14" · Exactly 10pt · **hyphenation ON**
Set in a text box, two columns at 1.6" with 0.14" gutter and a hairline rule between.

**Screen** · `Ctrl+Alt+5`
Segoe UI 9 · Left · L/R indent 0.15" · After 2pt · Exactly 12pt
*Texts, emails, voicemail transcripts. Bubble variants: `Sent` right-aligned 8% gray fill, `Received` left 3% fill.*

**Date stamp** · `Ctrl+Alt+6`
Arial 7 · **All caps** · Expanded 0.4pt · Left · After 6pt · Exactly 9pt · **Keep with next ON** · Following paragraph = Clinical note
*Black, not gray — it's the reader's compass through 350 pages.*

**Prose** · `Ctrl+Alt+7` (Part Two only)
Garamond 11.5 · kerning on above 8pt · Justified · First line 0.2" · Exactly 15.5pt · **Widow/Orphan ON, Keep lines together ON, hyphenation ON**

**HAND** · `Ctrl+Alt+8` (placeholder, deliberately ugly)
Consolas 10 **Italic** · RGB 0/70/180 · L/R indent 0.25" · Before/After 3pt · Exactly 12pt
Tag mode inline: `[HAND-marginalia]`, `[HAND-notebook]`, `[HAND-Theresa]` — find-and-replace pulls every handwritten element at production time.

### Character styles

Set **Style type: Character** FIRST — switching after entering formatting discards it silently. Based on `Default Paragraph Font`. Format dropdown shrinks to Font, Border, Language, Shortcut key.

**Redacted** — Courier New 10, font color **White**. Format → Border → **Shading** tab → Fill Black → **Apply to: Text** (not Paragraph). Select the word only, not the trailing space or paragraph mark.
*Exports reliably to PDF and the underlying word stays searchable.*

**Stamp** — Arial 9 **Bold**, All caps, RGB 150/30/30, Expanded 0.6pt. Rotation happens by putting it in a text box and rotating the box.

### Variants (Based on a real parent, so they inherit)

- **Court caption** — based on `Court document`; Centered, Special (none)
- **Newsprint hed** — based on `Newsprint`; Franklin Gothic Demi 15 (Arial Bold fallback), Spacing back to **Normal**, Left, Special (none), After 4pt, Exactly 16pt, **Don't hyphenate ON**
- **Prose opening** — based on `Prose`; Special (none)

### Normal as a tripwire

Set Normal to **Comic Sans MS 14, magenta**. All registers are Based on (no style) so they're immune. Word's built-ins (Header, Footer, Caption) will turn magenta — harmless, but page numbers must then be formatted directly in the header.

Anything appearing in magenta is untagged text.

### Template

File → Save As → **Browse** → Save as type **Word Template (\*.dotx)** → `moon_v1` → save in the project folder, not Custom Office Templates.

*"Only in this document" means don't write the definition back to Normal.dotm. Styles still save into the template and propagate to documents started from it.*

---

## 6 · Calendar spread

### Structure

Eight columns across the spread, four per page. **The fold falls on the rule between WED and THU.**

```
VERSO                              RECTO
SUN   MON   TUE   WED      |      THU   FRI   SAT   NOTES
```

Sunday start (US convention; the first `?` appears beside a Sunday brunch, so Sunday needs full weight).

The NOTES column is the eighth column of a uniform grid, not a sidebar — same style as the day names, same gray borders, same horizontal divisions between weeks. **Six discrete weekly cells, not one tall box**, because that's what makes the degradation visible week by week rather than just full-or-empty.

### Page parity

**Page 1 is always a recto.** Word has no setting to change this and neither does any real book. Verso = even. Every calendar spread runs even–odd. Leave page 1 blank (half-title) and start March on **pp. 2–3**.

Worth watching: this parity requirement recurs eleven more times as Part One's document count shifts during revision.

### Final measurements

| Element | Value |
|---|---|
| Month rule | Absolute **0.58"** below **Page**, 1½pt black |
| Day-name row | **0.2"**, Exactly |
| Body rows | **1.38" × 6**, Exactly |
| Columns | **1.47" × 4** |
| Table preferred width | **5.88"**, Inches |
| Writing space per cell | ~1.16" (3 comfortable lines, 4 cramped) |
| NOTES sub-rows | **0.34" × 4**, Exactly |

### Calendar styles

**Calendar month** — Arial, All caps, Expanded 1.2pt, Left, Exactly 15pt, After 8pt
*Size was increased from 13pt during the session — final value not recorded. See open items.*

**Calendar year** — based on `Calendar month`, Alignment **Right**. Recto only.
*Trailing letterspacing hangs the final `0` ~0.017" shy of the margin. Fix: select the last character, Font → Advanced → Spacing Normal.*

**Calendar dayname** — Arial 7, All caps, Expanded 0.5pt, Centered, Exactly 10pt, Before/After 0

**Calendar date** — Arial 8, Left, indents 0, Exactly 10pt. No leading zeros.

**Calendar date muted** — based on `Calendar date`, color **RGB 153/153/153**. Adjacent-month spill days.

### Rule hierarchy

Reads instantly as title / header / body:

1. Month rule — **1½pt black**, full page width
2. Day-name bottom rule — **¾pt black**, Apply to Cell
3. Grid — **½pt, RGB 102/102/102**
4. Notes lines — **½pt, RGB 191/191/191**

### Build order

**Month line:** plain paragraph at the top of the page, NOT a text box (paragraph borders can't exceed their container, and text boxes carry 0.1" internal margins). Turn on ¶ and confirm no empty paragraph above it.

**Full-page rule:** Insert → Shapes → Line, hold Shift. Right-click → More Layout Options:
- Position → Horizontal: Absolute **0"** right of **Page**
- Position → Vertical: Absolute **0.58"** below **Page**
- **Untick "Move object with text," THEN tick "Lock anchor"** — that order
- Text Wrapping → **In Front of Text**
- Size → Width **7"**, Height **0"**
- Shape Format → Outline → Black, **1½pt**

**Table:** Insert 4 × 6. Immediately Properties → Table → Options → untick **Automatically resize to fit contents**. Then column width 1.47", row height 1.38" Exactly, vertical alignment Top, cell margins 0.04 / 0.05 / 0.05 / 0.04, borders All at ½pt RGB 102.

**Day-name row:** click in the top row → Table Layout → **Insert Above** (inherits column widths exactly — this is why it must be inside the same table, never a separate table stacked above). Type `Sun` Tab `Mon` Tab `Tue` Tab `Wed` — **do not Tab after the last cell**. Row height 0.2" Exactly, Align Center, cell margins T/B 0.02" L/R 0.05" (0.04" overflows and Word clips silently), bottom border ¾pt Apply to **Cell**.

**NOTES column rules:** split each cell **individually** — Table Layout → Split Cells → 1 column, 4 rows. Then select all 24 sub-cells: row height 0.34" Exactly, cell margins all **0"**, paragraph style `Calendar date`, borders ½pt RGB 191 **interior horizontal only**, Apply to **Cell**.

### March 2030 grid

March 1, 2030 falls on a **Friday**. *Italics = muted spill days.*

| | SUN | MON | TUE | WED | ‖ | THU | FRI | SAT |
|---|---|---|---|---|---|---|---|---|
| 1 | *24* | *25* | *26* | *27* | ‖ | *28* | 1 | 2 |
| 2 | 3 | 4 | 5 | 6 | ‖ | 7 | 8 | 9 |
| 3 | 10 | 11 | 12 | 13 | ‖ | 14 | 15 | 16 |
| 4 | 17 | 18 | 19 | 20 | ‖ | 21 | 22 | 23 |
| 5 | 24 | 25 | 26 | 27 | ‖ | 28 | 29 | 30 |
| 6 | 31 | *1* | *2* | *3* | ‖ | *4* | *5* | *6* |

Row 6 is almost entirely April spill. Correct — real planners do this, and all twelve spreads must be dimensionally identical.

Cells stay otherwise empty. Handwriting goes on as a scanned overlay in production.

### Quick Parts

When the verso is right: select from the start of the month line, Shift-click after the table's last cell (the anchored line comes along), then Insert → Quick Parts → **Save Selection to Quick Part Gallery**.

- Name `cal_verso` / `cal_recto`
- Category: new one called **Moon**
- Save in: **moon_v1.dotx**
- Options: **Insert content in its own page**

Recall by typing the name and pressing **F3**.

Verify after the first insertion that the anchored line survived and is still at 0.58" absolute. If it doesn't survive, draw it fresh each time — forty seconds, and absolute positioning makes it reliable.

---

## 7 · Previewing spreads

Word cannot show facing pages correctly. It lays out 1–2, 3–4 in flat reading order; a real book pairs 2–3, 4–5. Whatever Word shows as a spread is off by one.

**Use Firefox.** Save As → PDF, open it, click the `>>` overflow at the right end of the viewer toolbar → **Even Spreads** (pairs starting from page 2, leaving page 1 alone). Set zoom to **Actual Size**.

Make it permanent in `about:config`:
- `pdfjs.spreadModeOnLoad` → **2**
- `pdfjs.defaultZoomValue` → **100**

Edge, Chrome and Opera ignore two-up layout entirely. Firefox is the right tool, not a fallback.

Do this after every spread. It's the only way to catch a Wednesday drifting toward the fold.

---

## 8 · Word behaviors learned the hard way

**Paragraph borders merge.** Consecutive paragraphs with identical border formatting get drawn as one block with a single rule at the bottom. Tested and failed: different styles, a 0.01" indent difference, a 1-unit RGB difference. Word's merge check is tolerant of all of them. **Use Split Cells instead.**

**Split Cells locks the Rows field** when multiple cells are selected and *Merge cells before split* is unticked. Do cells one at a time.

**"Automatically resize to fit contents" is greyed out on nested tables** — it's inherited from the parent. Set it on the outer table.

**Column widths are stored per row, not per table.** Rows drift apart independently, usually after an Insert Above. The `¤` end-of-row markers reveal it: if they don't form a straight vertical line, the rows are different widths. Fix: Select Table → AutoFit → **Fixed Column Width** → **Distribute Columns** → set table preferred width in inches.

**Split Cells produces "At least" row heights**, which expand to fit content and push rows to the next page. Always reset to **Exactly**.

**Ctrl+Enter pushes everything after the cursor.** Cursor must be *before* the first character, not after it. Ctrl+Home first.

**The ruler reports the cursor's location**, not the page you're looking at. Click into a page before trusting its margins. Alt+drag a margin marker shows exact measurements; Esc before releasing.

**Lock anchor blocks dragging the anchor.** Untick it, move the anchor, re-tick.

**Text boxes carry 0.1" internal margins** by default and float wherever dropped. Paragraph borders inside one span only the box, not the column.

---

## 9 · Open items

**Clinical note typeface — unresolved.** Courier New says *dictated and transcribed*; a clean sans says *typed into an EHR by a man with a modern practice*. The year is 2030, so sans may be truer. Set the Reeves intake both ways and pick early — it's the most-repeated register in the book and switching at page 200 is painful.

**Confirm the year is 2030.** Every weekday in all twelve grids depends on it, as does which day Eva's standing appointment falls on.

**Month size.** Increased from 13pt mid-session; final value not recorded. Re-check that the 0.58" rule isn't striking the type and that six rows at 1.38" still fit on the page.

**Print test, not yet done.** Print the March verso at actual size, tape the spread at the fold, write a real week into it in your own hand. The 1.16" of writing space per cell is the whole gamble. If your hand needs more, the answer is an 8 × 10 trim — not taller rows, since six rows at 1.5" needs 9.0" against 8.325" available.

**Week-number column — optional, recommended.** 0.22" hard against the verso's inside edge, Arial 6pt, 50% gray. Professional planners carry them. Gives a silent counter running 1–52 across the twelve spreads: when February's grid shows weeks 49–52, the year is visibly running out on the page.

**Notes line count.** Four lines at 0.34" assumes you write smaller in a notes column than in a day cell. If not, go to three lines. Lines you can't write on are worse than no lines.

---

## 10 · Corrections issued during the session

Kept so they don't get re-introduced:

- **Verso margins:** a verso is the LEFT page, so its spine is on the RIGHT. The month sits 0.375" from the top and 0.375" from the *left* — the outer edge. (Earlier stated as 0.75" from the left; wrong.)
- **Hyphenation zone:** the instruction to set 0.25" was wrong. The field is permanently disabled in .docx.
- **Newsprint hed:** the instruction to untick All caps was wrong. Newsprint has no All caps to inherit.
- **Border merge fixes:** alternating styles, 0.01" indent offset, and 1-unit color difference were all suggested and all fail.
- **Month title in a text box:** diagnosed as a text box when it was a paragraph border. The rule stopping short was correct behavior for a border inside a container; the actual cause was page parity.
