# Website typography

Two local variable WOFF2 subsets derived from Adobe Source Han fonts:

- https://github.com/adobe-fonts/source-han-serif — Source Han Serif CN VF
- https://github.com/adobe-fonts/source-han-sans — Source Han Sans CN VF

Downloaded from each official repository's release/Variable/WOFF2/OTF/Subset directory on 2026-10-22. The original OFL notices accompany both files. Derivative family names are Strata Exhibition Serif and Strata Exhibition Sans; original reserved font names are not used for the modified font names.

typography.css maps display headings to the serif family, reading and controls to the sans family, and English archive numerals to the system Georgia family. The subsets include the current website copy, ASCII and Chinese punctuation; uncovered characters use the declared system fallback. Rebuild with scripts/build-font-subsets.py after adding substantial copy, using official masters and fonttools[woff] plus brotli in a local build environment. The website itself has no font CDN or font processing dependency.
