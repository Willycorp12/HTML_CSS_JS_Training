/* js/inventory-adjust.js */

const INV_ADJ_SAMPLE_DATA = [
    { id: 1, name: "05A HP Toner", subCategory: "ALL STATIONERIES.", qty: 2 },
    { id: 2, name: "17A HP Toner", subCategory: "ALL STATIONERIES.", qty: 0 },
    { id: 3, name: "19A HP Toner", subCategory: "ALL STATIONERIES.", qty: 2 },
    { id: 4, name: "201 HP Toner blue", subCategory: "ALL STATIONERIES.", qty: 0 },
    { id: 5, name: "201 HP Toner pink", subCategory: "ALL STATIONERIES.", qty: 1 },
    { id: 6, name: "203 HP Toner", subCategory: "ALL STATIONERIES.", qty: 5 },
    { id: 7, name: "205HP Toner", subCategory: "ALL STATIONERIES.", qty: 2 },
    { id: 8, name: "410 HP Toner blue", subCategory: "ALL STATIONERIES.", qty: 0 },
    { id: 9, name: "410 HP Toner Yellow", subCategory: "ALL STATIONERIES.", qty: 0 },
    { id: 10, name: "90A HP Toner", subCategory: "ALL STATIONERIES.", qty: 6 },
    { id: 11, name: "A3 Envelop", subCategory: "ALL STATIONERIES.", qty: 106 },
    { id: 12, name: "A3 Paper", subCategory: "ALL STATIONERIES.", qty: 5 },
    { id: 13, name: "A4 Envelop", subCategory: "ALL STATIONERIES.", qty: 86 },
    { id: 14, name: "A5 Envelop", subCategory: "ALL STATIONERIES.", qty: 32 },
    { id: 15, name: "A6 Envelop", subCategory: "ALL STATIONERIES.", qty: 28 },
    { id: 16, name: "Belt files", subCategory: "ALL STATIONERIES.", qty: 0 },
    { id: 17, name: "Black Pens", subCategory: "ALL STATIONERIES.", qty: 0 },
    { id: 18, name: "Black Pens", subCategory: "ALL STATIONERIES.", qty: 16 },
    { id: 19, name: "Bold Markers", subCategory: "ALL STATIONERIES.", qty: 19 },
    { id: 20, name: "Box folders", subCategory: "ALL STATIONERIES.", qty: 100 }
];

window.initInventoryAdjust = function () {
    const dateInput = document.getElementById('INV_ADJ_Date');
    if (dateInput) {
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }

    const searchInput = document.getElementById('INV_ADJ_Search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterInvAdjTables();
        });
    }

    renderInvAdjTables(INV_ADJ_SAMPLE_DATA);
};

function renderInvAdjTables(data) {
    const tbodyLeft = document.getElementById('INV_ADJ_TBODY_Left');
    const tbodyRight = document.getElementById('INV_ADJ_TBODY_Right');
    if (!tbodyLeft || !tbodyRight) return;

    tbodyLeft.innerHTML = '';
    tbodyRight.innerHTML = '';

    data.forEach((item, index) => {
        // Left Table Row
        const trLeft = document.createElement('tr');
        trLeft.dataset.index = index;
        trLeft.innerHTML = `
            <td>${item.name}</td>
            <td>${item.subCategory}</td>
            <td style="text-align: center; font-weight: bold;">${item.qty}</td>
        `;

        // Right Table Row
        const trRight = document.createElement('tr');
        trRight.dataset.index = index;
        trRight.innerHTML = `
            <td><input type="number" value="0" min="0" /></td>
            <td><input type="number" value="0" min="0" /></td>
        `;

        // Sync Selection
        const syncSelection = () => {
            document.querySelectorAll('#INV_ADJ_TBODY_Left tr.selected, #INV_ADJ_TBODY_Right tr.selected')
                .forEach(r => r.classList.remove('selected'));
            trLeft.classList.add('selected');
            trRight.classList.add('selected');
        };

        trLeft.addEventListener('click', syncSelection);
        trRight.addEventListener('click', syncSelection);
        
        // Sync row heights
        trLeft.style.height = '32px';
        trRight.style.height = '32px';

        tbodyLeft.appendChild(trLeft);
        tbodyRight.appendChild(trRight);
    });
}

function filterInvAdjTables() {
    const search = (document.getElementById('INV_ADJ_Search')?.value || '').toLowerCase();
    const rowsLeft = document.querySelectorAll('#INV_ADJ_TBODY_Left tr');
    const rowsRight = document.querySelectorAll('#INV_ADJ_TBODY_Right tr');

    rowsLeft.forEach((rowLeft, index) => {
        const rowRight = rowsRight[index];
        if (!rowRight) return;

        const text = rowLeft.textContent.toLowerCase();
        const match = !search || text.includes(search);

        rowLeft.style.display = match ? '' : 'none';
        rowRight.style.display = match ? '' : 'none';
    });
}
