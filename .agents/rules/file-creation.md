---
trigger: model_decision
description: When editing files
---

1. Do not re-create files that already exist in another directory or even in that same directory. Ensure new files are created in the appropriate directory (e.g., Javascript files for page views should go in the `js/` directory).
2. **Token Economy**: Make extremely target-focused, minimal code updates. Modify only what is requested without adding unrequested code or comments to maximize efficiency. Use contiguous replacement tools over complete file rewrites where possible.
3. **Viewport Responsiveness**: Ensure all screens render correctly on smaller laptop viewports (e.g., 1366x768 / Lenovo X270). Avoid long stacked inputs; use grid/column layouts (like 3-column splits) with responsive flex wrappers, keep inputs conformed to reasonable widths (e.g. `max-width: 250px`), and align toolbar elements inline.