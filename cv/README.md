# CV

`cv26.tex` is the source. Build it with:

```bash
latexmk -pdf cv26.tex
```

`.latexmkrc` sets `$jobname`, so the build writes **`antonio_alcantara_cv.pdf`**
directly — the filename the site's **CV** nav link points at. There is
deliberately only one PDF in this folder; don't add a second copy under a
different name.

Notes:

- The "Updated <month> <year>" stamp in the page footer comes from the build
  date (`\cvupdated` in the preamble), so recompiling refreshes it and it can't
  go stale. The website carries no CV date of its own.
- Needs TeX Live with `XCharter`, `newtxmath`, `microtype`, `titlesec`,
  `enumitem`, `fancyhdr` and `lastpage` — all in a standard full install.
- Build artefacts (`.aux`, `.log`, `.fls`, `.fdb_latexmk`, …) are gitignored.
