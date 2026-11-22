'use strict';

document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
if (menuButton && navigation) {
    menuButton.hidden = false;
    const closeMenu = () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menu';
        navigation.classList.remove('is-open');
    };
    menuButton.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        menuButton.textContent = isOpen ? 'Menu' : 'Close';
        navigation.classList.toggle('is-open', !isOpen);
    });
    navigation.addEventListener('click', event => {
        if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            menuButton.focus();
        }
    });
}

const songSearch = document.querySelector('#song-search');
if (songSearch) {
    const songs = [...document.querySelectorAll('#catalog-list li')];
    const status = document.querySelector('#catalog-status');
    songSearch.addEventListener('input', () => {
        const query = songSearch.value.trim().toLocaleLowerCase();
        let matches = 0;
        for (const song of songs) {
            song.hidden = !song.textContent.toLocaleLowerCase().includes(query);
            if (!song.hidden) matches += 1;
        }
        status.textContent = `${matches} ${matches === 1 ? 'title' : 'titles'} found.`;
    });
}

const entryForm = document.querySelector('#entry-form');
if (entryForm) {
    entryForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!entryForm.reportValidity()) return;
        const data = new FormData(entryForm);
        const workLink = new URL(data.get('link'));
        const status = document.querySelector('#entry-status');
        if (!['http:', 'https:'].includes(workLink.protocol)) {
            status.textContent = 'Use an http or https public work link.';
            document.querySelector('#entry-link').focus();
            return;
        }
        const draft = [
            'D.I.G.I. ENTRY DRAFT',
            'Prepared locally. This file has not been submitted to ETS.',
            '',
            `Title: ${data.get('title')}`,
            `Creator name(s): ${data.get('creator')}`,
            `Category: ${data.get('category')}`,
            `Public link: ${data.get('link')}`,
            '',
            'D.I.G.I. statement',
            data.get('process'),
            '',
            'Prompts and iteration notes',
            data.get('prompts') || 'Not provided'
        ].join('\n');
        const downloadUrl = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }));
        const download = document.createElement('a');
        download.href = downloadUrl;
        download.download = 'digi-entry-draft.txt';
        document.body.append(download);
        download.click();
        download.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        status.textContent = 'Draft download started. Your entry has not been submitted.';
    });
}
