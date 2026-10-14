
/* Smart Queue - Booking with Capacity */

const bookingForm = document.getElementById("booking-form");

const dateInput = document.getElementById("visit-date");
const timeInput = document.getElementById("visit-time");
const visitorsInput = document.getElementById("visitor-count");
const notesInput = document.getElementById("visitor-notes");

const summaryDate = document.getElementById("summary-date");
const summaryTime = document.getElementById("summary-time");
const summaryVisitors = document.getElementById("summary-visitors");
const summaryAvailable = document.getElementById("summary-available");

const bookingMessage = document.getElementById("booking-message");
const slotAvailability = document.getElementById("slot-availability");

const STORAGE_KEY = "smartQueueBookings";
const MAX_CAPACITY = 30;

// Today's local date
function getLocalDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Read bookings
function getBookings() {
    const bookings = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(bookings) ? bookings : [];
}

// Calculate booked visitors
function getBookedVisitors(date, time) {
    return getBookings()
        .filter(function (booking) {
            return (
                booking.date === date &&
                booking.time === time &&
                booking.status === "Confirmed"
            );
        })
        .reduce(function (total, booking) {
            return total + Number(booking.visitors || 0);
        }, 0);
}

// Available places
function getAvailablePlaces(date, time) {
    const booked = getBookedVisitors(date, time);

    return Math.max(0, MAX_CAPACITY - booked);
}

// Update available time slots
function updateTimeSlots() {
    const selectedDate = dateInput.value;
    const visitorCount = Number(visitorsInput.value);
    const previousTime = timeInput.value;

    slotAvailability.textContent = "";
    slotAvailability.className = "";

    Array.from(timeInput.options).forEach(function (option) {

        if (option.value === "") {
            return;
        }

        option.disabled = false;
        option.textContent = option.value;
    });

    if (!selectedDate || selectedDate < getLocalDate()) {
        timeInput.value = "";

        slotAvailability.textContent =
            "Please select a valid visit date.";

        slotAvailability.className = "warning";

        updateSummary();
        return;
    }

    if (
        !Number.isInteger(visitorCount) ||
        visitorCount < 1 ||
        visitorCount > 10
    ) {
        timeInput.value = "";

        slotAvailability.textContent =
            "Choose between 1 and 10 visitors.";

        slotAvailability.className = "warning";

        updateSummary();
        return;
    }

    Array.from(timeInput.options).forEach(function (option) {

        if (option.value === "") {
            return;
        }

        const available = getAvailablePlaces(
            selectedDate,
            option.value
        );

        if (available === 0) {

            option.disabled = true;
            option.textContent =
                `${option.value} - Fully Booked`;

        } else if (available < visitorCount) {

            option.disabled = true;
            option.textContent =
                `${option.value} - Only ${available} left`;

        } else {

            option.disabled = false;
            option.textContent =
                `${option.value} - ${available} spots left`;
        }
    });

    const selectedOption = Array.from(timeInput.options).find(
        option => option.value === previousTime
    );

    if (selectedOption && !selectedOption.disabled) {
        timeInput.value = previousTime;
    } else {
        timeInput.value = "";
    }

    updateAvailabilityMessage();
    updateSummary();
}

// Availability message
function updateAvailabilityMessage() {
    const date = dateInput.value;
    const time = timeInput.value;
    const visitors = Number(visitorsInput.value);

    if (!date) {
        slotAvailability.textContent =
            "Please select a visit date first.";

        slotAvailability.className = "warning";
        return;
    }

    if (!time) {
        slotAvailability.textContent =
            "Select an available time slot.";

        slotAvailability.className = "warning";
        return;
    }

    const available = getAvailablePlaces(date, time);

    if (available === 0) {
        slotAvailability.textContent = "Fully Booked";
        slotAvailability.className = "full";

    } else if (available < visitors) {
        slotAvailability.textContent =
            `Only ${available} spots left.`;

        slotAvailability.className = "full";

    } else {
        slotAvailability.textContent =
            `${available} spots available for this time.`;

        slotAvailability.className = "available";
    }
}

// Update summary
function updateSummary() {
    summaryDate.textContent =
        dateInput.value || "Not selected";

    summaryTime.textContent =
        timeInput.value || "Not selected";

    const visitors = Number(visitorsInput.value);

    if (
        Number.isInteger(visitors) &&
        visitors >= 1 &&
        visitors <= 10
    ) {
        summaryVisitors.textContent =
            visitors === 1
                ? "1 Visitor"
                : `${visitors} Visitors`;
    } else {
        summaryVisitors.textContent = "Not selected";
    }

    if (dateInput.value && timeInput.value) {
        const available = getAvailablePlaces(
            dateInput.value,
            timeInput.value
        );

        summaryAvailable.textContent =
            `${available} spots left`;
    } else {
        summaryAvailable.textContent = "Not selected";
    }
}

// Events
dateInput.addEventListener("change", function () {
    updateTimeSlots();
});

visitorsInput.addEventListener("input", function () {
    updateTimeSlots();
});

timeInput.addEventListener("change", function () {
    updateAvailabilityMessage();
    updateSummary();
});

// Submit booking
bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    bookingMessage.textContent = "";
    bookingMessage.style.color = "#C0392B";

    const visitDate = dateInput.value;
    const visitTime = timeInput.value;
    const visitors = Number(visitorsInput.value);
    const notes = notesInput.value.trim();

    if (!visitDate || visitDate < getLocalDate()) {
        bookingMessage.textContent =
            "Please select a valid visit date.";
        return;
    }

    if (!visitTime) {
        bookingMessage.textContent =
            "Please select a visit time.";
        return;
    }

    if (
        !Number.isInteger(visitors) ||
        visitors < 1 ||
        visitors > 10
    ) {
        bookingMessage.textContent =
            "Number of visitors must be between 1 and 10.";
        return;
    }

    const available = getAvailablePlaces(
        visitDate,
        visitTime
    );

    if (available < visitors) {
        bookingMessage.textContent =
            `Not enough available spots. Only ${available} left.`;

        updateTimeSlots();
        return;
    }

    const booking = {
        id: "SQ-" + Date.now(),
        museum: "Children's Museum Jordan",
        date: visitDate,
        time: visitTime,
        visitors: visitors,
        notes: notes,
        status: "Confirmed",
        createdAt: new Date().toISOString()
    };

    try {
        const bookings = getBookings();

        bookings.push(booking);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(bookings)
        );

        window.location.href = "my-bookings.html";

    } catch (error) {
        bookingMessage.textContent =
            "Unable to save booking. Please try again.";
    }
});

// Initial setup
dateInput.min = getLocalDate();

updateTimeSlots();
updateSummary();
