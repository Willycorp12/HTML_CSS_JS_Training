//Global Account Picker for reuse
window.AccountPicker = {
  data: { items: [], mapById: new Map(), childrenByParent: new Map(), loaded: false },
  config: {
    title: "Select Account",
    targetClasses: [], // e.g. ["CLASS 6", "CLASS 8"]
    forbiddenIds: new Set(),
    onSelect: null,
    onClose: null,
    allowClear: false,
    parentSelectable: false, // Default: Parents cannot be selected
    onOpen: function() {
      const inp = document.getElementById("GAP_SEARCH");
      if (inp) inp.focus();
    }
  },

  async ensureData() {
    if (this.data.loaded) return;
    if (typeof apiFetch === 'undefined') return;

    const resp = await apiFetch("/api/v1/chartOfAccounts/getAccountList?page=1&limit=2000", { method: "GET" });
    if (resp && resp.success) {
      const items = (resp.accounts || []).filter(a => a.status === true).map(a => {
        const pid = (a.parentAccountId !== undefined) ? a.parentAccountId : a.mainAccountId;
        return {
          id: Number(a.accountId),
          parentId: Number(pid || 0),
          code: String(a.mainAccountCode || ""),
          name: String(a.accountName || ""),
          fullAccountName: String(a.fullAccountName || a.accountName || ""),
          desc: String(a.description || ""),
          className: "CLASS " + (a.accountClassId || "")
        };
      });

      this.data.items = items;
      this.data.mapById = new Map();
      this.data.childrenByParent = new Map();

      for (const it of items) {
        this.data.mapById.set(it.id, it);
        const p = (it.parentId === it.id) ? 0 : (it.parentId || 0);
        if (!this.data.childrenByParent.has(p)) this.data.childrenByParent.set(p, []);
        this.data.childrenByParent.get(p).push(it.id);
      }

      // Sort
      for (const [p, arr] of this.data.childrenByParent.entries()) {
        arr.sort((a, b) => {
          const A = this.data.mapById.get(a);
          const B = this.data.mapById.get(b);
          const na = parseInt(A.code, 10);
          const nb = parseInt(B.code, 10);
          if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
          return (A.name || "").localeCompare(B.name || "");
        });
      }
      this.data.loaded = true;
    }
  },

  open(opts) {
    // Merge opts, but reset parentSelectable to false by default unless explicitly true in opts
    this.config = { ...this.config, parentSelectable: false, ...opts };
    this.ensureData().then(() => {
      this.renderModal();
    });
  },

  close() {
    const el = document.getElementById("GLOBAL_ACCOUNT_PICKER");
    if (el) el.style.display = "none";
    if (typeof this.config.onClose === 'function') this.config.onClose();
  },

  renderModal() {
    let el = document.getElementById("GLOBAL_ACCOUNT_PICKER");
    if (!el) {
      el = document.createElement("div");
      el.id = "GLOBAL_ACCOUNT_PICKER";
      el.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:10002; display:none;";
      el.innerHTML = `
            <div style="width:600px; max-width:90vw; height:500px; max-height:85vh;
                        background:#fff; margin:8vh auto; border-radius:8px; overflow:hidden;
                        box-shadow:0 10px 30px rgba(0,0,0,.3); display:flex; flex-direction:column;">
                <div style="padding:12px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#2e3192; color:#fff;">
                    <div style="font-weight:bold;" id="GAP_TITLE">Select Account</div>
                    <div style="cursor:pointer; font-size:20px;" id="GAP_CLOSE">&times;</div>
                </div>
                <div style="padding:10px; border-bottom:1px solid #eee;">
                    <input id="GAP_SEARCH" placeholder="Search account name or code..." style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                </div>
                <div id="GAP_TREE" style="padding:10px; overflow:auto; flex:1;"></div>
                <div id="GAP_FOOTER" style="padding:10px; border-top:1px solid #eee; text-align:right; display:none;">
                    <button class="wd-action-btn" id="GAP_CLEAR_BTN" style="background:#cd2027; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Clear Selection</button>
                </div>
            </div>
        `;
      document.body.appendChild(el);
      el.addEventListener("click", (e) => { if (e.target === el) this.close(); });
      document.getElementById("GAP_CLOSE").onclick = () => this.close();
      document.getElementById("GAP_SEARCH").addEventListener("input", () => this.renderTree());
      document.getElementById("GAP_CLEAR_BTN").onclick = () => {
        if (this.config.onSelect) this.config.onSelect(null);
        this.close();
      };
    }

    document.getElementById("GAP_TITLE").textContent = this.config.title || "Select Account";
    document.getElementById("GAP_FOOTER").style.display = this.config.allowClear ? "block" : "none";
    const inp = document.getElementById("GAP_SEARCH");
    if (inp) inp.value = "";
    el.style.display = "block";
    this.renderTree();
    if (this.config.onOpen) this.config.onOpen();
  },

  renderTree() {
    const tree = document.getElementById("GAP_TREE");
    const inp = document.getElementById("GAP_SEARCH");
    const q = (inp ? inp.value : "").trim().toLowerCase();
    if (!tree) return;
    tree.innerHTML = "";

    const filterOn = q.length > 0;
    const targetClasses = this.config.targetClasses || [];
    const hasClassFilter = targetClasses.length > 0;
    const mustShow = new Set();
    const mustExpand = new Set();

    const matches = (it) => {
      if (!filterOn) return true;
      return `${it.code} ${it.name} ${it.desc} ${it.className}`.toLowerCase().includes(q);
    };

    for (const it of this.data.items) {
      if (this.config.forbiddenIds.has(it.id)) continue;
      let classMatch = !hasClassFilter || targetClasses.includes(it.className);
      if (classMatch && matches(it)) {
        mustShow.add(it.id);
        let p = it.parentId;
        while (p) { mustShow.add(p); mustExpand.add(p); const pit = this.data.mapById.get(p); p = pit ? pit.parentId : null; }
      }
    }

    const drawNode = (id, depth) => {
      const it = this.data.mapById.get(id);
      if (!it || this.config.forbiddenIds.has(id)) return;
      if (filterOn && !mustShow.has(id)) return;
      if (!filterOn && hasClassFilter && !targetClasses.includes(it.className)) return;

      const hasKids = (this.data.childrenByParent.get(id) || []).length > 0;
      const isExpanded = filterOn ? mustExpand.has(id) : true;
      const isSelectable = !hasKids || this.config.parentSelectable;
      
      const row = document.createElement("div");
      // Grey out if not selectable
      const colorStyle = isSelectable ? "" : "color:#aaa;";
      const cursorStyle = isSelectable ? "cursor:pointer;" : "cursor:default;";
      row.style.cssText = `display:flex; align-items:center; gap:10px; padding:8px 8px; border-radius:10px; margin-left:${depth * 18}px; ${colorStyle} ${cursorStyle}`;

      const icon = document.createElement("span");
      icon.textContent = hasKids ? (isExpanded ? "▼" : "▶") : "◾"; // Default expanded in picker
      icon.style.width = "18px"; icon.style.opacity = ".7";
      
      const label = document.createElement("div");
      label.innerHTML = `<span style="opacity:.7">${it.code} - </span><b>${it.name}</b>`;
      
      row.appendChild(icon); row.appendChild(label);
      
      if (isSelectable) {
        row.onmouseenter = () => row.style.background = "rgba(0,0,0,0.04)";
        row.onmouseleave = () => row.style.background = "";
        row.onclick = () => { if (this.config.onSelect) this.config.onSelect(it); this.close(); };
      }
      
      tree.appendChild(row);
      if (hasKids && isExpanded) {
        const kids = this.data.childrenByParent.get(id) || [];
        for (const k of kids) drawNode(k, depth + 1);
      }
    };

    const roots = this.data.childrenByParent.get(0) || [];
    for (const rid of roots) drawNode(rid, 0);
    if (!tree.children.length) tree.innerHTML = `<div style="padding:14px; opacity:.75;">No matches found.</div>`;
  }
};

// ---------- Reset Details Modal ----------
function resetDetailsModal(keepClassDateParent) {
  const modal = document.getElementById("MODAL_NewAccountDetails");
  if (!modal) return;

  const dateInput = modal.querySelector('#details-date');
  const nameInput = modal.querySelector('#details-acc-name');
  const accNoInput = modal.querySelector('#details-acc-no');
  const refInput = modal.querySelector('#details-ref');
  const descInput = modal.querySelector('#details-desc');

  // Clear only requested controls
  if (nameInput) nameInput.value = "";
  if (accNoInput) accNoInput.value = "";
  if (refInput) refInput.value = "";
  if (descInput) descInput.value = "";

  // Keep class/date/parent unless asked to reset all
  if (!keepClassDateParent) {
    const classSelect = modal.querySelector('#details-acc-class');
    const typeSelect = modal.querySelector('#details-acc-type');
    if (classSelect) classSelect.value = "";
    if (typeSelect) typeSelect.value = "";
    if (dateInput) dateInput.value = "";
    state.parentPickedId = 0;
    setPickedParent(0);
  }
  state.editingId = null;
}
// js/chart-of-accounts.js

function initChartOfAccounts() {

  let isMainAccountMode = false;

  // ---------- State ----------
  const state = {
    items: [],
    mapById: new Map(),
    childrenByParent: new Map(),
    expanded: new Set(),      // ids expanded
    visibleIds: [],           // render order
    selectedId: null,
    query: "",
    editingId: null,          // If set, we are updating
    parentPickedId: 0,        // 0 = root
    targetClass: ""           // The class currently being created (e.g. "CLASS 1")
  };

  // ---------- Helpers ----------
  function formatMoney(n) {
    // FCFA style like screenshot: 610,295,172 FCFA
    const num = Number(n || 0);
    const sign = num < 0 ? "-" : "";
    const abs = Math.abs(num);
    const s = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return sign + s + " FCFA";
  }

  function hasChildren(id) {
    const kids = state.childrenByParent.get(id);
    return kids && kids.length > 0;
  }

  function buildIndex(items) {
    state.items = items.slice();
    state.mapById = new Map();
    state.childrenByParent = new Map();

    for (const it of state.items) {
      state.mapById.set(it.id, it);
      const p = (it.parentId === undefined || it.parentId === 0) ? null : it.parentId;
      if (!state.childrenByParent.has(p)) state.childrenByParent.set(p, []);
      state.childrenByParent.get(p).push(it.id);
    }

    // keep stable order: by code (numeric-ish) then name
    for (const [p, arr] of state.childrenByParent.entries()) {
      arr.sort((a, b) => {
        const A = state.mapById.get(a);
        const B = state.mapById.get(b);
        const na = parseInt(A.code, 10);
        const nb = parseInt(B.code, 10);
        if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
        return (A.name || "").localeCompare(B.name || "");
      });
    }

    // default: expand roots
    const roots = state.childrenByParent.get(null) || [];
    for (const rid of roots) state.expanded.add(rid);

    computeVisible();
  }

  function computeVisible() {
    const out = [];
    const roots = state.childrenByParent.get(null) || [];

    const q = (state.query || "").trim().toLowerCase();
    const filterOn = q.length > 0;

    function matches(it) {
      if (!filterOn) return true;
      const t = `${it.code} ${it.name} ${it.desc} ${it.className}`.toLowerCase();
      return t.includes(q);
    }

    // when filtering, we show only matching nodes + all their ancestors expanded
    const mustShow = new Set();
    const mustExpand = new Set();

    if (filterOn) {
      for (const it of state.items) {
        if (matches(it)) {
          mustShow.add(it.id);
          let p = it.parentId;
          while (p !== null && p !== undefined && p !== 0) {
            mustShow.add(p);
            mustExpand.add(p);
            const pit = state.mapById.get(p);
            p = pit ? pit.parentId : null;
          }
        }
      }
    }

    function walk(parentId, depth) {
      const kids = state.childrenByParent.get(parentId) || [];
      for (const id of kids) {
        const it = state.mapById.get(id);
        if (!it) continue;

        if (!filterOn || mustShow.has(id)) {
          out.push({ id, depth });
        }

        const expanded = filterOn ? mustExpand.has(id) : state.expanded.has(id);
        if (expanded) {
          walk(id, depth + 1);
        }
      }
    }

    walk(null, 0);

    state.visibleIds = out;
  }

  function render() {
    const tbody = document.getElementById("COA_TBODY");
    if (!tbody) return;

    tbody.innerHTML = "";

    for (const row of state.visibleIds) {
      const it = state.mapById.get(row.id);
      if (!it) continue;

      const tr = document.createElement("tr");
      tr.dataset.id = String(it.id);
      if (state.selectedId === it.id) tr.classList.add("selected");

      // Account Name cell
      const tdName = document.createElement("td");
      const wrap = document.createElement("div");
      wrap.className = "coa-name-cell";

      // indent spacer
      const indent = document.createElement("span");
      indent.className = "coa-indent";
      indent.style.width = (row.depth * 18) + "px";

      // toggle
      const toggle = document.createElement("span");
      toggle.className = "coa-toggle";
      if (!hasChildren(it.id)) toggle.classList.add("hidden");
      toggle.textContent = state.expanded.has(it.id) ? "▼" : "▶";
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleNode(it.id);
      });

      const folder = document.createElement("span");
      folder.className = "coa-folder";

      const code = document.createElement("span");
      code.className = "coa-code";
      code.textContent = it.code + " - ";

      const name = document.createElement("span");
      name.textContent = it.name;

      wrap.appendChild(indent);
      wrap.appendChild(toggle);
      wrap.appendChild(folder);
      wrap.appendChild(code);
      wrap.appendChild(name);

      tdName.appendChild(wrap);

      // Balance cell
      const tdBal = document.createElement("td");
      tdBal.className = "coa-balance";
      tdBal.textContent = formatMoney(it.balance || 0);

      // Desc
      const tdDesc = document.createElement("td");
      tdDesc.textContent = it.desc || "";

      // Class
      const tdClass = document.createElement("td");
      tdClass.textContent = it.className || "";

      tr.appendChild(tdName);
      tr.appendChild(tdBal);
      tr.appendChild(tdDesc);
      tr.appendChild(tdClass);

      // click select (single select)
      tr.addEventListener("click", () => {
        selectRow(it.id);
      });

      // right click context menu
      tr.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        selectRow(it.id);
        showContextMenu(e.clientX, e.clientY);
      });

      tbody.appendChild(tr);
    }
  }

  function selectRow(id) {
    state.selectedId = id;
    render();
    updateCopyLabel();
  }

  function toggleNode(id) {
    if (state.expanded.has(id)) state.expanded.delete(id);
    else state.expanded.add(id);
    computeVisible();
    render();
  }

  function expandAll() {
    for (const it of state.items) {
      if (hasChildren(it.id)) state.expanded.add(it.id);
    }
    computeVisible();
    render();
  }

  function collapseAll() {
    const search = document.getElementById("COA_SEARCH");
    if (search) search.value = "";
    state.query = "";
    state.expanded.clear();
    computeVisible();
    render();
  }

 function expandBranch(id) {
    // To ensure all children are displayed, we clear the search filter first.
    const search = document.getElementById("COA_SEARCH");
    if (search) search.value = "";
    state.query = "";

    // Expand id and all descendants
    function walk(nodeId) {
        state.expanded.add(nodeId);
        const kids = state.childrenByParent.get(nodeId) || [];
        for (const k of kids) walk(k);
    }
    walk(id);

    computeVisible();
    render();
  }

  // ---------- API Layer ----------
  async function loadAccountsFromApi() {
    // Ensure auth.js is loaded and apiFetch is available
    if (typeof apiFetch === 'undefined') {
      console.error("apiFetch is not defined. Make sure auth.js is loaded.");
      return;
    }

    const data = await apiFetch("/api/v1/chartOfAccounts/getAccountList?page=1&limit=5000", { method: "GET" });

    if (!data || !data.success) {
      console.log(data);
      showAlert((data && data.message) ? data.message : "Failed to load Chart of Accounts.", 'error');
      buildIndex([]);
      render();
      return;
    }

    // Map API data to internal format
    const items = (data.accounts || []).filter(a => a.status === true).map(a => {
      const pidRaw = (a.parentAccountId !== undefined) ? a.parentAccountId : a.mainAccountId;
      const parent = Number(pidRaw || 0);

      return {
        id: Number(a.accountId),
        parentId: parent > 0 ? parent : null,
        code: String(a.mainAccountCode || ""),
        name: String(a.accountName || ""),
        balance: Number(a.openingBalance || 0),
        desc: String(a.description || ""),
        className: "CLASS " + String(a.accountClassId || "") // Maps 1 -> "CLASS 1"
      };
    });

    buildIndex(items);
    render();
  }

  async function apiDeleteAccount(accountId) {
    return await apiFetch("/api/v1/chartOfAccounts/deleteAccount/" + accountId, { method: "DELETE" });
  }

  async function apiGetAccountById(accountId) {
    return await apiFetch("/api/v1/chartOfAccounts/getAccountByID/" + accountId, { method: "GET" });
  }

  function deleteSelected() {
    const id = state.selectedId;
    if (!id) return;

    const it = state.mapById.get(id);
    const label = it ? `${it.code} - ${it.name}` : "this row";

    // Use your global modal helper from app.js
    showConfirmModal({
      title: "Unapproved Transactions",
      message: `Are you sure you wish to delete "${label}"?`,
      okText: "Delete",
      cancelText: "Do not delete",
      onOk: () => {
        apiDeleteAccount(id).then(resp => {
          if (!resp || !resp.success) {
            showAlert((resp && resp.message) ? resp.message : "Delete failed.", 'error');
          } else {
            state.selectedId = null;
            loadAccountsFromApi();
            // Invalidate Account Picker cache
            if (window.AccountPicker) window.AccountPicker.data.loaded = false;
          }
        });
      }
    });
  }

  function updateCopyLabel() {
    const el = document.getElementById("COA_COPY_NAME");
    if (!el) return;
    const it = state.selectedId ? state.mapById.get(state.selectedId) : null;
    el.textContent = it ? `${it.code}-${it.name}` : "...";
  }

  function copySelectedName() {
    const it = state.selectedId ? state.mapById.get(state.selectedId) : null;
    if (!it) return;
    const text = `${it.code}-${it.name}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => { });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { }
      ta.remove();
    }
  }

  function exportCsv() {
    // Export current visible rows
    const rows = [];
    rows.push(["Account Name", "Account Balance", "Description", "Account Class"]);

    for (const r of state.visibleIds) {
      const it = state.mapById.get(r.id);
      if (!it) continue;
      const accountName = `${it.code}-${it.name}`;
      rows.push([accountName, formatMoney(it.balance || 0), it.desc || "", it.className || ""]);
    }

    const csv = rows.map(cols => cols.map(c => {
      const s = String(c).replace(/"/g, '""');
      return `"${s}"`;
    }).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chart-of-accounts.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ---------- Parent Picker (Tree + Search) ----------
  function getDescendants(rootId) {
    const out = new Set();
    const stack = [rootId];
    while (stack.length) {
      const id = stack.pop();
      const kids = state.childrenByParent.get(id) || [];
      for (const k of kids) {
        if (!out.has(k)) { out.add(k); stack.push(k); }
      }
    }
    return out;
  }

  function openParentPicker() {
    const editingId = state.editingId ? Number(state.editingId) : 0;
    const forbidden = editingId ? getDescendants(editingId) : new Set();
    if (editingId) forbidden.add(editingId);

    AccountPicker.open({
      title: "Select Parent Account",
      targetClasses: state.targetClass ? [state.targetClass] : [],
      forbiddenIds: forbidden,
      allowClear: false,
      parentSelectable: true, // Exception: When choosing a parent for a new account, we allow selecting parents
      onSelect: (account) => {
        setPickedParent(account ? account.id : 0);
      }
    });
  }

  function setPickedParent(id) {
    state.parentPickedId = id;
    const it = state.mapById.get(id);
    const display = document.getElementById("details-main-acc");
    const codeInput = document.getElementById("details-main-acc-no");

    if (display) display.value = it ? `${it.code} - ${it.name}` : "";
    if (codeInput) codeInput.value = it ? it.code : "";
  }

  // ---------- New Account Modal ----------
  function showNewAccountModal() {
    const modal = document.getElementById("MODAL_NewAccountClass");
    if (modal) {
      // Reset position before showing to ensure it's centered
      const modalBox = modal.querySelector('.coa-modal');
      if (modalBox) {
        modalBox.style.position = '';
        modalBox.style.top = '';
        modalBox.style.left = '';
      }

      // Reset state on show
      const continueBtn = modal.querySelector('.coa-continue-btn');
      if (continueBtn) continueBtn.disabled = true;

      const radios = modal.querySelectorAll('input[name="account_class"]');
      radios.forEach(r => r.checked = false);

      const descPanel = modal.querySelector('.coa-modal-desc');
      if (descPanel) {
        descPanel.innerHTML = 'Click an Account Type on the Left to see a description here';
        descPanel.style.textAlign = 'center';
        descPanel.style.justifyContent = 'center';
        descPanel.style.alignItems = 'center';
      }

      modal.style.display = "flex";
    }
  }

  function hideNewAccountModal() {
    const modal = document.getElementById("MODAL_NewAccountClass");
    if (modal) {
      modal.style.display = "none";
    }
  }

  function updateAccountTypeVisibility(modal) {
    const classSelect = modal.querySelector('#details-acc-class');
    const typeSelect = modal.querySelector('#details-acc-type');
    if (!classSelect || !typeSelect) return;

    const typeGroup = typeSelect.closest('.form-group');
    const val = classSelect.value;

    // Classes 4, 5, 8
    if (["CLASS 4", "CLASS 5", "CLASS 8"].includes(val)) {
      typeGroup.style.visibility = 'visible';
      typeSelect.value = modal.querySelector('#details-acc-type').value;
    } else {
      typeGroup.style.visibility = 'hidden';
      typeSelect.value = "0";
    }
  }

  function updateParentSelectionUI() {
    const modal = document.getElementById("MODAL_NewAccountDetails");
    if (!modal) return;

    const isMainCheckbox = modal.querySelector('#details-is-main');
    const mainAccInput = modal.querySelector('#details-main-acc');
    const mainAccNoInput = modal.querySelector('#details-main-acc-no');
    const mainAccNoGroup = mainAccNoInput ? mainAccNoInput.closest('.form-group') : null;

    if (!isMainCheckbox || !mainAccInput) return;

    const isSubAccount = isMainCheckbox.checked;
    mainAccInput.disabled = !isSubAccount;
    mainAccInput.style.opacity = isSubAccount ? '1' : '0.5';
    if (mainAccNoGroup) mainAccNoGroup.style.opacity = isSubAccount ? '1' : '0.5';
  }

  function showNewAccountDetailsModal(selectedClass) {
    const modal = document.getElementById("MODAL_NewAccountDetails");
    if (modal) {
      // Reset position before showing to ensure it's centered
      const modalBox = modal.querySelector('.coa-modal');
      if (modalBox) {
        modalBox.style.position = '';
        modalBox.style.top = '';
        modalBox.style.left = '';
      }

      // Pre-fill data
      state.targetClass = selectedClass; // Store class for picker filtering
      const classSelect = modal.querySelector('#details-acc-class');
      const typeSelect = modal.querySelector('#details-acc-type');
      if (classSelect) classSelect.value = selectedClass;
      if (typeSelect) typeSelect.value = modal.querySelector('#details-acc-type').value;



      state.editingId = null; // Reset editing state
      state.parentPickedId = 0;

      const dateInput = modal.querySelector('#details-date');
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }

      // Update visibility based on class
      updateAccountTypeVisibility(modal);

      // Update Main Account Group visibility
      const mainAccountGroup = modal.querySelector('.main-account-group');
      const mainAccNoGroup = modal.querySelector('#details-main-acc-no').closest('.form-group');
      const mainAccInput = modal.querySelector('#details-main-acc');
      const isMainCheckbox = modal.querySelector('#details-is-main');

      // Reset fields
      modal.querySelector('#details-acc-name').value = "";
      modal.querySelector('#details-acc-no').value = "";
      modal.querySelector('#details-ref').value = "";
      modal.querySelector('#details-desc').value = "";
      modal.querySelector('#details-acc-type').value = "";
      if (mainAccInput) mainAccInput.value = "";
      modal.querySelector('#details-main-acc-no').value = "";

      if (isMainCheckbox) isMainCheckbox.checked = false; // Unchecked by default

      if (mainAccountGroup) {
        if (isMainAccountMode) {
          // Mode: Create Main Account (Root) - No parent selection allowed
          mainAccountGroup.style.display = 'none';
          if (mainAccNoGroup) mainAccNoGroup.style.visibility = 'hidden';
        } else {
          // Mode: New Sub Account - Allow parent selection
          mainAccountGroup.style.display = 'flex';
          if (mainAccNoGroup) mainAccNoGroup.style.visibility = 'visible';
        }
      }

      updateParentSelectionUI();

      modal.style.display = "flex";
    }
  }

  function hideNewAccountDetailsModal() {
    const modal = document.getElementById("MODAL_NewAccountDetails");
    if (modal) {
      modal.style.display = "none";
    }
  }

  function initNewAccountModal() {
    const modal = document.getElementById("MODAL_NewAccountClass");
    if (!modal) return;

    const radios = modal.querySelectorAll('input[name="account_class"]');
    const descPanel = modal.querySelector('.coa-modal-desc');
    const continueBtn = modal.querySelector('.coa-continue-btn');

    const descriptions = {
      "CLASS 1": "<strong>CLASS 1 - Capital (Investment):</strong><br><br>Represents the net worth of the institution. This includes funds from owners, investors, and accumulated profits (retained earnings).",
      "CLASS 2": "<strong>CLASS 2 - Fixed Asset:</strong><br><br>Long-term assets that are not intended for sale and are used in operations, such as:<br><br>-Land<br>-Buildings<br>-Vehicles<br>-Equipment<br>-Others...",
      "CLASS 3": "<strong>CLASS 3 - Inventory:</strong><br><br>This track the stock of goods available for sale and its movements.<br><br>- Stock of raw materials<br>- Stock of finished goods<br>- Stock of Product in progress<br>- Others...",
      "CLASS 4": "<strong>CLASS 4 - Third Parties (Debtors & Creditors):</strong><br><br>Accounts for money owed to you (receivables from clients) and money you owe to others (payables to suppliers).",
      "CLASS 5": "<strong>CLASS 5 - Treasury (Cash & Bank):</strong><br><br>Create one for each account such as:<br><br>- Petty Cash<br>- Current Accounts<br>- Savings<br>- Others...",
      "CLASS 6": "<strong>CLASS 6 - Expenses of Ordinary Activities:</strong><br><br>Costs incurred during your normal day-to-day operations to generate revenue, such as:<br><br>- Rent<br>- Utilities<br>- Salaries<br>- Supplies<br>- Others...",
      "CLASS 7": "<strong>CLASS 7 - Revenue of Ordinary Activities:</strong><br><br>Income generated from the company's primary activities. This typically includes:<br><br>- Sales Revenue<br>- Service Revenue<br>- Other Operating Income",
      "CLASS 8": "<strong>CLASS 8 - Other Revenue OR Expenses:</strong><br><br>Income or expenses from activities outside the normal course of business, like:<br><br>- Interest Income<br>- Interest Expense<br>- Gains or losses on the sale of assets or interest income."
    };

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const selectedClass = radio.value;
        if (descriptions[selectedClass] && descPanel) {
          descPanel.innerHTML = descriptions[selectedClass];
          descPanel.style.textAlign = 'left';
          descPanel.style.justifyContent = 'flex-start';
          descPanel.style.alignItems = 'flex-start';
        }
        if (continueBtn) continueBtn.disabled = false;
      });
    });

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        const selectedRadio = modal.querySelector('input[name="account_class"]:checked');
        if (selectedRadio) {
          const selectedClass = selectedRadio.value;
          hideNewAccountModal();
          showNewAccountDetailsModal(selectedClass);
        }
      });
    }
  }

  function initNewAccountDetailsModal() {
    const modal = document.getElementById("MODAL_NewAccountDetails");
    if (!modal) return;

    const nameInput = modal.querySelector('#details-acc-name');
    const descInput = modal.querySelector('#details-desc');

    // Auto-fill description from account name in real-time
    if (nameInput && descInput) {
      nameInput.addEventListener('input', () => {
        descInput.value = nameInput.value;
      });
    }

    // Make the 'Main Account No' field non-editable
    const mainAccNoInput = modal.querySelector('#details-main-acc-no');
    if (mainAccNoInput) {
      mainAccNoInput.readOnly = true;
    }

    const classSelect = modal.querySelector('#details-acc-class');
    if (classSelect) {
      classSelect.addEventListener('change', () => {
        state.targetClass = classSelect.value; // Update target class if changed
        setPickedParent(0); // Clear parent selection when class changes
        updateAccountTypeVisibility(modal);
        updateParentSelectionUI();
      });
    }

    const isMainCheckbox = modal.querySelector('#details-is-main');
    const mainAccInput = modal.querySelector('#details-main-acc');

    if (isMainCheckbox) {
      isMainCheckbox.addEventListener('change', () => {
        updateParentSelectionUI();
        if (isMainCheckbox.checked) {
          openParentPicker();
        } else {
          setPickedParent(0);
        }
      });
    }

    // Wire up the input to open the picker
    if (mainAccInput) {
      mainAccInput.addEventListener('click', () => {
        if (!mainAccInput.disabled) openParentPicker();
      });
    }

    const btnValidate = modal.querySelector('.coa-validate-btn');
    if (btnValidate) {
      // Remove old listeners to prevent duplicates if init is called multiple times
      const newBtn = btnValidate.cloneNode(true);
      btnValidate.parentNode.replaceChild(newBtn, btnValidate);

      newBtn.addEventListener('click', async () => {
        const name = modal.querySelector('#details-acc-name').value;
        const code = modal.querySelector('#details-acc-no').value;
        const desc = modal.querySelector('#details-desc').value;
        const classVal = modal.querySelector('#details-acc-class').value;
        const accType = modal.querySelector('#details-acc-type').value;
        const dateVal = modal.querySelector('#details-date').value;
        const refVal = modal.querySelector('#details-ref').value;

        if (!name || !code) {
          showAlert("Account Name and Account No are required.", 'error');
          return;
        }

        // Determine Parent ID based on the Checkbox logic (Your requested logic)
        let parentId = 0;
        const cb = modal.querySelector('#details-is-main');
        if (cb && cb.checked) {
          // If checked, use the picked ID
          parentId = state.parentPickedId;
          // Validate that a parent has been selected
          if (!parentId || parentId === 0) {
            showAlert("Please select a main account if 'Sub-Account of a Main Account' is checked.", 'error');
            return;
          }
        }
        // If unchecked, parentId remains 0 (Root)

        // Convert "CLASS 1" -> 1
        let AccountClassId = 1;
        const m = classVal.match(/CLASS\s+(\d+)/i);
        if (m && m[1]) AccountClassId = parseInt(m[1], 10);

        if (!state.editingId) {
          // --- CREATE ---
          const payload = {
            accountName: name,
            mainAccountCode: code,
            AccountClassId: AccountClassId,
            AccountType: accType ? Number(accType) : 0,
            date: dateVal,
            ref: refVal,
            openingBalance: 0,
            description: desc,
            parentAccountId: parentId,
            status: true
          };

          const resp = await apiFetch("/api/v1/chartOfAccounts/addAccount", { method: "POST", body: payload });
          if (!resp || !resp.success) {
            showAlert((resp && resp.message) ? resp.message : "Failed to add account.", 'error');
            return;
          }
        } else {
          // --- UPDATE ---
          const payload = {
            accountId: state.editingId,
            accountName: name,
            mainAccountCode: code,
            AccountClassId: AccountClassId,
            AccountType: accType ? Number(accType) : 0,
            date: dateVal,
            ref: refVal,
            description: desc,
            parentAccountId: parentId
          };

          const resp = await apiFetch("/api/v1/chartOfAccounts/updateAccount", { method: "PUT", body: payload });
          if (!resp || !resp.success) {
            showAlert((resp && resp.message) ? resp.message : "Failed to update account.", 'error');
            return;
          }
        }

        await loadAccountsFromApi();
        // Invalidate Account Picker cache to reflect the new account
        if (window.AccountPicker) window.AccountPicker.data.loaded = false;
        if (parentId) state.expanded.add(parentId);
        
        if (state.editingId) {
          modal.querySelector('.coa-details-modal .coa-modal-header .coa-modal-title').textContent = "Update Account Details";
          hideNewAccountDetailsModal();
        } else {
          // Instead of hiding modal, reset fields but keep modal open
          resetDetailsModal(true);
        }
        // Optionally, show a success message or highlight
      });
    }
  }

  async function modifySelected() {
    const id = state.selectedId;
    if (!id) { showAlert("Please select an account first.", 'error'); return;}

    const resp = await apiGetAccountById(id);
    if (!resp || !resp.success || !resp.account) {
      showAlert("Failed to load account details.", 'error');
      return;
    }
    const a = resp.account;
    state.editingId = Number(a.accountId);

    const modal = document.getElementById("MODAL_NewAccountDetails");
    if (!modal) return;

    // Populate fields
    modal.querySelector('#details-acc-name').value = a.accountName || "";
    modal.querySelector('#details-acc-no').value = a.mainAccountCode || "";
    modal.querySelector('#details-ref').value = a.ref || "";
    modal.querySelector('#details-desc').value = a.description || "";
    modal.querySelector('#details-date').value = (a.date || new Date().toISOString().split('T')[0]);
    modal.querySelector('#details-acc-type').value = a.accountType || 0;

    const classVal = "CLASS " + (a.accountClassId || 1);
    
    const classSelect = modal.querySelector('#details-acc-class');
    if (classSelect) {
      classSelect.value = classVal;
      state.targetClass = classVal;
    }

    updateAccountTypeVisibility(modal);

    const parentId = (a.parentAccountId !== undefined) ? a.parentAccountId : a.mainAccountId;
    const pIdNum = Number(parentId || 0);

    const isMainCheckbox = modal.querySelector('#details-is-main');

    if (pIdNum > 0) {
      if (isMainCheckbox) isMainCheckbox.checked = true;
      setPickedParent(pIdNum);
    } else {
      if (isMainCheckbox) isMainCheckbox.checked = false;
      setPickedParent(0);
    }

    updateParentSelectionUI(); // Refresh UI state (opacity etc)
    modal.style.display = "flex";``
  }

  function makeModalDraggable(modal) {
    const header = modal.querySelector('.coa-modal-header');
    if (!header) return;

    let isDragging = false;
    let offsetX, offsetY;

    function onMouseDown(e) {
      // Only drag with left mouse button
      if (e.button !== 0) return;

      isDragging = true;

      // The modal is inside a flex container. To make it 'absolute', we need its current position.
      const rect = modal.getBoundingClientRect();

      // Set position to absolute to allow dragging
      modal.style.position = 'absolute';

      // Set initial top/left from the calculated position
      modal.style.top = `${rect.top}px`;
      modal.style.left = `${rect.left}px`;

      // Calculate offset of mouse from top-left of modal
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      // Prevent text selection while dragging
      e.preventDefault();
    }

    function onMouseMove(e) {
      if (!isDragging) return;

      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      // Constrain to viewport to prevent it from being dragged off-screen
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + modal.offsetWidth > vw) newLeft = vw - modal.offsetWidth;
      if (newTop + modal.offsetHeight > vh) newTop = vh - modal.offsetHeight;

      modal.style.left = `${newLeft}px`;
      modal.style.top = `${newTop}px`;
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    header.addEventListener('mousedown', onMouseDown);
  }

  // ---------- Context menu ----------
  function showContextMenu(x, y) {
    const menu = document.getElementById("COA_CONTEXT_MENU");
    if (!menu) return;

    updateCopyLabel();

    menu.style.display = "block";

    // keep inside viewport
    const pad = 6;
    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left + rect.width + pad > vw) left = vw - rect.width - pad;
    if (top + rect.height + pad > vh) top = vh - rect.height - pad;

    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function hideContextMenu() {
    const menu = document.getElementById("COA_CONTEXT_MENU");
    if (!menu) return;
    menu.style.display = "none";
  }

  function initContextMenu() {
    const menu = document.getElementById("COA_CONTEXT_MENU");
    if (!menu) return;

    menu.addEventListener("click", (e) => {
      const item = e.target.closest(".coa-menu-item");
      if (!item) return;
      const action = item.dataset.action;
      hideContextMenu();

      if (action === "new") {
        showNewAccountModal();
      } else if (action === "modify") {
        modifySelected();
      } else if (action === "delete") {
        deleteSelected();
      } else if (action === "expandBranch") {
        if (state.selectedId) expandBranch(state.selectedId);
      } else if (action === "copyName") {
        copySelectedName();
      } else if (action === "exportCsv") {
        exportCsv();
      } else if (action === "selectColumns") {
        alert("Select columns (we’ll add this modal after core screens).");
      } else if (action === "help") {
        alert("Help (AAF)");
      }
    });

    // Hide when clicking elsewhere
    document.addEventListener("click", () => hideContextMenu());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideContextMenu();
    });
    window.addEventListener("resize", () => hideContextMenu());
    window.addEventListener("scroll", () => hideContextMenu(), true);
  }

  // ---------- Wiring ----------
  function initToolbar() {
    const btnCollapse = document.getElementById("COA_BTN_COLLAPSE_ALL");
    const btnExpand = document.getElementById("COA_BTN_EXPAND_ALL");
    const btnDelete = document.getElementById("COA_BTN_DELETE");
    const btnNew = document.getElementById("COA_BTN_NEW");
    const btnModify = document.getElementById("COA_BTN_MODIFY");
    const btnMainAction = document.getElementById("COA_BTN_MAIN_ACTION");
    const btnClose = document.getElementById("COA_BTN_CLOSE");
    const search = document.getElementById("COA_SEARCH");

    // Using addEventListener is more robust than onclick
    if (btnCollapse) btnCollapse.addEventListener('click', collapseAll);
    if (btnExpand) btnExpand.addEventListener('click', expandAll);
    if (btnDelete) btnDelete.addEventListener('click', deleteSelected);

    if (btnNew) btnNew.addEventListener('click', () => {
      isMainAccountMode = false;
      showNewAccountModal();
    });
    if (btnMainAction) btnMainAction.addEventListener('click', () => {
      isMainAccountMode = true;
      showNewAccountModal();
    });
    if (btnModify) btnModify.addEventListener('click', () => modifySelected());
    if (btnClose) btnClose.addEventListener('click', () => loadScreen('home.html', btnClose));

    if (search) {
      search.addEventListener("input", () => { // This was already good
        state.query = search.value || "";
        computeVisible();
        render();
      });
    }
  }

  // Make hide function global for inline onclick
  window.hideNewAccountModal = hideNewAccountModal;
  window.hideNewAccountDetailsModal = hideNewAccountDetailsModal;

  // Main initialization logic for the screen, called by loadScreen()
  loadAccountsFromApi(); // Replaced sampleAccounts with API call
  computeVisible();
  render();
  initToolbar();
  initContextMenu();
  initNewAccountModal();
  initNewAccountDetailsModal();

  // Add draggable functionality to both modals
  const modal1 = document.getElementById('MODAL_NewAccountClass');
  const modal2 = document.getElementById('MODAL_NewAccountDetails');
  if (modal1) makeModalDraggable(modal1.querySelector('.coa-modal'));
  if (modal2) makeModalDraggable(modal2.querySelector('.coa-modal'));

  // Default select first visible row
  if (state.visibleIds.length > 0) {
    selectRow(state.visibleIds[0].id);
  }
}

// Auto-initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", initChartOfAccounts);
