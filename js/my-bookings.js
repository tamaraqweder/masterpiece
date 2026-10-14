
/* Smart Queue - My Bookings */

const bookingsContainer = document.getElementById("bookings-container");
const emptyBookings = document.getElementById("empty-bookings");
const bookingsMessage = document.getElementById("bookings-message");

const totalBookings = document.getElementById("total-bookings");
const confirmedBookings = document.getElementById("confirmed-bookings");
const cancelledBookings = document.getElementById("cancelled-bookings");

const STORAGE_KEY = "smartQueueBookings";

// Read saved bookings
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

// Create an element containing text safely
function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = String(text);
    return element;
}

// Create one booking detail
function createBookingDetail(label, value) {
    const detail = document.createElement("div");
    detail.className = "booking-detail";

    detail.appendChild(createTextElement("p", "", label));
    detail.appendChild(createTextElement("strong", "", value));

    return detail;
}

// Show all bookings
function renderBookings() {
    const bookings = getBookings();

    bookingsContainer.replaceChildren();

    totalBookings.textContent = bookings.length;

    confirmedBookings.textContent = bookings.filter(
        booking => booking.status === "Confirmed"
    ).length;

    cancelledBookings.textContent = bookings.filter(
        booking => booking.status === "Cancelled"
    ).length;

    emptyBookings.hidden = bookings.length !== 0;

    if (bookings.length === 0) {
        return;
    }

    // Show newest bookings first
    const sortedBookings = [...bookings].reverse();

    sortedBookings.forEach(function (booking) {
        const card = document.createElement("article");
        card.className = "booking-item";

        // Card header
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
        }

        header.append(title, status);

        // Booking details
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

        // Actions
        const actions = document.createElement("div");
        actions.className = "booking-actions";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "cancel-booking-btn";
        cancelButton.textContent = "Cancel Booking";

        if (booking.status === "Cancelled") {
            cancelButton.disabled = true;
        }

        cancelButton.addEventListener("click", function () {
            cancelBooking(booking.id);
        });

        actions.appendChild(cancelButton);

        card.append(header, details, actions);
        bookingsContainer.appendChild(card);
    });
}

// Cancel a booking
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
        renderBookings();

    } catch (error) {
        bookingsMessage.textContent =
            "Unable to update booking. Please try again.";
    }
}

// Initial display
renderBookings();
