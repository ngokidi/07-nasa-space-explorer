// ============================================================
// NASA Space Explorer — script.js
// ============================================================

// --- Config -------------------------------------------------
// Swap this for your own key from https://api.nasa.gov if you
// hit DEMO_KEY's rate limit (30 requests/hour, 50/day).
const NASA_API_KEY = 'BjafFcImvttsEweN56RSYeyL4FxDA6m81ggbHauG';
const APOD_URL = 'https://api.nasa.gov/planetary/apod';

// --- DOM references ------------------------------------------
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchBtn = document.getElementById('fetchBtn');
const gallery = document.getElementById('gallery');

const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalExplanation = document.getElementById('modalExplanation');

const factText = document.getElementById('factText');

// Set up the date pickers (logic lives in dateRange.js)
setupDateInputs(startInput, endInput);

// --- LevelUp: Random "Did You Know?" space fact ---------------
const SPACE_FACTS = [
  "A day on Venus is longer than its year — it takes 243 Earth days to rotate once, but only 225 to orbit the Sun.",
  "Neutron stars are so dense that a single teaspoon of their material would weigh about a billion tons.",
  "The footprints left on the Moon by Apollo astronauts will likely last millions of years — there's no wind to erode them.",
  "One million Earths could fit inside the Sun.",
  "Space is completely silent because there's no atmosphere for sound waves to travel through.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy — but it won't happen for about 4.5 billion years.",
  "Saturn could float in water because it's mostly made of gas and is less dense than water.",
  "There are more stars in the universe than grains of sand on every beach on Earth.",
  "The largest known star, UY Scuti, is so big that it would take a plane about 1,100 years to fly around it once.",
  "Astronauts can grow up to 2 inches taller in space because there's no gravity compressing their spine.",
  "The Sun accounts for 99.8% of the total mass in our solar system.",
  "A full NASA space suit costs about $12 million, most of which is the backpack and control module."
];

function showRandomFact() {
  const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
  factText.textContent = fact;
}
showRandomFact();

// --- Gallery fetching -----------------------------------------
fetchBtn.addEventListener('click', fetchSpaceImages);

async function fetchSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    renderMessage('Please choose both a start and end date.', 'error');
    return;
  }

  // Show loading message while we wait on NASA's servers
  renderMessage('🔄 Loading space photos…', 'loading');

  const url = `${APOD_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API responded with status ${response.status}`);
    }

    let data = await response.json();

    // The API returns a single object (not an array) if start/end
    // resolve to the same single day — normalize to an array either way.
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Show most recent first
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderGallery(data);
  } catch (err) {
    console.error('Failed to fetch APOD data:', err);
    renderMessage('Something went wrong fetching images from NASA. Please try again in a moment.', 'error');
  }
}

// --- Rendering --------------------------------------------------
function renderMessage(text, type) {
  gallery.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = type; // "loading" or "error"

  if (type === 'loading') {
    wrapper.innerHTML = `<span class="loading-icon">🔄</span><p>${text}</p>`;
  } else {
    wrapper.textContent = text;
  }

  gallery.appendChild(wrapper);
}

function renderGallery(items) {
  gallery.innerHTML = '';

  if (items.length === 0) {
    renderMessage('No images found for that date range.', 'error');
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${item.title}`);

    // LevelUp: handle video entries (media_type is "image" or "video")
    const mediaFrame = document.createElement('div');
    mediaFrame.className = 'media-frame';

    if (item.media_type === 'image') {
      mediaFrame.innerHTML = `<img src="${item.url}" alt="${item.title}" loading="lazy" />`;
    } else if (item.media_type === 'video') {
      const thumb = item.thumbnail_url || '';
      mediaFrame.innerHTML = thumb
        ? `<img src="${thumb}" alt="${item.title}" loading="lazy" />`
        : `<img src="img/nasa-worm-logo.png" alt="Video entry placeholder" loading="lazy" />`;
      mediaFrame.innerHTML += `<span class="video-badge">▶ Video</span>`;
    }

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <span class="card-date">${item.date}</span>
      <span class="card-title">${item.title}</span>
    `;

    card.appendChild(mediaFrame);
    card.appendChild(body);

    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(item);
      }
    });

    gallery.appendChild(card);
  });
}

// --- Modal --------------------------------------------------
function openModal(item) {
  modalDate.textContent = item.date;
  modalTitle.textContent = item.title;
  modalExplanation.textContent = item.explanation;

  if (item.media_type === 'image') {
    const src = item.hdurl || item.url;
    modalMedia.innerHTML = `<img src="${src}" alt="${item.title}" />`;
  } else if (item.media_type === 'video') {
    // Try to embed if it's a YouTube link, otherwise give a clear link out
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      modalMedia.innerHTML = `<iframe src="${item.url}" title="${item.title}" allowfullscreen></iframe>`;
    } else {
      modalMedia.innerHTML = `
        <div class="video-fallback">
          <p>This entry is a video that can't be embedded directly.</p>
          <p><a href="${item.url}" target="_blank" rel="noopener noreferrer">Watch it here &rarr;</a></p>
        </div>
      `;
    }
  }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modal.hidden = true;
  modalMedia.innerHTML = ''; // stop any playing video
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});