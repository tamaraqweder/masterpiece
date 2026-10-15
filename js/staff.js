
/* =========================================
   Smart Queue - Staff Dashboard
   Reservations + QR Check-in + Queue
========================================= */

/* Storage Keys */

const BOOKINGS_KEY = "smartQueueBookings";
const QUEUE_KEY = "smartQueueDemoQueues";

/* =========================================
   Reservations Elements
========================================= */

const reservationsBody = document.getElementById("reservations-body");
const reservationsEmpty = document.getElementById("reservations-empty");
const reservationFilter = document.getElementById("reservation-filter");
const refreshButton = document.getElementById("refresh-btn");

/* =========================================
   Queue Elements
========================================= */

const queueSelect = document.getElementById("queue-booking-select");
const queuePanel = document.getElementById("staff-queue-panel");
const noQueue = document.getElementById("staff-no-queue");

const staffPosition = document.getElementById("staff-position");
const staffServing = document.getElementById("staff-serving");
const staffAhead = document.getElementById("staff-ahead");
const queueMessage = document.getElementById("staff-queue-message");
const nextGroupButton = document.getElementById("next-group-btn");

/* =========================================
   QR Check-in Elements
========================================= */

const checkinInput = document.getElementById("checkin-booking-id");
const manualCheckinBtn = document.getElementById("manual-checkin-btn");
const startScanBtn = document.getElementById("start-scan-btn");
const stopScanBtn = document.getElementById("stop-scan-btn");
const qrReader = document.getElementById("qr-reader");
const checkinResult = document.getElementById("checkin-result");

/* =========================================
   State
========================================= */

let selectedBookingId = "";
let qrScanner = null;
let scannerRunning = false;
let scannerStarting = false;
let scanProcessing = false;

/* =========================================
   Local Storage Helpers
========================================= */

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function getBookings() {
    const bookings = readJSON(BOOKINGS_KEY, []);

    return Array.isArray(bookings) ? bookings : [];
}

function saveBookings(bookings) {
    localStorage.setItem(
        BOOKINGS_KEY,
        JSON.stringify(bookings)
    );
}

function getQueues() {
    const queues = readJSON(QUEUE_KEY, {});

    return queues &&
        typeof queues === "object" &&
        !Array.isArray(queues)
        ? queues
        : {};
}

function saveQueues(queues) {
    localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(queues)
    );
}

/* =========================================
   Demo Queue Number
========================================= */

// Same formula used by Visitor Live Queue

function getDemoQueueNumber(id) {
    let total = 0;

    for (const character of String(id)) {
        total += character.charCodeAt(0);
    }

    return 5 + (total % 21);
}

/* =========================================
   Get Queue for Booking
========================================= */

function getQueueForBooking(booking) {
    const queues = getQueues();

    if (!queues[booking.id]) {
        queues[booking.id] = {
            position: getDemoQueueNumber(booking.id),
            serving: 1
        };

        saveQueues(queues);
    }

    return queues[booking.id];
}

/* =========================================
   Today's Local Date
========================================= */

function getStaffLocalDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* =========================================
   Check-in Result Message
========================================= */

function showCheckinMessage(message, success) {
    checkinResult.textContent = message;

    checkinResult.style.color = success
        ? "#087F77"
        : "#B42318";
}

/* =========================================
   Check In Visitor by Booking ID
========================================= */

function checkInById(bookingId) {
    const id = String(bookingId).trim();

    if (!id) {
        showCheckinMessage(
            "Please enter a Booking ID.",
            false
        );
        return false;
    }

    const bookings = getBookings();

    const booking = bookings.find(
        item => item.id === id
    );

    // Booking not found
    if (!booking) {
        showCheckinMessage(
            "Booking not found.",
            false
        );
        return false;
    }

    // Cancelled booking
    if (booking.status === "Cancelled") {
        showCheckinMessage(
            "This booking has been cancelled.",
            false
        );
        return false;
    }

    // Already checked in
    if (booking.status === "Checked In") {
        showCheckinMessage(
            "This visitor is already checked in.",
            false
        );
        return false;
    }

    // Only confirmed bookings can check in
    if (booking.status !== "Confirmed") {
        showCheckinMessage(
            "This booking cannot be checked in.",
            false
        );
        return false;
    }

    // Validate visit date
    if (booking.date !== getStaffLocalDate()) {
        showCheckinMessage(
            "Check-in is only allowed on the booking date.",
            false
        );
        return false;
    }

    // Update booking status
    booking.status = "Checked In";
    booking.checkedInAt = new Date().toISOString();

    try {
        // Save booking
        saveBookings(bookings);

        // Create demo queue
        getQueueForBooking(booking);

        // Select checked-in booking
        selectedBookingId = booking.id;

        // Update dashboard
        renderAll();

        // Show success message
        showCheckinMessage(
            `Check-in successful! Booking ${booking.id} is now checked in.`,
            true
        );

        return true;

    } catch (error) {
        showCheckinMessage(
            "Unable to save check-in. Please try again.",
            false
        );

        return false;
    }
}

/* =========================================
   Update Statistics
========================================= */

function updateStats(bookings) {
    document.getElementById("total-reservations").textContent =
        bookings.length;

    document.getElementById("confirmed-reservations").textContent =
        bookings.filter(
            booking => booking.status === "Confirmed"
        ).length;

    document.getElementById("checked-in-count").textContent =
        bookings.filter(
            booking => booking.status === "Checked In"
        ).length;

    document.getElementById("completed-count").textContent =
        bookings.filter(
            booking => booking.status === "Completed"
        ).length;
}

/* =========================================
   Render Reservations
========================================= */

function renderReservations() {
    const bookings = getBookings();

    const filter = reservationFilter.value;

    updateStats(bookings);

    reservationsBody.replaceChildren();

    const visible = bookings.filter(
        booking =>
            filter === "All" ||
            booking.status === filter
    );

    reservationsEmpty.hidden = visible.length > 0;

    visible.forEach(function (booking) {
        const row = document.createElement("tr");

        // Booking Details
        const values = [
            booking.id,
            booking.date,
            booking.time,
            booking.visitors
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");

            cell.textContent = value ?? "—";

            row.appendChild(cell);
        });

        // Booking Status
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "staff-status " +
            String(booking.status)
                .toLowerCase()
                .replaceAll(" ", "-");

        badge.textContent = booking.status;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        // Booking Actions
        const actionCell = document.createElement("td");

        if (booking.status === "Confirmed") {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = "Check In";
            button.className = "staff-action-btn";

            // Use the SAME check-in validation
            button.addEventListener("click", function () {
                checkinInput.value = booking.id;

                checkInById(booking.id);
            });

            actionCell.appendChild(button);

        } else {
            actionCell.textContent = "—";
        }

        row.appendChild(actionCell);

        reservationsBody.appendChild(row);
    });
}

/* =========================================
   Render Queue Selector
========================================= */

function renderQueueSelector() {
    const bookings = getBookings().filter(
        booking => booking.status === "Checked In"
    );

    queueSelect.replaceChildren();

    const placeholder = document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Select a booking";

    queueSelect.appendChild(placeholder);

    bookings.forEach(function (booking) {
        const option = document.createElement("option");

        option.value = booking.id;

        option.textContent =
            `${booking.id} — ${booking.time}`;

        queueSelect.appendChild(option);
    });

    if (!bookings.some(
        booking => booking.id === selectedBookingId
    )) {
        selectedBookingId = "";
    }

    queueSelect.value = selectedBookingId;

    renderQueuePanel();
}

/* =========================================
   Render Queue Panel
========================================= */

function renderQueuePanel() {
    const booking = getBookings().find(
        item =>
            item.id === selectedBookingId &&
            item.status === "Checked In"
    );

    queuePanel.hidden = !booking;

    noQueue.hidden = Boolean(booking);

    if (!booking) {
        return;
    }

    const queue = getQueueForBooking(booking);

    const position = Number(queue.position);

    const serving = Math.min(
        position,
        Math.max(1, Number(queue.serving) || 1)
    );

    const ahead = Math.max(
        0,
        position - serving
    );

    staffPosition.textContent = position;
    staffServing.textContent = serving;
    staffAhead.textContent = ahead;

    nextGroupButton.disabled = ahead === 0;

    queueMessage.textContent = ahead === 0
        ? "This booking's demo queue number is now being served."
        : `${ahead} demo groups remain before this booking.`;
}

/* =========================================
   Render Dashboard
========================================= */

function renderAll() {
    renderReservations();
    renderQueueSelector();
}

/* =========================================
   Call Next Group
========================================= */

nextGroupButton.addEventListener("click", function () {
    const booking = getBookings().find(
        item =>
            item.id === selectedBookingId &&
            item.status === "Checked In"
    );

    if (!booking) {
        return;
    }

    const queues = getQueues();

    const queue = queues[booking.id] || {
        position: getDemoQueueNumber(booking.id),
        serving: 1
    };

    if (queue.serving < queue.position) {
        queue.serving += 1;

        queues[booking.id] = queue;

        try {
            saveQueues(queues);

        } catch (error) {
            alert("Could not update demo queue.");
        }
    }

    renderQueuePanel();
});

/* =========================================
   Queue Selection
========================================= */

queueSelect.addEventListener("change", function () {
    selectedBookingId = queueSelect.value;

    renderQueuePanel();
});

/* =========================================
   Manual Check-in
========================================= */

manualCheckinBtn.addEventListener("click", function () {
    checkInById(checkinInput.value);
});

// Check in using Enter key
checkinInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();

        checkInById(checkinInput.value);
    }
});

/* =========================================
   Start QR Scanner
========================================= */

startScanBtn.addEventListener("click", async function () {

    if (scannerRunning || scannerStarting) {
        return;
    }

    if (typeof Html5Qrcode === "undefined") {
        showCheckinMessage(
            "QR Scanner library is not loaded. Check your internet connection.",
            false
        );
        return;
    }

    scannerStarting = true;
    startScanBtn.disabled = true;

    qrReader.hidden = false;

    try {
        qrScanner = new Html5Qrcode("qr-reader");

        await qrScanner.start(
            {
                facingMode: "environment"
            },
            {
                fps: 10,
                qrbox: 220
            },

            // QR successfully scanned
            async function (decodedText) {
                if (!scannerRunning || scanProcessing) {
                    return;
                }

                scanProcessing = true;

                // Put scanned ID in input
                checkinInput.value = decodedText;

                // Stop scanner
                await stopScanner();

                // Check in visitor
                checkInById(decodedText);

                scanProcessing = false;
            },

            // No QR found in current frame
            function () {
                // Ignore scan errors
            }
        );

        scannerRunning = true;

        startScanBtn.hidden = true;
        stopScanBtn.hidden = false;

        showCheckinMessage(
            "Scanner started. Point your camera at the visitor's QR code.",
            true
        );

    } catch (error) {
        qrReader.hidden = true;

        qrScanner = null;

        showCheckinMessage(
            "Unable to start camera. Use localhost or HTTPS and allow camera access.",
            false
        );

    } finally {
        scannerStarting = false;
        startScanBtn.disabled = false;
    }
});

/* =========================================
   Stop QR Scanner
========================================= */

async function stopScanner() {
    if (!qrScanner) {
        return;
    }

    try {
        if (scannerRunning) {
            scannerRunning = false;

            await qrScanner.stop();
        }

        qrScanner.clear();

    } catch (error) {
        // Scanner may already be stopped
    }

    qrScanner = null;

    qrReader.hidden = true;

    startScanBtn.hidden = false;
    stopScanBtn.hidden = true;
}

stopScanBtn.addEventListener("click", async function () {
    await stopScanner();
});

/* =========================================
   Other Events
========================================= */

// Filter reservations
reservationFilter.addEventListener(
    "change",
    renderReservations
);

// Refresh dashboard
refreshButton.addEventListener(
    "click",
    renderAll
);

// Refresh when storage changes in another tab
window.addEventListener(
    "storage",
    renderAll
);

// Refresh when returning to this page
window.addEventListener(
    "focus",
    renderAll
);

/* =========================================
   Initial Display
========================================= */

renderAll();
