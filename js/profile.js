
const profileForm = document.getElementById("profile-form");

const nameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const displayName = document.getElementById("display-name");
const displayEmail = document.getElementById("display-email");

const profileAvatar = document.getElementById("profile-avatar");
const headerAvatar = document.getElementById("header-avatar");

const profileMessage = document.getElementById("profile-message");
const profileBookings = document.getElementById("profile-bookings");

const PROFILE_KEY = "smartQueueVisitorProfile";
const BOOKINGS_KEY = "smartQueueBookings";

// Read saved profile
function getProfile() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(PROFILE_KEY) || "null"
        );

        return saved && typeof saved === "object"
            ? saved
            : {
                name: "Visitor",
                email: "visitor@example.com",
                phone: ""
            };
    } catch {
        return {
            name: "Visitor",
            email: "visitor@example.com",
            phone: ""
        };
    }
}

// Update profile display
function updateProfileDisplay(profile) {
    displayName.textContent = profile.name;
    displayEmail.textContent = profile.email;

    const initial = profile.name.trim().charAt(0).toUpperCase() || "V";

    profileAvatar.textContent = initial;
    headerAvatar.textContent = initial;
}

// Count demo bookings
function updateBookingCount() {
    try {
        const bookings = JSON.parse(
            localStorage.getItem(BOOKINGS_KEY) || "[]"
        );

        profileBookings.textContent =
            Array.isArray(bookings) ? bookings.length : 0;
    } catch {
        profileBookings.textContent = "0";
    }
}

// Initialize
const savedProfile = getProfile();

nameInput.value =
    savedProfile.name === "Visitor" ? "" : savedProfile.name;

emailInput.value =
    savedProfile.email === "visitor@example.com"
        ? ""
        : savedProfile.email;

phoneInput.value = savedProfile.phone;

updateProfileDisplay(savedProfile);
updateBookingCount();

// Save changes
profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !email) {
        profileMessage.textContent =
            "Please enter your name and email.";
        profileMessage.style.color = "#C0392B";
        return;
    }

    const profile = {
        name: name,
        email: email,
        phone: phone
    };

    try {
        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

        updateProfileDisplay(profile);

        profileMessage.textContent =
            "Profile updated successfully!";

        profileMessage.style.color = "#087F77";

    } catch {
        profileMessage.textContent =
            "Unable to save profile.";

        profileMessage.style.color = "#C0392B";
    }
});
