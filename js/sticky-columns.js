/**
 * Dynamic Sticky Column Calculator
 * Automatically detects tables with .paylist-table and calculates left offsets
 * for columns marked with .sticky-col.
 */

function updateStickyColumns() {
    const tables = document.querySelectorAll('.paylist-table');

    tables.forEach(table => {
        const rows = Array.from(table.rows);
        if (rows.length === 0) return;

        const headerCells = Array.from(rows[0].cells); // Assume first row is header
        let accumulatedLeft = 0;
        let lastStickyIndex = -1;

        // 1. Calculate offsets based on headers
        // We store the calculated left position for each column index
        const columnOffsets = {};

        headerCells.forEach((th, index) => {
            if (th.classList.contains('sticky-col')) {
                columnOffsets[index] = accumulatedLeft;
                // Use getBoundingClientRect for sub-pixel precision
                accumulatedLeft += th.getBoundingClientRect().width;
                lastStickyIndex = index;
            }
        });

        // 2. Apply offsets to ALL rows (Header + Body)
        rows.forEach(row => {
            Array.from(row.cells).forEach((cell, index) => {
                // If this column index was determined to be sticky
                if (columnOffsets[index] !== undefined) {
                    cell.style.position = 'sticky';
                    cell.style.left = `${columnOffsets[index]}px`;
                    cell.classList.add('sticky-col'); // Ensure logic consistency
                    
                    // Apply shadow to the last sticky column for separation
                    if (index === lastStickyIndex) {
                        cell.style.boxShadow = '2px 0 5px rgba(0,0,0,0.1)';
                        cell.style.borderRight = '1px solid #ccc';
                    } else {
                        cell.style.boxShadow = 'none';
                        cell.style.borderRight = '';
                    }
                }
            });
        });
    });
}

// Run on load and resize to maintain correct offsets
window.addEventListener('load', updateStickyColumns);
window.addEventListener('resize', updateStickyColumns);

// Ensure it runs if the script is loaded after the DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    updateStickyColumns();
}