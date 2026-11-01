#!/usr/bin/env bash
set -eu
hook_category=${1:-pets}
for hook_mode in separate ams; do
 hook_fixture=hooks-$hook_category-$hook_mode
 mkdir -p artifacts/products/$hook_fixture
 for hook_printer in a1-mini 256; do
  cp artifacts/hooks/$hook_category/mixed-five-$hook_mode-$hook_printer.3mf artifacts/products/$hook_fixture/$hook_fixture-$hook_printer.3mf
 done
 ITEM=$hook_fixture PROFILE_KIND=hooks BAMBU_STUDIO_PATH=/workspace/slicer-validation/bambu node scripts/check-product-slicer.mjs
done
