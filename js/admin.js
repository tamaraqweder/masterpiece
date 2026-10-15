
/* Smart Queue - Admin Dashboard */
/* Frontend demo using localStorage */

const BOOKINGS_KEY = "smartQueueBookings";
const CAPACITY_KEY = "smartQueueSlotCapacity";
const STAFF_KEY = "smartQueueStaffRecords";

const bookingsBody = document.getElementById("admin-bookings-body");
const bookingsEmpty = document.getElementById("admin-bookings-empty");

const bookingSearch = document.getElementById("booking-search");
const bookingStatusFilter = document.getElementById("booking-status-filter");

const capacityForm = document.getElementById("capacity-form");
const capacityInput = document.getElementById("slot-capacity");
const currentCapacity = document.getElementById("current-capacity");
const capacityMessage = document.getElementById("capacity-message");

const staffForm = document.getElementById("staff-form");
const staffName = document.getElementById("staff-name");
const staffEmail = document.getElementById("staff-email");
const staffBody = document.getElementById("admin-staff-body");
const staffEmpty = document.getElementById("admin-staff-empty");
const staffMessage = document.getElementById("staff-message");

// Read localStorage safely
function readJSON(key, fallback) {
    try {
        const saved = JSON.parse(localStorage.getItem(key));
        return saved ?? fallback;
    } catch {
        return fallback;
    }
}

// Bookings
function getBookings() {
    const bookings = readJSON(BOOKINGS_KEY, []);
    return Array.isArray(bookings) ? bookings : [];
}

function updateBookingStats(bookings) {
    document.getElementById("total-bookings").textContent =
        bookings.length;

    document.getElementById("confirmed-bookings").textContent =
        bookings.filter(b => b.status === "Confirmed").length;

    document.getElementById("checked-in-bookings").textContent =
        bookings.filter(b => b.status === "Checked In").length;

    document.getElementById("cancelled-bookings").textContent =
        bookings.filter(b => b.status === "Cancelled").length;
}

function renderBookings() {
    const bookings = getBookings();

    updateBookingStats(bookings);
    bookingsBody.replaceChildren();

    const search = bookingSearch.value.trim().toLowerCase();
    const status = bookingStatusFilter.value;

    const filtered = bookings.filter(booking => {
        const matchesSearch = String(booking.id)
            .toLowerCase()
            .includes(search);

        const matchesStatus =
            status === "All" || booking.status === status;

        return matchesSearch && matchesStatus;
    });

    bookingsEmpty.hidden = filtered.length > 0;

    filtered.forEach(booking => {
        const row = document.createElement("tr");

        [
            booking.id,
            booking.date,
            booking.time,
            booking.visitors
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "—";
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "admin-status " +
            String(booking.status || "")
                .toLowerCase()
                .replaceAll(" ", "-");

        badge.textContent = booking.status || "Unknown";
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        bookingsBody.appendChild(row);
    });
}

// Capacity
function getCapacity() {
    const saved = Number(localStorage.getItem(CAPACITY_KEY));

    return Number.isInteger(saved) && saved >= 1 && saved <= 500
        ? saved
        : 30;
}

function renderCapacity() {
    const capacity = getCapacity();

    capacityInput.value = capacity;
    currentCapacity.textContent = capacity;
}

capacityForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const capacity = Number(capacityInput.value);

    if (
        !Number.isInteger(capacity) ||
        capacity < 1 ||
        capacity > 500
    ) {
        capacityMessage.textContent =
            "Enter a capacity between 1 and 500.";
        capacityMessage.style.color = "#B42318";
        return;
    }

    try {
        localStorage.setItem(CAPACITY_KEY, String(capacity));

        renderCapacity();

        capacityMessage.textContent =
            "Demo capacity updated successfully.";

        capacityMessage.style.color = "#087F77";
    } catch {
        capacityMessage.textContent =
            "Could not save capacity.";

        capacityMessage.style.color = "#B42318";
    }
});

// Staff
function getStaff() {
    const staff = readJSON(STAFF_KEY, []);
    return Array.isArray(staff) ? staff : [];
}

function renderStaff() {
    const staff = getStaff();

    staffBody.replaceChildren();
    staffEmpty.hidden = staff.length > 0;

    staff.forEach(member => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = member.name;

        const emailCell = document.createElement("td");
        emailCell.textContent = member.email;

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.className = "admin-delete-btn";
        deleteButton.textContent = "Remove";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                `Remove ${member.name} from demo staff records?`
            );

            if (!confirmed) return;

            const updated = getStaff().filter(
                item => item.id !== member.id
            );

            try {
                localStorage.setItem(
                    STAFF_KEY,
                    JSON.stringify(updated)
                );
                renderStaff();
            } catch {
                staffMessage.textContent =
                    "Could not remove staff record.";
                staffMessage.style.color = "#B42318";
            }
        });

        actionCell.appendChild(deleteButton);

        row.append(nameCell, emailCell, actionCell);
        staffBody.appendChild(row);
    });
}

staffForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = staffName.value.trim();
    const email = staffEmail.value.trim().toLowerCase();

    if (!name || !email) return;

    const staff = getStaff();

    if (staff.some(member => member.email.toLowerCase() === email)) {
        staffMessage.textContent =
            "A staff record with this email already exists.";
        staffMessage.style.color = "#B42318";
        return;
    }

    staff.push({
        id: "ST-" + Date.now(),
        name: name,
        email: email
    });

    try {
        localStorage.setItem(STAFF_KEY, JSON.stringify(staff));

        staffForm.reset();
        renderStaff();

        staffMessage.textContent =
            "Demo staff record added successfully.";

        staffMessage.style.color = "#087F77";
    } catch {
        staffMessage.textContent =
            "Could not save staff record.";
        staffMessage.style.color = "#B42318";
    }
});

// Events
bookingSearch.addEventListener("input", renderBookings);
bookingStatusFilter.addEventListener("change", renderBookings);

document.getElementById("admin-refresh").addEventListener(
    "click",
    renderBookings
);

window.addEventListener("storage", function () {
    renderBookings();
    renderCapacity();
    renderStaff();
});

// Start
renderBookings();
renderCapacity();
renderStaff();
