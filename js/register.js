
/* Smart Queue - Register Validation */

const registerForm = document.getElementById("register-form");
const message = document.getElementById("register-message");

registerForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Get input values
    const fullName = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Clear previous message
    message.textContent = "";
    message.style.color = "#C0392B";

    // Full Name Validation
    if (fullName === "") {
        message.textContent = "Please enter your full name.";
        return;
    }

    // Email Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        message.textContent = "Please enter a valid email address.";
        return;
    }

    // Password Validation
    if (password.length < 8) {
        message.textContent = "Password must be at least 8 characters.";
        return;
    }

    // Confirm Password Validation
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    // All fields are valid
    message.style.color = "#087F77";
    message.textContent = "All information is valid!";

});
