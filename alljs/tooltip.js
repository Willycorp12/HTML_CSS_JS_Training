// Custom tooltip for table cells with data-tooltip, with delay and only if mouse is still
(function() {
    let tooltipTimer = null;
    let lastTarget = null;
    let tooltip = null;
    let lastMouseX = 0, lastMouseY = 0;
    let stillTimer = null;
    const SHOW_DELAY = 200; // ms before showing tooltip
    const STILL_DELAY = 200; // ms mouse must be still before showing

    function showTooltip(td, e) {
        if (!td || !td.getAttribute('data-tooltip')) return;
        const [header, ...rest] = td.getAttribute('data-tooltip').split('\n');
        const content = rest.join('\n');
        tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.innerHTML = `<div class="tt-header">${header}</div>${content}`;
        document.body.appendChild(tooltip);
        moveTooltip(e);
    }

    function moveTooltip(e) {
        if (tooltip) {
            const pad = 12;
            let x = e.clientX + pad;
            let y = e.clientY + pad;
            // Prevent overflow
            const rect = tooltip.getBoundingClientRect();
            if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - pad;
            if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - pad;
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }
    }

    document.addEventListener('mousemove', function(e) {
        const td = e.target.closest('td');
        if (td !== lastTarget) {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
            if (tooltipTimer) {
                clearTimeout(tooltipTimer);
                tooltipTimer = null;
            }
            if (stillTimer) {
                clearTimeout(stillTimer);
                stillTimer = null;
            }
            lastTarget = td;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            if (td && td.getAttribute('data-tooltip')) {
                // Wait for mouse to be still for STILL_DELAY, then show after SHOW_DELAY
                stillTimer = setTimeout(() => {
                    tooltipTimer = setTimeout(() => {
                        showTooltip(td, e);
                    }, SHOW_DELAY);
                }, STILL_DELAY);
            }
        } else if (td && tooltip) {
            moveTooltip(e);
        } else if (td && td.getAttribute('data-tooltip')) {
            // If mouse moves, reset stillTimer and tooltipTimer
            if (Math.abs(e.clientX - lastMouseX) > 2 || Math.abs(e.clientY - lastMouseY) > 2) {
                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
                if (tooltipTimer) {
                    clearTimeout(tooltipTimer);
                    tooltipTimer = null;
                }
                if (stillTimer) {
                    clearTimeout(stillTimer);
                    stillTimer = null;
                }
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                stillTimer = setTimeout(() => {
                    tooltipTimer = setTimeout(() => {
                        showTooltip(td, e);
                    }, SHOW_DELAY);
                }, STILL_DELAY);
            }
        }
    });
    document.addEventListener('mouseout', function(e) {
        const td = e.target.closest('td');
        if (td && tooltip) {
            tooltip.remove();
            tooltip = null;
        }
        if (tooltipTimer) {
            clearTimeout(tooltipTimer);
            tooltipTimer = null;
        }
        if (stillTimer) {
            clearTimeout(stillTimer);
            stillTimer = null;
        }
        lastTarget = null;
    });
})();