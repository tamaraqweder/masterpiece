
/* Smart Queue - Booking with Dynamic Capacity */

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
const CAPACITY_KEY = "smartQueueSlotCapacity";

// Get capacity set by Admin
function getMaxCapacity() {
    const saved = localStorage.getItem(CAPACITY_KEY);

    if (saved === null) {
        return 30;
    }

    const capacity = Number(saved);

    return Number.isInteger(capacity) &&
        capacity >= 1 &&
        capacity <= 500
        ? capacity
        : 30;
}

// Today's local date
function getLocalDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Read bookings safely
function getBookings() {
    try {
        const bookings = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(bookings) ? bookings : [];
    } catch (error) {
        return [];
    }
}

// Calculate booked visitors for selected date and time
function getBookedVisitors(date, time) {
    return getBookings()
        .filter(function (booking) {
            return (
                booking.date === date &&
                booking.time === time &&
                (
                    booking.status === "Confirmed" ||
                    booking.status === "Checked In" ||
                    booking.status === "Completed"
                )
            );
        })
        .reduce(function (total, booking) {
            return total + Number(booking.visitors || 0);
        }, 0);
}

// Calculate available places
function getAvailablePlaces(date, time) {
    const booked = getBookedVisitors(date, time);
    const capacity = getMaxCapacity();

    return Math.max(0, capacity - booked);
}

// Update maximum capacity text in HTML
function updateCapacityText() {
    const capacity = getMaxCapacity();

    const capacityText = document.getElementById("capacity-text");

    if (capacityText) {
        capacityText.textContent =
            `Maximum capacity: ${capacity} visitors per time slot. Demo availability only.`;
    }
}

// Update available time slots
function updateTimeSlots() {
    const selectedDate = dateInput.value;
    const visitorCount = Number(visitorsInput.value);
    const previousTime = timeInput.value;

    slotAvailability.textContent = "";
    slotAvailability.className = "";

    // Reset all time options
    Array.from(timeInput.options).forEach(function (option) {
        if (option.value === "") {
            return;
        }

        option.disabled = false;
        option.textContent = option.value;
    });

    // Validate date
    if (!selectedDate || selectedDate < getLocalDate()) {
        timeInput.value = "";

        slotAvailability.textContent =
            "Please select a valid visit date.";

        slotAvailability.className = "warning";

        updateSummary();
        return;
    }

    // Validate visitor count
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

    // Calculate availability for each time slot
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

    // Keep selected time if it is still available
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

// Show availability message
function updateAvailabilityMessage() {
    const date = dateInput.value;
    const time = timeInput.value;
    const visitors = Number(visitorsInput.value);

    if (!date || date < getLocalDate()) {
        slotAvailability.textContent =
            "Please select a valid visit date.";

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

// Update booking summary
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

    if (
        dateInput.value &&
        dateInput.value >= getLocalDate() &&
        timeInput.value
    ) {
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

    // Validate date
    if (!visitDate || visitDate < getLocalDate()) {
        bookingMessage.textContent =
            "Please select a valid visit date.";
        return;
    }

    // Validate time
    const selectedTimeOption = Array.from(timeInput.options).find(
        option => option.value === visitTime
    );

    if (!visitTime || !selectedTimeOption) {
        bookingMessage.textContent =
            "Please select a valid visit time.";
        return;
    }

    // Validate visitor count
    if (
        !Number.isInteger(visitors) ||
        visitors < 1 ||
        visitors > 10
    ) {
        bookingMessage.textContent =
            "Number of visitors must be between 1 and 10.";
        return;
    }

    // Recheck capacity before saving
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

    // Create booking
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

// Refresh when Admin changes data in another tab
window.addEventListener("storage", function (event) {
    if (
        event.key === CAPACITY_KEY ||
        event.key === STORAGE_KEY
    ) {
        updateCapacityText();
        updateTimeSlots();
    }
});

// Refresh when returning to the page
window.addEventListener("focus", function () {
    updateCapacityText();
    updateTimeSlots();
});

// Initial setup
dateInput.min = getLocalDate();

updateCapacityText();
updateTimeSlots();
updateSummary();
