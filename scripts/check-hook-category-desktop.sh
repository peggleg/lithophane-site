#!/usr/bin/env bash
set -eu
hook_category=${1:-pets}
DISPLAY=:100 PYTHONPATH=/workspace/slicer-validation/python python scripts/check-bambu-desktop.py --fixtures artifacts/hooks/$hook_category --output artifacts/hooks/$hook_category/desktop --kinds mixed-five-separate-a1-mini mixed-five-separate-256 mixed-five-ams-a1-mini mixed-five-ams-256
