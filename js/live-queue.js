
/* =========================================
   Smart Queue - Visitor Live Queue
   Read-only queue linked to Staff Dashboard
========================================= */

/* Elements */

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

/* Storage Keys */

const BOOKINGS_KEY = "smartQueueBookings";
const QUEUE_KEY = "smartQueueDemoQueues";

/* State */

let selectedBookingId = "";
let queueData = {};

/* =========================================
   Load Bookings
========================================= */

function loadBookings() {
    try {
        const bookings = JSON.parse(
            localStorage.getItem(BOOKINGS_KEY) || "[]"
        );

        if (!Array.isArray(bookings)) {
            return [];
        }

        // Show confirmed and checked-in bookings
        return bookings.filter(function (booking) {
            return (
                booking.status === "Confirmed" ||
                booking.status === "Checked In"
            );
        });

    } catch (error) {
        return [];
    }
}

/* =========================================
   Load Queue Data
========================================= */

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

/* =========================================
   Demo Queue Number
========================================= */

// Same formula used by Staff Dashboard

function getDemoQueueNumber(bookingId) {
    let total = 0;

    for (const character of String(bookingId)) {
        total += character.charCodeAt(0);
    }

    return 5 + (total % 21);
}

/* =========================================
   Get Booking Queue
========================================= */

function getBookingQueue(booking) {
    const savedQueue = queueData[booking.id];

    if (savedQueue) {
        return savedQueue;
    }

    // Fallback for a checked-in booking
    return {
        position: getDemoQueueNumber(booking.id),
        serving: 1
    };
}

/* =========================================
   Display Booking Details
========================================= */

function renderBookingDetails(booking) {
    bookingIdText.textContent = booking.id;
    visitDateText.textContent = booking.date;
    visitTimeText.textContent = booking.time;

    visitorsText.textContent =
        `${booking.visitors} visitor(s)`;
}

/* =========================================
   Render Queue
========================================= */

function renderQueue() {
    const booking = loadBookings().find(
        item => item.id === selectedBookingId
    );

    // No booking selected
    if (!booking) {
        queueEmpty.hidden = false;
        queueDashboard.hidden = true;
        return;
    }

    queueEmpty.hidden = true;
    queueDashboard.hidden = false;

    renderBookingDetails(booking);

    /* Before Check-in */

    if (booking.status === "Confirmed") {
        yourQueueNumber.textContent = "--";
        nowServing.textContent = "--";
        groupsAhead.textContent = "--";

        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";

        progressTrack.setAttribute(
            "aria-valuenow",
            "0"
        );

        queueStatus.textContent = "Not Checked In";
        queueStatus.classList.remove("ready");

        queueMessage.textContent =
            "Your booking is confirmed. Show your QR code to staff when you arrive to join the live queue.";

        return;
    }

    /* After Check-in */

    const queue = getBookingQueue(booking);

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

    // Queue statistics
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
            "It's your turn! Please proceed to the staff.";

    } else {
        queueStatus.textContent = "Waiting";
        queueStatus.classList.remove("ready");

        queueMessage.textContent =
            `${ahead} demo group(s) ahead of you.`;
    }
}

/* =========================================
   Initialize Booking Dropdown
========================================= */

function initializeBookings() {
    const bookings = loadBookings();

    // Keep previous selection if still available
    const previousSelection = selectedBookingId;

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

    if (
        previousSelection &&
        bookings.some(
            booking => booking.id === previousSelection
        )
    ) {
        selectedBookingId = previousSelection;

    } else if (bookings.length > 0) {
        // Prefer most recently checked-in booking
        const checkedInBookings = bookings.filter(
            booking => booking.status === "Checked In"
        );

        const preferredBookings = checkedInBookings.length > 0
            ? checkedInBookings
            : bookings;

        selectedBookingId =
            preferredBookings[preferredBookings.length - 1].id;

    } else {
        selectedBookingId = "";
    }

    bookingSelect.value = selectedBookingId;

    renderQueue();
}

/* =========================================
   Change Selected Booking
========================================= */

bookingSelect.addEventListener("change", function () {
    selectedBookingId = bookingSelect.value;

    renderQueue();
});

/* =========================================
   Refresh Queue Data
========================================= */

function refreshQueue() {
    queueData = loadQueueData();

    initializeBookings();
}

// Refresh when returning to the page
window.addEventListener("focus", refreshQueue);

// Refresh when another tab changes bookings or queue
window.addEventListener("storage", function (event) {
    if (
        event.key === BOOKINGS_KEY ||
        event.key === QUEUE_KEY
    ) {
        refreshQueue();
    }
});

// Refresh when returning using browser navigation
window.addEventListener("pageshow", refreshQueue);

/* =========================================
   Initial Display
========================================= */

refreshQueue();
