// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// The page's gallery container and the button the user clicks.
// In the HTML we use <div id="gallery"> as the main container.
const apodContainer = document.getElementById('gallery');
const getImageBtn = document.getElementById('getImageBtn');

// Function to fetch and display APOD data when button is clicked.
async function fetchAndDisplayAPOD() {
    // Clear any existing content and show a simple loading message.
    apodContainer.innerHTML = '';
    const loading = document.createElement('div');
    loading.className = 'loading';
    // Friendly message with emoji and ARIA so assistive tech announces status
    loading.textContent = '🔄 Loading space photos…';
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-live', 'polite');
    apodContainer.appendChild(loading);

    // Disable the button while fetching to prevent duplicate requests.
    if (getImageBtn) getImageBtn.disabled = true;

    try {
        const response = await fetch(apodData);
        const data = await response.json();

        // Clear loading state
        apodContainer.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            const msg = document.createElement('p');
            msg.textContent = 'No images available.';
            apodContainer.appendChild(msg);
            return;
        }

        // Create a card for each APOD item
        data.forEach(item => {
            const apodItem = document.createElement('div');
            apodItem.classList.add('apod-item');

            // Make the card keyboard-focusable and behave like a button for accessibility
            apodItem.tabIndex = 0;
            apodItem.setAttribute('role', 'button');

            // Store the raw data on the element so the modal can access it later.
            apodItem.dataset.title = item.title || '';
            apodItem.dataset.date = item.date || '';
            apodItem.dataset.explanation = item.explanation || '';
            apodItem.dataset.mediaType = item.media_type || '';
            apodItem.dataset.url = item.url || '';

            const title = document.createElement('h2');
            title.textContent = item.title;

            const date = document.createElement('p');
            date.textContent = `Date: ${item.date}`;

            let media = null;
            if (item.media_type === 'image') {
                media = document.createElement('img');
                media.src = item.url;
                media.alt = item.title;
                media.className = 'apod-image';
            } else if (item.media_type === 'video') {
                // Use an iframe for video. Some video URLs are already embeddable.
                media = document.createElement('iframe');
                media.src = item.url;
                media.width = '560';
                media.height = '315';
                media.frameBorder = '0';
                media.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                media.setAttribute('allowfullscreen', '');
                media.className = 'apod-video';
            }

            const explanation = document.createElement('p');
            explanation.textContent = item.explanation;

            apodItem.appendChild(title);
            apodItem.appendChild(date);
            if (media) apodItem.appendChild(media);
            apodItem.appendChild(explanation);

            apodContainer.appendChild(apodItem);

            // Open modal when a card is clicked
            apodItem.addEventListener('click', () => {
                openModal(apodItem.dataset);
            });

            // Support keyboard activation (Enter / Space)
            apodItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(apodItem.dataset);
                }
            });
        });
    } catch (error) {
        apodContainer.innerHTML = '';
        const errMsg = document.createElement('p');
        errMsg.textContent = 'Error fetching APOD data. Check the console for details.';
        apodContainer.appendChild(errMsg);
        console.error('Error fetching APOD data:', error);
    } finally {
        if (getImageBtn) getImageBtn.disabled = false;
    }
}

// Wire the button to the fetch function. If the button isn't found, do nothing.
if (getImageBtn) {
    getImageBtn.addEventListener('click', fetchAndDisplayAPOD);
}

// Modal behavior
const modal = document.getElementById('apod-modal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalCloseBtn = document.getElementById('modalCloseBtn');

let lastActiveElement = null;

function openModal(data) {
    if (!modal) return;
    // Remember where focus was so we can return it on close
    lastActiveElement = document.activeElement;

    // Clear previous
    modalMedia.innerHTML = '';
    modalTitle.textContent = data.title || '';
    modalDate.textContent = data.date ? `Date: ${data.date}` : '';
    modalExplanation.textContent = data.explanation || '';

    if (data.mediaType === 'image') {
        const img = document.createElement('img');
        img.src = data.url;
        img.alt = data.title || 'APOD image';
        modalMedia.appendChild(img);
    } else if (data.mediaType === 'video') {
        // Embed video in iframe if possible
        const iframe = document.createElement('iframe');
        iframe.src = data.url;
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        modalMedia.appendChild(iframe);
    } else {
        // Fallback: show link
        const link = document.createElement('a');
        link.href = data.url || '#';
        link.textContent = 'Open media';
        link.target = '_blank';
        modalMedia.appendChild(link);
    }

    modal.setAttribute('aria-hidden', 'false');
    // Move focus into the modal to the close button for keyboard users
    if (modalCloseBtn) modalCloseBtn.focus();
    // Add key listener to close on ESC
    document.addEventListener('keydown', escKeyHandler);
}

function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modalMedia.innerHTML = '';
    document.removeEventListener('keydown', escKeyHandler);
    // Return focus to the element that opened the modal
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
    }
}

function escKeyHandler(e) {
    if (e.key === 'Escape') closeModal();
}

// Close button
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

// Click outside modal content to close
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
            