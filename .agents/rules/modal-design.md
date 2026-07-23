---
trigger: model_decision
description: When creating or editing modals
---

1. **Title Bar**: Do not reproduce the windev topbar title bar with the red and black colored section. Use a solid `#2e3192` blue banner with bold white title text and a close button.
2. **Body Elements**:
   - **No Black Banners**: Never place black background title banners (e.g. `#333` background headers) inside the modal body. Remove them completely.
   - **Labels**: Ensure all modal labels use a clear font size (e.g. `13px`) and weight (`bold`) in `#333` color.
   - **Input Fields**: Style all input fields with a proper border radius (`6px` border-radius, `#cfd3dd` border, similar to `payment-order-form.html` fields) and paddings.
3. **Footer Buttons**:
   - Primary Validate button must use `#2e3192` background (white bold text).
   - Danger Cancel button must use `#cd2027` background (white bold text).
   - Use conformed button sizes (`padding: 10px 40px; min-width: 120px`) for consistent styling.