// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Date inputs
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");

// Setup default date range
setupDateInputs(startInput, endInput);

// Elements
const gallery = document.getElementById("gallery");
const button = document.getElementById("loadImagesBtn");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");
const closeModal = document.getElementById("closeModal");

// NASA API Key
const apiKey = "YOUR_API_KEY";

// Random Space Facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "The Sun contains 99.86% of the mass in our solar system.",
  "One million Earths could fit inside the Sun.",
  "Neutron stars can spin at 600 rotations per second.",
  "The footprints left on the Moon may last millions of years.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Jupiter has over 90 known moons.",
  "Saturn could float in water because it is less dense than water."
];

// Display random fact
const factSection = document.getElementById("spaceFact");

factSection.innerHTML = `
  <h3>🚀 Did You Know?</h3>
  <p>${spaceFacts[Math.floor(Math.random() * spaceFacts.length)]}</p>
`;

// Button click
button.addEventListener("click", getSpaceImages);

// Main function
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  gallery.innerHTML = `
    <div class="placeholder">
      <p>🔄 Loading space photos...</p>
    </div>
  `;

  try {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`
    );

    const data = await response.json();

    gallery.innerHTML = "";

    // Most recent first
    data.reverse();

    data.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("gallery-item");

      // IMAGE ENTRY
      if (item.media_type === "image") {
        card.innerHTML = `
          ${item.url}
          <h3>${item.title}</h3>
          <p>${formatDate(item.date)}</p>
        `;

        card.addEventListener("click", () => {
          openModal(item);
        });
      }

      // VIDEO ENTRY (Extra Credit)
      else if (item.media_type === "video") {
        card.innerHTML = `
          <div class="video-card">
            <h3>${item.title}</h3>
            <p>${formatDate(item.date)}</p>

            <p>
              🎥 This APOD entry is a video.
            </p>

            ${item.url}
              Watch Video
            </a>
          </div>
        `;
      }

      gallery.appendChild(card);
    });
  } catch (error) {
    console.error(error);

    gallery.innerHTML = `
      <div class="placeholder">
        <p>❌ Unable to load NASA images.</p>
      </div>
    `;
  }
}

// Open Modal
function openModal(item) {
  modal.style.display = "flex";

  modalImage.src = item.hdurl || item.url;
  modalTitle.textContent = item.title;
  modalDate.textContent = formatDate(item.date);
  modalExplanation.textContent = item.explanation;
}

// Close Modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close if user clicks outside modal
window.addEventListener("click", event => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Format Date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}