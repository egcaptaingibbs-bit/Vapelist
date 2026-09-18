/* Vapelist menu editor helpers.
 * Load this file after the menu markup with:
 * <script src="script.js"></script>
 */
(function () {
    'use strict';

    const EDIT_PIN = '0013';
    const menu = document.querySelector('.menu-container');
    const editButton = document.getElementById('edit-menu-button');
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
        // New flavors must use the same stock toggle as flavors loaded with the menu.
        item.addEventListener('click', () => item.classList.toggle('out-of-stock'));
        list.appendChild(item);
        list.classList.add('is-expanded');
        list.style.setProperty('--flavor-list-height', `${list.scrollHeight}px`);
        setStatus(`Added flavor: ${flavor}`);
    }

    function deleteBrand(section) {
        const name = section.querySelector('.brand-title')?.textContent.trim() || 'this brand';
        if (!window.confirm(`Delete ${name}?`)) return;

        section.remove();
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
})();
