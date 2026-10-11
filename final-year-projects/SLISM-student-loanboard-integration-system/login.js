
/* =========================================================
   SLB-IMS — LOGIN & ACCESS PORTAL
   File: login.js

   Front-end demonstration only.
   This file does not authenticate real users, create secure
   sessions, or authorize access to protected information.
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------------------------------
    // 1. DOM ELEMENTS
    // -----------------------------------------------------

    const loginForm = document.getElementById("login-form");
    const loginIdentifier = document.getElementById("login-identifier");
    const loginPassword = document.getElementById("login-password");
    const togglePassword = document.getElementById("toggle-password");
    const rememberSession = document.getElementById("remember-session");
    const loginMessage = document.getElementById("login-message");
    const loginSubmit = document.getElementById("login-submit");

    const demoRole = document.getElementById("login-demo-role");
    const demoSignIn = document.getElementById("demo-sign-in");
    const demoRoleDescription = document.getElementById(
        "demo-role-description"
    );

    const successPanel = document.getElementById("login-success-panel");
    const successTitle = document.getElementById("login-success-title");
    const successDescription = document.getElementById(
        "login-success-description"
    );
    const successRole = document.getElementById("login-success-role");

    const logoutDemo = document.getElementById("login-logout-demo");
    const showLoginForm = document.getElementById("login-show-form");

    const loginYear = document.getElementById("login-year");

    // -----------------------------------------------------
    // 2. ROLE DEFINITIONS
    // -----------------------------------------------------

    const roleDefinitions = {
        "institution-admin": {
            title: "Institution Administrator",
            description:
                "Preview institutional oversight, student records, academic administration, and system summaries.",
            successDescription:
                "The institution-administrator demonstration was selected. This is a browser-only simulation, not an authenticated administrator session."
        },

        "admissions-officer": {
            title: "Admissions Officer",
            description:
                "Preview admission applications, admission decisions, student identifiers, and admission records.",
            successDescription:
                "The admissions-officer demonstration was selected. No real admission records were accessed or modified."
        },

        "finance-officer": {
            title: "Finance Officer",
            description:
                "Preview assessed charges, verified receipts, student balances, and financial reconciliation activities.",
            successDescription:
                "The finance-officer demonstration was selected. No real financial records were accessed or modified."
        },

        "loan-officer": {
            title: "Loan-Board Officer",
            description:
                "Preview sponsorship and disbursement information while preserving the distinction between approved funding and money actually received.",
            successDescription:
                "The loan-board-officer demonstration was selected. No actual loan-board system was contacted and no funding data was exchanged."
        },

        "student": {
            title: "Student",
            description:
                "Preview personal academic information, institutional charges, confirmed payments, and funding updates.",
            successDescription:
                "The student demonstration was selected. No real student account or personal records were accessed."
        }
    };

    // -----------------------------------------------------
    // 3. SHARED HELPERS
    // -----------------------------------------------------

    function getSelectedRole() {
        if (!demoRole) {
            return null;
        }

        return roleDefinitions[demoRole.value] || null;
    }

    function showMessage(message, type = "error") {
        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = message;
        loginMessage.hidden = false;
        loginMessage.dataset.type = type;

        if (type === "success") {
            loginMessage.style.borderColor =
                "rgba(140, 231, 197, 0.35)";

            loginMessage.style.color = "#8ce7c5";
            loginMessage.style.background =
                "rgba(113, 225, 208, 0.075)";
        } else {
            loginMessage.style.borderColor =
                "rgba(255, 157, 157, 0.3)";

            loginMessage.style.color = "#ff9d9d";
            loginMessage.style.background =
                "rgba(255, 100, 100, 0.075)";
        }
    }

    function clearMessage() {
        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = "";
        loginMessage.hidden = true;
        delete loginMessage.dataset.type;
    }

    function clearLoginFields() {
        if (loginForm) {
            loginForm.reset();
        }

        if (loginPassword) {
            loginPassword.type = "password";
        }

        if (togglePassword) {
            togglePassword.textContent = "Show";
            togglePassword.setAttribute("aria-label", "Show password");
            togglePassword.setAttribute("aria-pressed", "false");
        }

        clearMessage();
    }

    function hideSuccessPanel() {
        if (successPanel) {
            successPanel.hidden = true;
        }
    }

    function showSuccessPanel(roleKey) {
        const role = roleDefinitions[roleKey];

        if (!role || !successPanel) {
            showMessage(
                "The selected demonstration role is unavailable."
            );
            return;
        }

        if (successTitle) {
            successTitle.textContent = "Demo access selected";
        }

        if (successDescription) {
            successDescription.textContent =
                role.successDescription;
        }

        if (successRole) {
            successRole.textContent = role.title;
        }

        successPanel.hidden = false;

        successPanel.scrollIntoView({
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth",
            block: "start"
        });
    }

    // -----------------------------------------------------
    // 4. PASSWORD VISIBILITY
    // -----------------------------------------------------

    if (togglePassword && loginPassword) {
        togglePassword.addEventListener("click", () => {
            const currentlyHidden =
                loginPassword.type === "password";

            loginPassword.type = currentlyHidden
                ? "text"
                : "password";

            togglePassword.textContent = currentlyHidden
                ? "Hide"
                : "Show";

            togglePassword.setAttribute(
                "aria-label",
                currentlyHidden ? "Hide password" : "Show password"
            );

            togglePassword.setAttribute(
                "aria-pressed",
                String(currentlyHidden)
            );
        });
    }

    // -----------------------------------------------------
    // 5. UPDATE THE ROLE DESCRIPTION
    // -----------------------------------------------------

    function updateRoleDescription() {
        const role = getSelectedRole();

        if (!role || !demoRoleDescription) {
            return;
        }

        const titleElement =
            demoRoleDescription.querySelector("strong");

        const descriptionElement =
            demoRoleDescription.querySelector("p");

        if (titleElement) {
            titleElement.textContent = role.title;
        }

        if (descriptionElement) {
            descriptionElement.textContent = role.description;
        }

        demoRoleDescription.setAttribute(
            "aria-label",
            `${role.title}: ${role.description}`
        );
    }

    if (demoRole) {
        demoRole.addEventListener("change", () => {
            updateRoleDescription();
            clearMessage();
        });

        updateRoleDescription();
    }

    // -----------------------------------------------------
    // 6. DEMONSTRATION ACCESS
    // -----------------------------------------------------

    if (demoSignIn) {
        demoSignIn.addEventListener("click", () => {
            const roleKey = demoRole ? demoRole.value : "";

            if (!roleDefinitions[roleKey]) {
                showMessage(
                    "Select a valid demonstration role before continuing."
                );
                return;
            }

            clearMessage();

            // This changes the displayed interface only.
            // It does not verify identity or grant permissions.
            showSuccessPanel(roleKey);
        });
    }

    // -----------------------------------------------------
    // 7. SIGN-IN FORM VALIDATION
    // -----------------------------------------------------

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            clearMessage();

            const identifier = loginIdentifier
                ? loginIdentifier.value.trim()
                : "";

            const password = loginPassword
                ? loginPassword.value
                : "";

            if (!identifier) {
                showMessage(
                    "Enter a demonstration username or email address."
                );

                if (loginIdentifier) {
                    loginIdentifier.focus();
                }

                return;
            }

            if (!password.trim()) {
                showMessage(
                    "Enter a non-empty demonstration password to test form validation."
                );

                if (loginPassword) {
                    loginPassword.focus();
                }

                return;
            }

            /*
             * Important:
             *
             * No credentials are sent to a server.
             * No password is stored.
             * No role is assigned based on the entered identifier.
             * No authentication is performed.
             *
             * The sign-in form is intentionally not connected to
             * a real account system in this front-end prototype.
             */

            showMessage(
                "Real sign-in is not enabled in this prototype. " +
                "Use the demonstration role panel to preview the interface.",
                "success"
            );

            // Do not save the identifier or password.
            // The remember-session checkbox has no persistence
            // behavior until a secure backend is implemented.

            if (rememberSession && rememberSession.checked) {
                // Intentionally no storage operation.
            }

            // Prevent real-looking authentication behavior.
            // Keep the entered values available for local testing.
            if (loginSubmit) {
                loginSubmit.blur();
            }
        });
    }

    // -----------------------------------------------------
    // 8. END THE DEMONSTRATION
    // -----------------------------------------------------

    if (logoutDemo) {
        logoutDemo.addEventListener("click", () => {
            hideSuccessPanel();
            clearLoginFields();

            if (demoRole) {
                demoRole.value = "institution-admin";
                updateRoleDescription();
            }

            if (loginIdentifier) {
                loginIdentifier.focus();
            }
        });
    }

    // -----------------------------------------------------
    // 9. RETURN TO THE LOGIN FORM
    // -----------------------------------------------------

    if (showLoginForm) {
        showLoginForm.addEventListener("click", () => {
            hideSuccessPanel();
            clearMessage();

            if (loginForm) {
                loginForm.scrollIntoView({
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth",
                    block: "center"
                });
            }

            if (loginIdentifier) {
                loginIdentifier.focus({
                    preventScroll: true
                });
            }
        });
    }

    // -----------------------------------------------------
    // 10. CLEAR MESSAGES WHEN THE USER EDITS INPUTS
    // -----------------------------------------------------

    [loginIdentifier, loginPassword].forEach((field) => {
        if (!field) {
            return;
        }

        field.addEventListener("input", () => {
            if (
                loginMessage &&
                loginMessage.dataset.type !== "success"
            ) {
                clearMessage();
            }
        });
    });

    // -----------------------------------------------------
    // 11. UPDATE THE FOOTER YEAR
    // -----------------------------------------------------

    if (loginYear) {
        loginYear.textContent = String(
            new Date().getFullYear()
        );
    }

    document.querySelectorAll(".current-year").forEach((element) => {
        element.textContent = String(new Date().getFullYear());
    });

    // -----------------------------------------------------
    // 12. INITIAL STATE
    // -----------------------------------------------------

    hideSuccessPanel();
    clearMessage();

    console.info(
        "SLB-IMS login interface initialized. " +
        "Demo mode only; no real authentication is enabled."
    );
});
