/* Vapelist menu editor helpers.
 * Load this file after the menu markup with:
 * <script src="script.js"></script>
 */
(function () {
    'use strict';

    const menu = document.querySelector('.menu-container');
    const status = document.getElementById('editor-status');

    if (!menu) return;

    function requiredPrompt(message, initialValue = '') {
        const value = window.prompt(message, initialValue);
        return value && value.trim() ? value.trim() : null;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>\'\"]/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[character]));
    }

    function setStatus(message) {
        if (status) status.textContent = message;
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
