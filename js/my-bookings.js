
/* =========================================
   Smart Queue - My Bookings
========================================= */

const bookingsContainer = document.getElementById("bookings-container");
const emptyBookings = document.getElementById("empty-bookings");
const bookingsMessage = document.getElementById("bookings-message");

const totalBookings = document.getElementById("total-bookings");
const confirmedBookings = document.getElementById("confirmed-bookings");
const cancelledBookings = document.getElementById("cancelled-bookings");

const STORAGE_KEY = "smartQueueBookings";

/* =========================================
   QR Code Modal Elements
========================================= */

const qrModal = document.getElementById("qr-modal");
const qrContainer = document.getElementById("booking-qr");
const qrBookingId = document.getElementById("qr-booking-id");
const closeQrButton = document.getElementById("close-qr");

/* =========================================
   Get Bookings
========================================= */

function getBookings() {
    try {
        const bookings = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(bookings)) {
            throw new Error("Invalid bookings data");
        }

        return bookings;

    } catch (error) {
        bookingsMessage.textContent =
            "Unable to load bookings from browser storage.";

        return [];
    }
}

/* =========================================
   Create Text Element
========================================= */

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = String(text);

    return element;
}

/* =========================================
   Create Booking Detail
========================================= */

function createBookingDetail(label, value) {
    const detail = document.createElement("div");
    detail.className = "booking-detail";

    detail.appendChild(
        createTextElement("p", "", label)
    );

    detail.appendChild(
        createTextElement("strong", "", value)
    );

    return detail;
}

/* =========================================
   Render All Bookings
========================================= */

function renderBookings() {
    const bookings = getBookings();

    bookingsContainer.replaceChildren();

    // Statistics
    totalBookings.textContent = bookings.length;

    confirmedBookings.textContent = bookings.filter(
        booking => booking.status === "Confirmed"
    ).length;

    cancelledBookings.textContent = bookings.filter(
        booking => booking.status === "Cancelled"
    ).length;

    // Empty State
    emptyBookings.hidden = bookings.length !== 0;

    if (bookings.length === 0) {
        return;
    }

    // Newest first
    const sortedBookings = [...bookings].reverse();

    sortedBookings.forEach(function (booking) {

        // Booking Card
        const card = document.createElement("article");
        card.className = "booking-item";

        /* Card Header */

        const header = document.createElement("div");
        header.className = "booking-item-header";

        const title = createTextElement(
            "h3",
            "",
            booking.id || "Booking"
        );

        const status = createTextElement(
            "span",
            "booking-status",
            booking.status || "Unknown"
        );

        if (booking.status === "Confirmed") {
            status.classList.add("confirmed");

        } else if (booking.status === "Cancelled") {
            status.classList.add("cancelled");

        } else if (booking.status === "Checked In") {
            status.classList.add("checked-in");

        } else if (booking.status === "Completed") {
            status.classList.add("completed");
        }

        header.append(title, status);

        /* Booking Details */

        const details = document.createElement("div");
        details.className = "booking-details";

        details.appendChild(
            createBookingDetail(
                "Museum",
                booking.museum || "Children's Museum Jordan"
            )
        );

        details.appendChild(
            createBookingDetail(
                "Visit Date",
                booking.date || "Not available"
            )
        );

        details.appendChild(
            createBookingDetail(
                "Visit Time",
                booking.time || "Not available"
            )
        );

        details.appendChild(
            createBookingDetail(
                "Visitors",
                booking.visitors || 1
            )
        );

        /* Booking Actions */

        const actions = document.createElement("div");
        actions.className = "booking-actions";

        // Show QR Code for active bookings
        if (
            booking.status === "Confirmed" ||
            booking.status === "Checked In"
        ) {
            const qrButton = document.createElement("button");

            qrButton.type = "button";
            qrButton.className = "show-qr-btn";
            qrButton.textContent = "Show QR Code";

            qrButton.addEventListener("click", function () {
                showBookingQR(booking.id);
            });

            actions.appendChild(qrButton);
        }

        // Cancel only confirmed bookings
        if (booking.status === "Confirmed") {
            const cancelButton = document.createElement("button");

            cancelButton.type = "button";
            cancelButton.className = "cancel-booking-btn";
            cancelButton.textContent = "Cancel Booking";

            cancelButton.addEventListener("click", function () {
                cancelBooking(booking.id);
            });

            actions.appendChild(cancelButton);
        }

        card.append(header, details, actions);

        bookingsContainer.appendChild(card);
    });
}

/* =========================================
   Show QR Code
========================================= */

function showBookingQR(bookingId) {
    const bookings = getBookings();

    const booking = bookings.find(
        item =>
            item.id === bookingId &&
            (
                item.status === "Confirmed" ||
                item.status === "Checked In"
            )
    );

    if (!booking) {
        bookingsMessage.textContent =
            "Booking not found or no longer active.";
        return;
    }

    // Check QR library
    if (typeof QRCode === "undefined") {
        bookingsMessage.textContent =
            "QR Code library is not loaded. Check your internet connection.";
        return;
    }

    // Check modal elements
    if (!qrModal || !qrContainer || !qrBookingId) {
        bookingsMessage.textContent =
            "QR Code window is missing from the HTML.";
        return;
    }

    bookingsMessage.textContent = "";

    // Remove previous QR Code
    qrContainer.replaceChildren();

    // Generate QR Code
    new QRCode(qrContainer, {
        text: booking.id,
        width: 200,
        height: 200,
        colorDark: "#134E4A",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
    });

    qrBookingId.textContent = booking.id;

    // Show modal
    qrModal.hidden = false;
}

/* =========================================
   Close QR Modal
========================================= */

function closeQRModal() {
    if (qrModal) {
        qrModal.hidden = true;
    }
}

if (closeQrButton) {
    closeQrButton.addEventListener(
        "click",
        closeQRModal
    );
}

if (qrModal) {
    qrModal.addEventListener("click", function (event) {
        if (event.target === qrModal) {
            closeQRModal();
        }
    });
}

// Close using Escape
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeQRModal();
    }
});

/* =========================================
   Cancel Booking
========================================= */

function cancelBooking(bookingId) {
    const confirmed = window.confirm(
        "Are you sure you want to cancel this demo booking?"
    );

    if (!confirmed) {
        return;
    }

    const bookings = getBookings();

    const booking = bookings.find(
        item => item.id === bookingId
    );

    if (!booking || booking.status !== "Confirmed") {
        bookingsMessage.textContent =
            "This booking cannot be cancelled.";
        return;
    }

    booking.status = "Cancelled";

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(bookings)
        );

        bookingsMessage.textContent = "";

        closeQRModal();
        renderBookings();

    } catch (error) {
        bookingsMessage.textContent =
            "Unable to update booking. Please try again.";
    }
}

/* =========================================
   Refresh Bookings
========================================= */

// Refresh when returning to page
window.addEventListener("focus", function () {
    renderBookings();
});

// Refresh when another tab changes bookings
window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
        renderBookings();
    }
});

/* =========================================
   Initial Display
========================================= */

renderBookings();
