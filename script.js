/* Vapelist menu editor helpers.
 * Load this file after the menu markup with:
 * <script src="script.js"></script>
 */
(function () {
    'use strict';

    const EDIT_PIN = '0013';
    const STOCK_STORAGE_KEY = 'vapelist-stock-state-v1';
    const menu = document.querySelector('.menu-container');
    const editButton = document.getElementById('edit-menu-button');
    const toolbar = document.getElementById('editor-toolbar');
    const status = document.getElementById('editor-status');

    if (!menu) return;

    function requiredPrompt(message, initialValue = '') {
        const value = window.prompt(message, initialValue);
        return value && value.trim() ? value.trim() : null;
    }

    function setStatus(message) {
        if (status) status.textContent = message;
    }

    function requestEditAccess() {
        const enteredPin = window.prompt('Enter the PIN to edit brands and flavors:');
        if (enteredPin !== EDIT_PIN) {
            setStatus('Incorrect PIN. Edit mode was not enabled.');
            return false;
        }
        return true;
    }

    // Ask for the PIN only when Edit Menu is clicked, before the inline handler enables edit mode.
    document.addEventListener('click', (event) => {
        if (event.target.closest('#edit-menu-button') !== editButton) return;

        if (!document.body.classList.contains('editing') && !requestEditAccess()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    function escapeHtml(value) {
        return String(value).replace(/[&<>\'\"]/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[character]));
    }

    function getStockState() {
        try {
            return JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY) || '{}');
        } catch (error) {
            return {};
        }
    }

    function saveStockState() {
        const stockState = {};
        menu.querySelectorAll('.flavor-item').forEach((item) => {
            const brandName = item.closest('.brand-section')?.querySelector('.brand-title')?.textContent.trim();
            const flavorName = item.querySelector('.flavor-name')?.textContent.trim();
            if (!brandName || !flavorName) return;
            stockState[`${brandName}::${flavorName}`] = item.classList.contains('out-of-stock');
        });
        localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stockState));
    }

    function setAllStockStatus(outOfStock) {
        menu.querySelectorAll('.flavor-item').forEach((item) => {
            item.classList.toggle('out-of-stock', outOfStock);
        });
        saveStockState();
        setStatus(outOfStock ? 'All flavors marked out of stock.' : 'All flavors restored to in stock.');
    }

    function addStockControls() {
        if (!toolbar || toolbar.querySelector('.stock-controls')) return;

        const controls = document.createElement('span');
        controls.className = 'stock-controls';
        controls.hidden = true;
        controls.innerHTML = `
            <button class="secondary stock-control" data-stock-action="restore" type="button">Restore All In Stock</button>
            <button class="secondary stock-control" data-stock-action="sold-out" type="button">Mark All Sold Out</button>`;
        toolbar.insertBefore(controls, status);

        controls.addEventListener('click', (event) => {
            const button = event.target.closest('.stock-control');
            if (!button || !document.body.classList.contains('editing')) return;

            const markSoldOut = button.dataset.stockAction === 'sold-out';
            const message = markSoldOut
                ? 'Mark every flavor as out of stock?'
                : 'Restore every flavor to in stock?';
            if (!window.confirm(message)) return;

            setAllStockStatus(markSoldOut);
        });
    }

    function syncStockControlsVisibility() {
        const controls = toolbar?.querySelector('.stock-controls');
        if (controls) controls.hidden = !document.body.classList.contains('editing');
    }

    function renameBrand(section) {
        const title = section.querySelector('.brand-title');
        const meta = section.querySelector('.brand-meta');
        if (!title || !meta) return;

        const oldName = title.textContent.trim();
        const newName = requiredPrompt('Brand name:', oldName);
        if (!newName) return;

        const details = requiredPrompt('Brand details:', meta.textContent.trim());
        if (!details) return;

        title.textContent = newName;
        meta.textContent = details;
        saveStockState();
        setStatus(`Updated brand: ${newName}`);
    }

    function addFlavor(section) {
        const flavor = requiredPrompt('Flavor name:');
        if (!flavor) return;

        const list = section.querySelector('.flavor-list');
        if (!list) return;

        const item = document.createElement('li');
        item.className = 'flavor-item';
        item.innerHTML = `<span class="flavor-name">${escapeHtml(flavor)}</span><span class="status-dot"></span>`;
        list.appendChild(item);
        list.classList.add('is-expanded');
        list.style.setProperty('--flavor-list-height', `${list.scrollHeight}px`);
        saveStockState();
        setStatus(`Added flavor: ${flavor}`);
    }

    function deleteBrand(section) {
        const name = section.querySelector('.brand-title')?.textContent.trim() || 'this brand';
        if (!window.confirm(`Delete ${name}?`)) return;

        section.remove();
        saveStockState();
        setStatus(`Deleted brand: ${name}`);
    }

    menu.addEventListener('click', (event) => {
        const button = event.target.closest('.editor-button');
        if (!button) return;

        const section = button.closest('.brand-section');
        if (!section) return;

        if (button.classList.contains('rename-brand')) renameBrand(section);
        if (button.classList.contains('add-flavor')) addFlavor(section);
        if (button.classList.contains('delete-brand')) deleteBrand(section);
    });

    addStockControls();
    syncStockControlsVisibility();

    // The main editor toggle lives in index.html. Observe its class change so the
    // stock controls are only visible while the PIN-protected editing mode is active.
    new MutationObserver(syncStockControlsVisibility).observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
})();
