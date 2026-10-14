
/* Smart Queue - Login */

const form = document.getElementById("login-form");
const error = document.getElementById("login-error");

/* Demo Accounts */

const accounts = [
    {
        email: "admin@smartqueue.com",
        password: "Admin123",
        role: "admin"
    },

    {
        email: "staff@smartqueue.com",
        password: "Staff123",
        role: "staff"
    },

    {
        email: "visitor@smartqueue.com",
        password: "Visitor123",
        role: "visitor"
    }
];

/* Login Form */

form.addEventListener("submit", function (event) {

    event.preventDefault();

    // Get input values
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    // Clear previous error
    error.textContent = "";

    // Find matching account
    const account = accounts.find(function (user) {
        return user.email === email && user.password === password;
    });

    // Check account
    if (account) {

        // Redirect based on role
        if (account.role === "admin") {
            window.location.href = "../admin/dashboard.html";

        } else if (account.role === "staff") {
            window.location.href = "../staff/dashboard.html";

        } else if (account.role === "visitor") {
            window.location.href = "../visitor/booking.html";
        }

    } else {

        // Show error message
        error.textContent = "Invalid email or password.";

    }

});
