// app.js

// ===== SINGLE SELECT TABLE (global rule) =====
function initSingleSelectTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    tbody.addEventListener("click", (e) => {
        // Ignore button clicks inside a row
        if (e.target.closest("button")) return;

        const tr = e.target.closest("tr");
        if (!tr) return;

        tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
        tr.classList.add("selected");
    });
}

// ===== BASIC CONFIRM MODAL (reusable) =====
function showConfirmModal({ title = "Confirm", message = "Are you sure?", okText = "OK", cancelText = "Cancel", onOk }) {
    // If already exists, remove it
    const old = document.getElementById("WD_CONFIRM_MODAL");
    if (old) old.remove();

    const modal = document.createElement("div");
    modal.id = "WD_CONFIRM_MODAL";
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,.25);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
    `;

    modal.innerHTML = `
      <div style="width: 420px; background:#fff; border:1px solid #bbb; box-shadow:0 6px 18px rgba(0,0,0,.2)">
        <div style="padding:10px 12px; background:#f2f2f2; border-bottom:1px solid #ddd; font-weight:700">${title}</div>
        <div style="padding:18px 12px; font-size:13px">${message}</div>
        <div style="display:flex; justify-content:center; gap:10px; padding:12px 12px 16px">
            <button id="WD_MODAL_OK" class="wd-action-btn primary" style="min-width:120px">${okText}</button>
            <button id="WD_MODAL_CANCEL" class="wd-action-btn" style="min-width:120px">${cancelText}</button>
        </div>
      </div>
    `;
 
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);

    document.getElementById("WD_MODAL_CANCEL").onclick = () => modal.remove();
    document.getElementById("WD_MODAL_OK").onclick = () => {
        modal.remove();
        if (typeof onOk === "function") onOk();
    };
}
