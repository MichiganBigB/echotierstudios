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

const artworkViewer = document.querySelector('#artwork-viewer');
if (artworkViewer && typeof artworkViewer.showModal === 'function') {
    const galleryLinks = [...document.querySelectorAll('.gallery-link')];
    const viewerImage = document.querySelector('#artwork-image');
    const viewerCaption = document.querySelector('#artwork-caption');
    let selectedArtwork = 0;
    let artworkTrigger = null;

    const showArtwork = index => {
        selectedArtwork = (index + galleryLinks.length) % galleryLinks.length;
        const link = galleryLinks[selectedArtwork];
        viewerImage.src = link.href;
        viewerImage.alt = link.dataset.caption;
        viewerCaption.textContent = `${link.dataset.caption} · ${selectedArtwork + 1} of ${galleryLinks.length}`;
    };

    galleryLinks.forEach((link, index) => {
        link.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            artworkTrigger = link;
            showArtwork(index);
            artworkViewer.showModal();
            document.documentElement.classList.add('artwork-is-open');
        });
    });
    document.querySelector('#artwork-close').addEventListener('click', () => artworkViewer.close());
    document.querySelector('#artwork-previous').addEventListener('click', () => showArtwork(selectedArtwork - 1));
    document.querySelector('#artwork-next').addEventListener('click', () => showArtwork(selectedArtwork + 1));
    artworkViewer.addEventListener('close', () => {
        document.documentElement.classList.remove('artwork-is-open');
        viewerImage.removeAttribute('src');
        if (artworkTrigger) artworkTrigger.focus();
    });
    artworkViewer.addEventListener('click', event => {
        if (event.target === artworkViewer) artworkViewer.close();
    });
    artworkViewer.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showArtwork(selectedArtwork + 1);
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showArtwork(selectedArtwork - 1);
        }
    });
}
