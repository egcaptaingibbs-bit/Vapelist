/* Vapelist menu editor helpers.
 * Load this file after the menu markup with:
 * <script src="script.js"></script>
 */
(function () {
    'use strict';

    const EDIT_PIN = '0013';
    const menu = document.querySelector('.menu-container');
    const toolbar = document.getElementById('editor-toolbar');
    const editButton = document.getElementById('edit-menu-button');
    const status = document.getElementById('editor-status');
    let editAuthorised = false;

    if (!menu) return;

    function requiredPrompt(message, initialValue = '') {
        const value = window.prompt(message, initialValue);
        return value && value.trim() ? value.trim() : null;
    }

    function requestEditAccess() {
        const enteredPin = window.prompt('Enter the PIN to edit brands and flavors:');
        if (enteredPin !== EDIT_PIN) {
            if (status) status.textContent = 'Incorrect PIN. Edit mode was not enabled.';
            return false;
        }
        editAuthorised = true;
        return true;
    }

    function setStatus(message) {
        if (status) status.textContent = message;
    }

    // Capture the edit button before the page's inline handler can enable edit mode.
    document.addEventListener('click', (event) => {
        if (event.target.closest('#edit-menu-button') !== editButton) return;

        if (!document.body.classList.contains('editing')) {
            if (!requestEditAccess()) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        } else {
            editAuthorised = false;
        }
    }, true);

    // Protect every brand/flavor editing action, including actions added by the inline menu code.
    document.addEventListener('click', (event) => {
        const editingAction = event.target.closest('#add-brand-button, #save-menu-button, #reset-menu-button, .editor-button, .flavor-item');
        if (!editingAction || editAuthorised) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        setStatus('Enter the PIN by selecting Edit Menu before making changes.');
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
