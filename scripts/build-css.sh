#!/usr/bin/env bash
# build-css.sh — concatenate + minify the 20 stylesheets into one bundle.
# Re-run whenever any CSS file in assets/css/ changes.
# Output: assets/css/bundle.min.css (committed, shipped to prod).
#
# Order matters — tokens/reset must come first so later files can override.
# Mirrors the order previously in index.php.

set -euo pipefail
cd "$(dirname "$0")/.."

OUT="assets/css/bundle.min.css"
TMP="$(mktemp)"

ORDER=(
  main
  layout
  components
  animations
  hero
  services-teaser
  signature-work
  about-teaser
  gallery-marquee
  visit
  final-cta
  footer
  services-page
  faq
  gallery-page
  about-page
  contact-page
  faq-page
  legal-page
  book-page
)

for name in "${ORDER[@]}"; do
  f="assets/css/${name}.css"
  if [[ ! -f "$f" ]]; then
    echo "✗ missing: $f" >&2
    exit 1
  fi
  echo "/* ===== ${name}.css ===== */" >> "$TMP"
  cat "$f" >> "$TMP"
  echo "" >> "$TMP"
done

# Minify: strip /* comments */, collapse all whitespace, trim around { } ; : , >
# NOTE: we deliberately do NOT trim around + or ~. Inside calc() the + is a
# binary operator that REQUIRES surrounding whitespace (`calc(a + b)`), so
# collapsing it to `calc(a+b)` makes the whole value invalid and the property
# silently drops to its initial value (this once zeroed the mobile nav drawer
# padding). As selector combinators, `a + b` / `a ~ b` are valid with spaces
# too, so keeping them costs a few bytes and nothing else.
perl -0777 -pe '
  s{/\*.*?\*/}{}gs;              # block comments
  s/\s+/ /g;                     # collapse whitespace
  s/\s*([{};,:>])\s*/$1/g;       # trim around special chars (not + or ~)
  s/;}/}/g;                      # drop trailing semicolons before }
  s/^\s+//; s/\s+$//;            # outer trim
' "$TMP" > "$OUT"

RAW_SIZE=$(wc -c < "$TMP")
MIN_SIZE=$(wc -c < "$OUT")
GZ_SIZE=$(gzip -c "$OUT" | wc -c)
printf "✓ bundle built: %s\n" "$OUT"
printf "  raw:  %6.1f KB  (concat of %d files)\n" "$(bc -l <<< "$RAW_SIZE/1024")" "${#ORDER[@]}"
printf "  min:  %6.1f KB  (-%d%%)\n" "$(bc -l <<< "$MIN_SIZE/1024")" "$((100 - MIN_SIZE * 100 / RAW_SIZE))"
printf "  gz:   %6.1f KB  (what the wire actually ships)\n" "$(bc -l <<< "$GZ_SIZE/1024")"
rm -f "$TMP"
