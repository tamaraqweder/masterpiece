
/* Smart Queue - Visitor Live Queue */
/* Read-only demo queue */

const bookingSelect = document.getElementById("queue-booking-select");

const queueEmpty = document.getElementById("queue-empty");
const queueDashboard = document.getElementById("queue-dashboard");

const yourQueueNumber = document.getElementById("your-queue-number");
const nowServing = document.getElementById("now-serving");
const groupsAhead = document.getElementById("groups-ahead");

const queueStatus = document.getElementById("queue-status");
const progressTrack = document.getElementById("queue-progress-track");
const progressFill = document.getElementById("queue-progress-fill");
const progressPercent = document.getElementById("queue-progress-percent");

const queueMessage = document.getElementById("queue-update-message");

const bookingIdText = document.getElementById("queue-booking-id");
const visitDateText = document.getElementById("queue-visit-date");
const visitTimeText = document.getElementById("queue-visit-time");
const visitorsText = document.getElementById("queue-visitors");

const BOOKINGS_KEY = "smartQueueBookings";
const QUEUE_KEY = "smartQueueDemoQueues";

let selectedBooking = null;
let queueData = {};

// Load confirmed bookings
function loadBookings() {
    try {
        const bookings = JSON.parse(
            localStorage.getItem(BOOKINGS_KEY) || "[]"
        );

        if (!Array.isArray(bookings)) {
            return [];
        }

        return bookings.filter(
            booking => booking.status === "Confirmed"
        );

    } catch (error) {
        return [];
    }
}

// Load demo queue progress
function loadQueueData() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(QUEUE_KEY) || "{}"
        );

        if (
            saved &&
            typeof saved === "object" &&
            !Array.isArray(saved)
        ) {
            return saved;
        }

        return {};

    } catch (error) {
        return {};
    }
}

// Generate a consistent demo queue number
function getDemoQueueNumber(bookingId) {
    const text = String(bookingId);
    let total = 0;

    for (const character of text) {
        total += character.charCodeAt(0);
    }

    return 5 + (total % 21);
}

// Get queue information for booking
function getBookingQueue(booking) {
    const id = booking.id;

    if (!queueData[id]) {
        const position = getDemoQueueNumber(id);

        // Initial demo state
        queueData[id] = {
            position: position,
            serving: 1
        };
    }

    return queueData[id];
}

// Display queue
function renderQueue() {

    if (!selectedBooking) {
        queueEmpty.hidden = false;
        queueDashboard.hidden = true;
        return;
    }

    queueEmpty.hidden = true;
    queueDashboard.hidden = false;

    const queue = getBookingQueue(selectedBooking);

    const position = Number(queue.position);

    const serving = Math.min(
        position,
        Math.max(1, Number(queue.serving) || 1)
    );

    const ahead = Math.max(0, position - serving);

    const percentage = position <= 1
        ? 100
        : Math.round(
            ((serving - 1) / (position - 1)) * 100
        );

    // Statistics
    yourQueueNumber.textContent = position;
    nowServing.textContent = serving;
    groupsAhead.textContent = ahead;

    // Progress bar
    progressFill.style.width = percentage + "%";
    progressPercent.textContent = percentage + "%";

    progressTrack.setAttribute(
        "aria-valuenow",
        percentage
    );

    // Queue status
    if (ahead === 0) {

        queueStatus.textContent = "Your Turn";
        queueStatus.classList.add("ready");

        queueMessage.textContent =
            "It's your turn in this demo queue!";

    } else {

        queueStatus.textContent = "Waiting";
        queueStatus.classList.remove("ready");

        queueMessage.textContent =
            `${ahead} demo group(s) ahead of you.`;
    }

    // Visit details
    bookingIdText.textContent = selectedBooking.id;
    visitDateText.textContent = selectedBooking.date;
    visitTimeText.textContent = selectedBooking.time;

    visitorsText.textContent =
        selectedBooking.visitors + " visitor(s)";
}

// Fill booking dropdown
function initializeBookings() {

    const bookings = loadBookings();

    bookingSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a booking";

    bookingSelect.appendChild(placeholder);

    bookings.forEach(function (booking) {

        const option = document.createElement("option");

        option.value = booking.id;

        option.textContent =
            `${booking.id} — ${booking.date} — ${booking.time}`;

        bookingSelect.appendChild(option);
    });

    if (bookings.length > 0) {

        selectedBooking = bookings[bookings.length - 1];

        bookingSelect.value = selectedBooking.id;

    } else {
        selectedBooking = null;
    }

    renderQueue();
}

// Change selected booking
bookingSelect.addEventListener("change", function () {

    const bookings = loadBookings();

    selectedBooking = bookings.find(
        booking => booking.id === bookingSelect.value
    ) || null;

    renderQueue();
});

// Refresh display when returning to this tab
window.addEventListener("focus", function () {
    queueData = loadQueueData();
    initializeBookings();
});

// Start page
queueData = loadQueueData();
initializeBookings();
