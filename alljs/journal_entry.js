/* ===== JOURNAL ENTRY DATA & FUNCTIONS ===== */

// Global data for journal entries, so it can be modified by event handlers
let journalEntriesData = [];

function renderJournalEntries() {
    const tbody = document.querySelector('#TABLE_JournalEntries tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const MIN_ROWS = 7;

    journalEntriesData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.style.background = (idx % 2 === 0) ? '#f7e6e6' : 'inherit';

        tr.innerHTML = `
            <td>${row.accountName}</td>
            <td contenteditable="true" class="desc-cell" data-idx="${idx}">${row.description}</td>
            <td contenteditable="true" class="amount amt-cell" data-idx="${idx}">${row.amount}</td>
            <td contenteditable="true" class="amount amt-cell2" data-idx="${idx}">${row.amount2}</td>
            <td style="padding: 0%;"><button class="wd-btn reject" onclick="deleteJournalEntryRow(${idx})" style="width: 100%; height: 100%;">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Add empty rows to reach MIN_ROWS
    for (let i = journalEntriesData.length; i < MIN_ROWS; i++) {
        const tr = document.createElement('tr');
        // Height matches a normal row's padding and line-height
        tr.innerHTML = `<td colspan="5" style="height: 31px;">&nbsp;</td>`;
        tbody.appendChild(tr);
    }
    
    // Calculate totals
    updateJournalEntriesTotals();
}

function updateJournalEntriesTotals() {
    let total = 0;
    journalEntriesData.forEach(row => {
        total += Number(row.amount) || 0;
    });

    // Update the Total Cell in the table footer
    const totalCell = document.getElementById('CELL_JournalEntries_Total');
    if (totalCell) {
        totalCell.textContent = total.toLocaleString('en-US');
    }

    let total2 = 0;
    journalEntriesData.forEach(row => {
        total2 += Number(row.amount2) || 0;
    });

    // Update the Total Cell in the table footer
    const totalCell2 = document.getElementById('CELL_JournalEntries_Total2');
    if (totalCell2) {
        totalCell2.textContent = total2.toLocaleString('en-US');
    }
}

function deleteJournalEntryRow(idx) {
    journalEntriesData.splice(idx, 1);
    renderJournalEntries(); // Re-render to update rows and totals
}

/* Called AFTER screen loads */
function initCreateJournalEntries() {
    // Reset data on each load
    journalEntriesData = [];
    
    // --- 2. Account Search Logic ---
    const searchInput = document.getElementById('EDT_GlobalSearch');
    const searchResultsContainer = document.getElementById('account-search-results');
    
    const addAccountToBill = (accountId) => {
        const account = chartOfAccountsData.find(a => a.id === accountId);
        // Prevent adding duplicates
        if (account && !journalEntriesData.some(b => b.accountName === account.name)) {
            journalEntriesData.push({
                accountName: account.name,
                description: account.name, // User can fill this in
                amount: 0,
                amount2: 0
            });
            renderJournalEntries();
        }
        searchInput.value = '';
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.style.display = 'none';
    };

    if (searchInput && searchResultsContainer) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (!query) {
                searchResultsContainer.innerHTML = '';
                searchResultsContainer.style.display = 'none';
                return;
            }

            const results = chartOfAccountsData.filter(acc => 
                acc.name.toLowerCase().includes(query) || acc.code.includes(query)
            );

            searchResultsContainer.innerHTML = '';
            if (results.length > 0) {
                results.forEach(acc => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `<span class="code">${acc.code}</span><span class="name">${acc.name}</span>`;
                    item.addEventListener('click', () => addAccountToBill(acc.id));
                    searchResultsContainer.appendChild(item);
                });
                searchResultsContainer.style.display = 'block';
            } else {
                searchResultsContainer.style.display = 'none';
            }
        });

        // Hide results when clicking away from the search area
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                searchResultsContainer.style.display = 'none';
            }
        });
    }

    // --- 3. Initial Table Render ---
    renderJournalEntries();

    // --- 4. Table Interactivity (ContentEditable, Delete) ---
    const table = document.getElementById('TABLE_JournalEntries');
    if (table) {
        table.addEventListener('input', (e) => {
            const idx = e.target.dataset.idx;
            if (idx === undefined) return;

            if (e.target.classList.contains("desc-cell")) {
                journalEntriesData[idx].description = e.target.innerText;
            }
            if (e.target.classList.contains("amt-cell")) {
                const cleanVal = e.target.innerText.replace(/[^0-9.-]/g, '');
                journalEntriesData[idx].amount = Number(cleanVal) || 0;
                updateJournalEntriesTotals(); // Only recalculate totals, don't re-render the whole table
            }   
            if (e.target.classList.contains("amt-cell2")) {
                const cleanVal = e.target.innerText.replace(/[^0-9.-]/g, '');
                journalEntriesData[idx].amount2 = Number(cleanVal) || 0;
                updateJournalEntriesTotals(); // Only recalculate totals, don't re-render the whole table
            }
        });
        
        // Prevent "Enter" from creating a new line in editable cells
        table.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
    }
}
/* ===== END JOURNAL ENTRY DATA & FUNCTIONS ===== */