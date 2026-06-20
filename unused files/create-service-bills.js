// Dynamically render the service bills table with editable Description and Amount columns
const billsData = [
  { no: 1, accountName: "Buildings", description: "Main Office", amount: 250000 },
  { no: 2, accountName: "Equipment", description: "Computers", amount: 120000 },
  { no: 3, accountName: "Supplies", description: "Stationery", amount: 30000 },
  // Add more rows as needed
];

function formatMoney(n) {
  return n.toLocaleString("fr-CM");
}

function renderServiceBillsTable() {
  const tbody = document.querySelector(".wd-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  let total = 0;
  billsData.forEach((row, idx) => {
    total += Number(row.amount) || 0;
    tbody.innerHTML += `
      <tr style="background:${idx % 2 === 0 ? '#f7e6e6' : 'inherit'};">
        <td>${row.no}</td>
        <td>${row.accountName}</td>
        <td><input type="text" value="${row.description}" class="desc-input" data-idx="${idx}" style="width:95%"></td>
        <td class="amount"><input type="number" value="${row.amount}" class="amt-input" data-idx="${idx}" style="width:90px; text-align:right"></td>
        <td><button class="wd-btn reject" onclick="deleteBillRow(${idx})">Delete</button></td>
      </tr>
    `;
  });
  tbody.innerHTML += `
    <tr>
      <td colspan="3" style="text-align:right;font-weight:bold;">TOTAL</td>
      <td class="amount">${formatMoney(total)}</td>
      <td></td>
    </tr>
  `;
  document.getElementById("bill").textContent = formatMoney(total) + " FCFA";
  document.getElementById("net").textContent = formatMoney(total) + " FCFA";
}

function deleteBillRow(idx) {
  billsData.splice(idx, 1);
  renderServiceBillsTable();
}

document.addEventListener("input", function(e) {
  if (e.target.classList.contains("desc-input")) {
    const idx = e.target.dataset.idx;
    billsData[idx].description = e.target.value;
  }
  if (e.target.classList.contains("amt-input")) {
    const idx = e.target.dataset.idx;
    billsData[idx].amount = Number(e.target.value) || 0;
    renderServiceBillsTable();
  }
});

document.addEventListener("DOMContentLoaded", renderServiceBillsTable);
