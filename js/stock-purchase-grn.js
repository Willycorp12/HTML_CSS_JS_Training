/**
 * js/stock-purchase-grn.js
 * Behaviors and interactions for the Create Goods Received Note (GRN) screen.
 */

(function() {
    let grnItems = []; // State array containing { id, name, qty }

    /**
     * Renders the items in the GRN table, along with empty filler rows.
     */
    function renderGrnTable() {
        const tbody = document.getElementById("GRN_ITEMS_TBODY");
        if (!tbody) return;

        tbody.innerHTML = "";

        grnItems.forEach((item, idx) => {
            const tr = document.createElement("tr");
            tr.dataset.idx = idx;
            tr.dataset.id = item.id;
            
            // Re-use selection state if this row was selected
            if (item.selected) {
                tr.classList.add("selected");
            }

            tr.innerHTML = `
                <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                <td>${item.name}</td>
                <td style="text-align: right; padding: 0;">
                    <input type="number" class="grn-qty-input" value="${item.qty}" min="1" data-idx="${idx}" style="text-align: right; padding-right: 10px;">
                </td>
                <td style="text-align: center; padding: 2px 4px;">
                    <button class="wd-btn reject grn-delete-row-btn" data-idx="${idx}" style="font-size: 11px; padding: 3px 8px; cursor: pointer;">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Append empty rows to make it look like a standard Windev grid (at least 15 total rows)
        const minRows = 15;
        const currentCount = grnItems.length;
        if (currentCount < minRows) {
            for (let i = currentCount; i < minRows; i++) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="text-align: center;">&nbsp;</td>
                    <td></td>
                    <td></td>
                    <td></td>
                `;
                tbody.appendChild(tr);
            }
        }
    }

    /**
     * Initializes the Goods Received Note screen elements and state.
     */
    window.initStockPurchaseGrn = async function() {
        console.log("initStockPurchaseGrn: Initializing...");

        // 1. Ensure inventory items are loaded for autocomplete
        if (window.inventoryState && window.inventoryState.items.length === 0) {
            if (typeof fetchInventoryMetadata === 'function') {
                await fetchInventoryMetadata();
            }
            if (typeof fetchInventoryItems === 'function') {
                await fetchInventoryItems();
            }
        }

        // 2. Pre-populate default values (matches mockup)
        const dateInput = document.getElementById("GRN_Date");
        if (dateInput) {
            dateInput.value = "2026-06-13"; // Set mockup date
        }

        const refInput = document.getElementById("GRN_Ref");
        if (refInput) {
            refInput.value = "SupplierBills_20";
        }

        const descTextarea = document.getElementById("GRN_Description");
        if (descTextarea) {
            descTextarea.value = "Supplies Received from Procurement";
        }

        // 3. Start with an empty table (no pre-populated items)
        grnItems = [];

        renderGrnTable();

        // 4. Autocomplete Search behavior
        const searchInput = document.getElementById("GRN_ItemSearch");
        const suggestionsBox = document.getElementById("GRN_SearchSuggestions");

        if (searchInput && suggestionsBox) {
            searchInput.addEventListener("input", function() {
                const query = searchInput.value.trim().toLowerCase();
                if (!query) {
                    suggestionsBox.style.display = "none";
                    return;
                }

                if (!window.inventoryState || !window.inventoryState.items) {
                    return;
                }

                // Filter matching items
                const matches = window.inventoryState.items.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    (item.barcode && item.barcode.toLowerCase().includes(query))
                );

                if (matches.length === 0) {
                    suggestionsBox.innerHTML = `<div style="padding: 8px 12px; font-size: 13px; color: #888; text-align: center;">No items found</div>`;
                } else {
                    suggestionsBox.innerHTML = matches.map(item => `
                        <div class="search-result-item" data-id="${item.id}" data-name="${item.name}">
                            <strong style="color: #333;">${item.name}</strong> 
                            <span style="font-size: 11px; color: #666; margin-left: 8px;">(Qty: ${item.qty})</span>
                        </div>
                    `).join("");
                }
                suggestionsBox.style.display = "block";
            });

            // Handle clicking on an autocomplete suggestion
            suggestionsBox.addEventListener("click", function(e) {
                const itemEl = e.target.closest(".search-result-item");
                if (!itemEl) return;

                const itemId = parseInt(itemEl.dataset.id, 10);
                const itemName = itemEl.dataset.name;

                // Check if already in GRN list
                const existing = grnItems.find(it => it.id === itemId);
                if (existing) {
                    existing.qty += 1;
                } else {
                    // Add new row (no auto-selection)
                    grnItems.push({
                        id: itemId,
                        name: itemName,
                        qty: 1,
                        selected: false
                    });
                }

                searchInput.value = "";
                suggestionsBox.style.display = "none";
                renderGrnTable();
            });

            // Close suggestions when clicking outside
            document.addEventListener("click", function(e) {
                if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                    suggestionsBox.style.display = "none";
                }
            });
        }

        // 5. Table event delegation (Row selection, Quantity inputs, Delete buttons)
        const tbody = document.getElementById("GRN_ITEMS_TBODY");
        if (tbody) {
            // Click listener for row selection and deletes
            tbody.addEventListener("click", function(e) {
                const target = e.target;
                
                // If quantity input is clicked, just focus it
                if (target.classList.contains("grn-qty-input")) {
                    return;
                }

                // Delete button clicked
                const deleteBtn = target.closest(".grn-delete-row-btn");
                if (deleteBtn) {
                    const idx = parseInt(deleteBtn.dataset.idx, 10);
                    grnItems.splice(idx, 1);
                    renderGrnTable();
                    return;
                }

                // Row selection
                const tr = target.closest("tr");
                if (tr && tr.cells[0].textContent.trim() !== "") {
                    const idx = parseInt(tr.dataset.idx, 10);
                    
                    // Mark only clicked item as selected in state
                    grnItems.forEach((item, i) => {
                        item.selected = (i === idx);
                    });
                    
                    // Update classes on UI
                    tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
                    tr.classList.add("selected");
                }
            });

            // Change listener on quantity input to update the state
            tbody.addEventListener("input", function(e) {
                if (e.target.classList.contains("grn-qty-input")) {
                    const idx = parseInt(e.target.dataset.idx, 10);
                    let val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val < 1) {
                        val = 1;
                    }
                    grnItems[idx].qty = val;
                }
            });
            
            // Prevent Enter from causing issues
            tbody.addEventListener("keydown", function(e) {
                if (e.key === "Enter" && e.target.classList.contains("grn-qty-input")) {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        }

        // 6. Validate Button Event
        const validateBtn = document.getElementById("BTN_GRN_Validate");
        if (validateBtn) {
            // Replace Validate button clone to clear prior event bindings
            const newValidateBtn = validateBtn.cloneNode(true);
            validateBtn.parentNode.replaceChild(newValidateBtn, validateBtn);

            newValidateBtn.addEventListener("click", function() {
                const ref = document.getElementById("GRN_Ref").value.trim();
                const desc = document.getElementById("GRN_Description").value.trim();
                const dateVal = document.getElementById("GRN_Date").value;

                if (!ref) {
                    if (typeof showAlert === "function") {
                        showAlert("Please enter a Ref #.", "error");
                    } else {
                        alert("Please enter a Ref #.");
                    }
                    return;
                }

                if (!dateVal) {
                    if (typeof showAlert === "function") {
                        showAlert("Please select an Order Date.", "error");
                    } else {
                        alert("Please select an Order Date.");
                    }
                    return;
                }

                if (grnItems.length === 0) {
                    if (typeof showAlert === "function") {
                        showAlert("Please add at least one item to validate the Stock Entry.", "error");
                    } else {
                        alert("Please add at least one item to validate the Stock Entry.");
                    }
                    return;
                }

                // Log entry success, display confirmation notification, and reset form
                console.log("GRN Validated:", {
                    ref: ref,
                    date: dateVal,
                    description: desc,
                    items: grnItems
                });

                if (typeof showAlert === "function") {
                    showAlert("Stock entry validated successfully!", "success");
                } else {
                    alert("Stock entry validated successfully!");
                }

                // Reset state and redraw empty table
                grnItems = [];
                renderGrnTable();
                
                if (searchInput) searchInput.value = "";
                const dateInput = document.getElementById("GRN_Date");
                if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
                const refInput = document.getElementById("GRN_Ref");
                if (refInput) refInput.value = "SupplierBills_" + Math.floor(Math.random() * 100);
                const descInput = document.getElementById("GRN_Description");
                if (descInput) descInput.value = "";
            });
        }
    };
})();
