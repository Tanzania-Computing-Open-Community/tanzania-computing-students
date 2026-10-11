
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("registration-search");
    const statusFilter = document.getElementById("registration-status-filter");
    const resetButton = document.getElementById("reset-registration-filters");
    const tableBody = document.getElementById("registration-table-body");
    const emptyState = document.getElementById("registration-empty-state");
    const resultCount = document.getElementById("registration-result-count");

    const totalStudents = document.getElementById("total-students");
    const registeredStudents = document.getElementById("registered-students");
    const pendingStudents = document.getElementById("pending-students");

    const showFormButton = document.getElementById("show-registration-form");
    const formPanel = document.getElementById("registration-form-panel");
    const registrationForm = document.getElementById("student-registration-form");
    const closeFormButton = document.getElementById("close-registration-form");
    const cancelButton = document.getElementById("cancel-registration");
    const formMessage = document.getElementById("registration-form-message");

    const nameInput = document.getElementById("student-full-name");
    const emailInput = document.getElementById("student-email");
    const programmeInput = document.getElementById("student-programme");
    const academicYearInput = document.getElementById("student-academic-year");
    const admissionReferenceInput = document.getElementById(
        "student-admission-reference"
    );
    const registrationStatusInput = document.getElementById(
        "student-registration-status"
    );

    if (!tableBody) {
        console.error(
            "Registration initialization failed: registration-table-body was not found."
        );
        return;
    }

    let nextStudentNumber = determineNextStudentNumber();
    let avatarStyleIndex = 0;

    const avatarClasses = [
        "avatar-blue",
        "avatar-gold",
        "avatar-teal",
        "avatar-purple"
    ];

    /**
     * Read the next available demonstration student number.
     * Existing records determine the sequence, preventing duplicates.
     */
    function determineNextStudentNumber() {
        let highestNumber = 0;

        tableBody.querySelectorAll("tr").forEach((row) => {
            const match = row.textContent.match(/SLB-\d{4}-(\d+)/);

            if (match) {
                highestNumber = Math.max(
                    highestNumber,
                    Number.parseInt(match[1], 10)
                );
            }
        });

        return highestNumber + 1;
    }

    function getRows() {
        return Array.from(tableBody.querySelectorAll("tr")).filter(
            (row) => !row.dataset.empty
        );
    }

    function getRowStatus(row) {
        if (row.dataset.status) {
            return row.dataset.status;
        }

        const statusElement = row.querySelector(
            ".status-badge, .status-pill, [class*='status-']"
        );

        return statusElement
            ? statusElement.textContent.trim()
            : "";
    }

    function updateSummary() {
        const rows = getRows();

        const registeredCount = rows.filter(
            (row) => getRowStatus(row).toLowerCase() === "registered"
        ).length;

        const pendingCount = rows.filter(
            (row) => getRowStatus(row).toLowerCase() === "pending"
        ).length;

        if (totalStudents) {
            totalStudents.textContent = rows.length;
        }

        if (registeredStudents) {
            registeredStudents.textContent = registeredCount;
        }

        if (pendingStudents) {
            pendingStudents.textContent = pendingCount;
        }
    }

    function updateResultCount(visibleCount) {
        if (!resultCount) {
            return;
        }

        const label =
            visibleCount === 1
                ? "student record shown"
                : "student records shown";

        resultCount.textContent = `${visibleCount} ${label} — prototype data`;
    }

    function applyFilters() {
        const query = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "all";

        let visibleCount = 0;

        getRows().forEach((row) => {
            const matchesSearch = row.textContent
                .toLowerCase()
                .includes(query);

            const rowStatus = getRowStatus(row).toLowerCase();

            const matchesStatus =
                selectedStatus === "all" ||
                rowStatus === selectedStatus.toLowerCase();

            const visible = matchesSearch && matchesStatus;

            row.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }

        updateResultCount(visibleCount);
        updateSummary();
    }

    function resetFilters() {
        if (searchInput) {
            searchInput.value = "";
        }

        if (statusFilter) {
            statusFilter.value = "all";
        }

        applyFilters();
    }

    function showRegistrationForm() {
        if (!formPanel) {
            return;
        }

        formPanel.hidden = false;

        if (formMessage) {
            formMessage.textContent = "";
            formMessage.classList.remove("success", "error");
        }

        if (nameInput) {
            nameInput.focus();
        }

        formPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function hideRegistrationForm() {
        if (!formPanel) {
            return;
        }

        formPanel.hidden = true;

        if (formMessage) {
            formMessage.textContent = "";
            formMessage.classList.remove("success", "error");
        }

        if (registrationForm) {
            registrationForm.reset();
        }

        if (showFormButton) {
            showFormButton.focus();
        }
    }

    function displayFormMessage(message, type) {
        if (!formMessage) {
            return;
        }

        formMessage.textContent = message;
        formMessage.classList.remove("success", "error");

        if (type) {
            formMessage.classList.add(type);
        }

        formMessage.setAttribute("role", "status");
        formMessage.setAttribute("aria-live", "polite");
    }

    function createCell(value, className = "") {
        const cell = document.createElement("td");

        if (className) {
            cell.className = className;
        }

        cell.textContent = value;

        return cell;
    }

    function getInitials(fullName) {
        const parts = fullName.trim().split(/\s+/).filter(Boolean);

        if (parts.length === 0) {
            return "ST";
        }

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }

        return (
            parts[0][0] + parts[parts.length - 1][0]
        ).toUpperCase();
    }

    function createStudentRow(student) {
        const row = document.createElement("tr");
        row.dataset.status = student.status;

        /*
         * The table layout follows the existing registration.html:
         * Student, Student Number, Programme, Academic Year, Status, Action.
         */

        const studentCell = document.createElement("td");
        const identity = document.createElement("div");
        identity.className = "student-identity";

        const avatar = document.createElement("span");
        avatar.className = `student-avatar ${
            avatarClasses[avatarStyleIndex % avatarClasses.length]
        }`;
        avatar.textContent = getInitials(student.name);
        avatar.setAttribute("aria-hidden", "true");

        const details = document.createElement("div");
        details.className = "student-identity-details";

        const name = document.createElement("span");
        name.className = "student-name";
        name.textContent = student.name;

        const email = document.createElement("span");
        email.className = "student-email";
        email.textContent = student.email;

        details.append(name, email);
        identity.append(avatar, details);
        studentCell.appendChild(identity);
        row.appendChild(studentCell);

        row.appendChild(
            createCell(student.studentNumber, "student-number-cell")
        );

        row.appendChild(createCell(student.programme));
        row.appendChild(createCell(student.academicYear));

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className =
            student.status === "Registered"
                ? "status-badge status-registered"
                : "status-badge status-pending";

        statusBadge.textContent = student.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.className = "button button-outline button-small";
        viewButton.textContent = "View";
        viewButton.dataset.student = student.studentNumber;
        viewButton.setAttribute(
            "aria-label",
            `View sample record for ${student.name}`
        );

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);

        avatarStyleIndex++;

        return row;
    }

    function showStudentDetails(row) {
        const cells = row.querySelectorAll("td");

        if (cells.length < 5) {
            return;
        }

        const studentName =
            cells[0].querySelector(".student-name")?.textContent.trim() ||
            cells[0].textContent.trim();

        const studentEmail =
            cells[0].querySelector(".student-email")?.textContent.trim() ||
            "Not provided";

        const studentNumber = cells[1].textContent.trim();
        const programme = cells[2].textContent.trim();
        const academicYear = cells[3].textContent.trim();
        const status = getRowStatus(row);

        window.alert(
            "STUDENT REGISTRATION — SAMPLE RECORD\n\n" +
            `Name: ${studentName}\n` +
            `Email: ${studentEmail}\n` +
            `Student number: ${studentNumber}\n` +
            `Programme: ${programme}\n` +
            `Academic year: ${academicYear}\n` +
            `Registration status: ${status}\n\n` +
            "This is demonstration data. No institutional database is connected."
        );
    }

    function handleRegistrationSubmit(event) {
        event.preventDefault();

        if (!registrationForm) {
            return;
        }

        if (!registrationForm.reportValidity()) {
            return;
        }

        const name = nameInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const programme = programmeInput?.value.trim() || "";
        const academicYear = academicYearInput?.value.trim() || "";
        const admissionReference =
            admissionReferenceInput?.value.trim() || "";
        const status = registrationStatusInput?.value || "Pending";

        if (!name || !email || !programme || !academicYear) {
            displayFormMessage(
                "Complete all required fields before saving the sample record.",
                "error"
            );
            return;
        }

        const duplicateEmail = getRows().some((row) => {
            const existingEmail = row.querySelector(".student-email");

            return (
                existingEmail &&
                existingEmail.textContent.trim().toLowerCase() ===
                    email.toLowerCase()
            );
        });

        if (duplicateEmail) {
            displayFormMessage(
                "A sample record with this email address already exists.",
                "error"
            );
            emailInput?.focus();
            return;
        }

        const studentNumber =
            `SLB-${new Date().getFullYear()}-` +
            String(nextStudentNumber).padStart(3, "0");

        const student = {
            name,
            email,
            programme,
            academicYear,
            admissionReference,
            studentNumber,
            status
        };

        const newRow = createStudentRow(student);

        tableBody.appendChild(newRow);

        nextStudentNumber++;

        resetFilters();

        registrationForm.reset();

        displayFormMessage(
            `Sample record added successfully. Student number: ${studentNumber}. ` +
            "This record exists only in the current page session and will not be saved to a database.",
            "success"
        );

        newRow.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", applyFilters);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetFilters);
    }

    if (showFormButton) {
        showFormButton.addEventListener("click", showRegistrationForm);
    }

    if (closeFormButton) {
        closeFormButton.addEventListener("click", hideRegistrationForm);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", hideRegistrationForm);
    }

    if (registrationForm) {
        registrationForm.addEventListener(
            "submit",
            handleRegistrationSubmit
        );
    }

    tableBody.addEventListener("click", (event) => {
        const viewButton = event.target.closest("[data-student]");

        if (!viewButton || !tableBody.contains(viewButton)) {
            return;
        }

        const row = viewButton.closest("tr");

        if (row) {
            showStudentDetails(row);
        }
    });

    /*
     * Initialize the page using the records already present in the HTML.
     */
    getRows().forEach((row) => {
        row.dataset.status = getRowStatus(row);
    });

    if (formPanel) {
        formPanel.hidden = true;
    }

    updateSummary();
    applyFilters();
});
