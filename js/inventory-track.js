/* js/inventory-track.js */

const INV_TRACK_ITEMS_DATA = [
    { id: 1, name: "05A HP Toner", subCategory: "ALL STATIONERIES." },
    { id: 2, name: "17A HP Toner", subCategory: "ALL STATIONERIES." },
    { id: 3, name: "19A HP Toner", subCategory: "ALL STATIONERIES." },
    { id: 4, name: "90A HP Toner", subCategory: "ALL STATIONERIES." },
    { id: 5, name: "A3 Envelop", subCategory: "ALL STATIONERIES." },
    { id: 6, name: "A3 Paper", subCategory: "ALL STATIONERIES." }
];

const INV_TRACK_DETAILS_DATA = {
    1: [ // Details for 05A HP Toner
        { date: "6/13/2026", time: "14:39", user: "Admin", desc: "05A HP Toner collected by Wilfred for the IT", ob: "", entry: "", exit: "" },
        { date: "6/13/2026", time: "16:12", user: "Admin", desc: "Entry of new stock", ob: "", entry: 1, exit: "" },
        { date: "6/13/2026", time: "16:17", user: "Admin", desc: "Entry of new stock", ob: "", entry: 1, exit: "" },
        { date: "6/13/2026", time: "16:18", user: "Admin", desc: "Entry of new stock", ob: "", entry: 1, exit: "" }
    ]
};

window.initInventoryTrack = function () {
    // Init Dates
    const fromDate = document.getElementById('INV_TRACK_FromDate');
    const toDate = document.getElementById('INV_TRACK_ToDate');
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (fromDate) fromDate.value = firstDay.toISOString().split('T')[0];
    if (toDate) toDate.value = today.toISOString().split('T')[0];

    // Search input listeners
    const searchName = document.getElementById('INV_TRACK_SearchName');
    if (searchName) {
        searchName.addEventListener('input', function () {
            filterInvTrackItems();
        });
    }

    renderInvTrackItems(INV_TRACK_ITEMS_DATA);
};

function renderInvTrackItems(data) {
    const tbody = document.getElementById('INV_TRACK_ITEMS_TBODY');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id;
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.subCategory}</td>
        `;

        tr.addEventListener('click', function () {
            document.querySelectorAll('#INV_TRACK_ITEMS_TBODY tr.selected').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
            
            document.getElementById('INV_TRACK_SelectedItem').textContent = item.name;
            renderInvTrackDetails(item.id);
        });

        tbody.appendChild(tr);
    });

    // Auto-select first item if exists
    if (data.length > 0) {
        const firstRow = tbody.querySelector('tr');
        if (firstRow) firstRow.click();
    }
}

function filterInvTrackItems() {
    const search = (document.getElementById('INV_TRACK_SearchName')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#INV_TRACK_ITEMS_TBODY tr');

    rows.forEach(row => {
        const nameCell = row.cells[0].textContent.toLowerCase();
        row.style.display = (!search || nameCell.includes(search)) ? '' : 'none';
    });
}

function renderInvTrackDetails(itemId) {
    const tbody = document.getElementById('INV_TRACK_DETAILS_TBODY');
    if (!tbody) return;
    tbody.innerHTML = '';

    const details = INV_TRACK_DETAILS_DATA[itemId] || [];
    let sumEntry = 0;
    let sumExit = 0;
    let sumOB = 0;

    if (details.length === 0) {
        // empty rows for visual structure
        for(let i=0; i<5; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td>`;
            tbody.appendChild(tr);
        }
    } else {
        details.forEach(d => {
            const entryVal = parseInt(d.entry) || 0;
            const exitVal = parseInt(d.exit) || 0;
            const obVal = parseInt(d.ob) || 0;
            
            sumEntry += entryVal;
            sumExit += exitVal;
            sumOB += obVal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${d.date}</td>
                <td>${d.time}</td>
                <td>${d.user}</td>
                <td>${d.desc}</td>
                <td style="text-align: center;">${d.ob}</td>
                <td style="text-align: center;">${d.entry}</td>
                <td style="text-align: center;">${d.exit}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Update Footer Sums
    document.getElementById('INV_TRACK_SumOB').textContent = sumOB || '';
    document.getElementById('INV_TRACK_SumEntry').textContent = sumEntry || '';
    document.getElementById('INV_TRACK_SumExit').textContent = sumExit || '';

    // Update Current Balance
    const currentBalance = (sumOB + sumEntry - sumExit).toFixed(2);
    document.getElementById('INV_TRACK_CurrentBalance').value = currentBalance + ' Units';
    // For visual match with image logic
    document.getElementById('INV_TRACK_BalanceBF').value = sumOB.toFixed(2) + ' Units';
}
