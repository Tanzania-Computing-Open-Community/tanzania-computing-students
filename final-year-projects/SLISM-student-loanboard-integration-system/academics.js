
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("programme-table-body");
    const searchInput = document.getElementById("programme-search");
    const departmentFilter = document.getElementById("department-filter");
    const resetButton = document.getElementById("reset-programme-filters");
    const emptyState = document.getElementById("programme-empty-state");
    const resultCount = document.getElementById("programme-result-count");

    const totalProgrammes = document.getElementById("total-programmes");
    const totalDepartments = document.getElementById("total-departments");
    const totalSemesters = document.getElementById("total-semesters");
    const totalAcademicRecords = document.getElementById(
        "total-academic-records"
    );

    const showFormButton = document.getElementById("show-programme-form");
    const showFormButtonSecondary = document.getElementById(
        "show-programme-form-secondary"
    );
    const formPanel = document.getElementById("programme-form-panel");
    const programmeForm = document.getElementById("programme-form");
    const closeFormButton = document.getElementById("close-programme-form");
    const cancelFormButton = document.getElementById("cancel-programme-form");
    const formMessage = document.getElementById("programme-form-message");

    const programmeNameInput = document.getElementById("programme-name");
    const programmeCodeInput = document.getElementById("programme-code");
    const programmeDepartmentInput = document.getElementById(
        "programme-department"
    );
    const programmeDurationInput = document.getElementById(
        "programme-duration"
    );

    const progressBody = document.getElementById("academic-progress-body");

    if (!tableBody) {
        console.error(
            "Academic management initialization failed: programme-table-body was not found."
        );
        return;
    }

    const programmeIconClasses = [
        "blue-icon",
        "teal-icon",
        "gold-icon",
        "purple-icon"
    ];

    let nextProgrammeNumber = tableBody.querySelectorAll("tr").length + 1;

    function getProgrammeRows() {
        return Array.from(tableBody.querySelectorAll("tr"));
    }

    function getDepartment(row) {
        return (
            row.dataset.department ||
            row.children[2]?.textContent.trim() ||
            ""
        );
    }

    function getProgrammeName(row) {
        return (
            row.querySelector(".programme-cell strong")?.textContent.trim() ||
            row.children[0]?.textContent.trim() ||
            ""
        );
    }

    function getProgrammeCode(row) {
        return (
            row.querySelector(".academic-code")?.textContent.trim() ||
            row.children[1]?.textContent.trim() ||
            ""
        );
    }

    function updateSummary() {
        const rows = getProgrammeRows();
        const departments = new Set(
            rows
                .map(getDepartment)
                .filter((department) => department.length > 0)
        );

        if (totalProgrammes) {
            totalProgrammes.textContent = rows.length;
        }

        if (totalDepartments) {
            totalDepartments.textContent = departments.size;
        }

        /*
         * The calendar contains two illustrative semester cards.
         * Count the actual cards instead of presenting a fabricated live metric.
         */
        if (totalSemesters) {
            totalSemesters.textContent = document.querySelectorAll(
                ".semester-card"
            ).length;
        }

        /*
         * Count the academic progress entries currently displayed in the HTML.
         * These are illustrative records, not connected student results.
         */
        if (totalAcademicRecords && progressBody) {
            totalAcademicRecords.textContent =
                progressBody.querySelectorAll("tr").length;
        }
    }

    function updateResultCount(count) {
        if (!resultCount) {
            return;
        }

        const label = count === 1 ? "programme" : "programmes";

        resultCount.textContent =
            `${count} ${label} shown — prototype data`;
    }

    function applyFilters() {
        const query = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedDepartment = departmentFilter
            ? departmentFilter.value
            : "all";

        let visibleCount = 0;

        getProgrammeRows().forEach((row) => {
            const rowText = row.textContent.toLowerCase();
            const rowDepartment = getDepartment(row);

            const matchesSearch = rowText.includes(query);

            const matchesDepartment =
                selectedDepartment === "all" ||
                rowDepartment.toLowerCase() ===
                    selectedDepartment.toLowerCase();

            const isVisible = matchesSearch && matchesDepartment;

            row.hidden = !isVisible;

            if (isVisible) {
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

        if (departmentFilter) {
            departmentFilter.value = "all";
        }

        applyFilters();
    }

    function showProgrammeForm() {
        if (!formPanel) {
            return;
        }

        formPanel.hidden = false;

        if (formMessage) {
            formMessage.textContent = "";
            formMessage.classList.remove("success", "error");
        }

        formPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        window.setTimeout(() => {
            programmeNameInput?.focus();
        }, 100);
    }

    function hideProgrammeForm() {
        if (formPanel) {
            formPanel.hidden = true;
        }

        if (programmeForm) {
            programmeForm.reset();
        }

        if (formMessage) {
            formMessage.textContent = "";
            formMessage.classList.remove("success", "error");
        }
    }

    function showFormMessage(message, type = "") {
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

    function normalizeCode(code) {
        return code.trim().toUpperCase();
    }

    function createTableCell(text, className = "") {
        const cell = document.createElement("td");

        if (className) {
            cell.className = className;
        }

        cell.textContent = text;

        return cell;
    }

    function createProgrammeRow(programme) {
        const row = document.createElement("tr");
        row.dataset.department = programme.department;

        const number = String(nextProgrammeNumber).padStart(2, "0");
        const iconClass =
            programmeIconClasses[
                (nextProgrammeNumber - 1) % programmeIconClasses.length
            ];

        const programmeCell = document.createElement("td");
        const programmeContainer = document.createElement("div");
        programmeContainer.className = "programme-cell";

        const icon = document.createElement("span");
        icon.className = `programme-cell-icon ${iconClass}`;
        icon.textContent = number;
        icon.setAttribute("aria-hidden", "true");

        const details = document.createElement("span");

        const name = document.createElement("strong");
        name.textContent = programme.name;

        const description = document.createElement("small");
        description.textContent = "Sample undergraduate programme";

        details.append(name, description);
        programmeContainer.append(icon, details);
        programmeCell.appendChild(programmeContainer);
        row.appendChild(programmeCell);

        const codeCell = createTableCell("", "programme-code-cell");
        const codeBadge = document.createElement("span");
        codeBadge.className = "academic-code";
        codeBadge.textContent = programme.code;
        codeCell.appendChild(codeBadge);
        row.appendChild(codeCell);

        row.appendChild(createTableCell(programme.department));
        row.appendChild(createTableCell(programme.duration));

        const actionCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.className =
            "button button-outline button-small view-programme";
        viewButton.textContent = "View";
        viewButton.dataset.programme = programme.code;
        viewButton.setAttribute(
            "aria-label",
            `View details for ${programme.name}`
        );

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);

        nextProgrammeNumber++;

        return row;
    }

    function showProgrammeDetails(row) {
        const name = getProgrammeName(row);
        const code = getProgrammeCode(row);
        const department = getDepartment(row);
        const duration = row.children[3]?.textContent.trim() || "Not specified";

        window.alert(
            "ACADEMIC PROGRAMME — SAMPLE DETAILS\n\n" +
            `Programme: ${name}\n` +
            `Programme code: ${code}\n` +
            `Department: ${department}\n` +
            `Duration: ${duration}\n\n` +
            "This is demonstration data. No official academic catalogue is connected."
        );
    }

    function handleProgrammeSubmit(event) {
        event.preventDefault();

        if (!programmeForm || !programmeForm.reportValidity()) {
            return;
        }

        const name = programmeNameInput?.value.trim() || "";
        const code = normalizeCode(programmeCodeInput?.value || "");
        const department = programmeDepartmentInput?.value.trim() || "";
        const duration = programmeDurationInput?.value || "";

        if (!name || !code || !department || !duration) {
            showFormMessage(
                "Complete all required fields before saving the sample programme.",
                "error"
            );
            return;
        }

        const duplicateCode = getProgrammeRows().some(
            (row) => getProgrammeCode(row).toUpperCase() === code
        );

        if (duplicateCode) {
            showFormMessage(
                `Programme code "${code}" already exists in this sample catalogue.`,
                "error"
            );

            programmeCodeInput?.focus();
            return;
        }

        const duplicateName = getProgrammeRows().some(
            (row) =>
                getProgrammeName(row).toLowerCase() === name.toLowerCase() &&
                getDepartment(row).toLowerCase() === department.toLowerCase()
        );

        if (duplicateName) {
            showFormMessage(
                "A programme with this name already exists in the selected department.",
                "error"
            );

            programmeNameInput?.focus();
            return;
        }

        const programme = {
            name,
            code,
            department,
            duration
        };

        const newRow = createProgrammeRow(programme);

        tableBody.appendChild(newRow);

        /*
         * If the department is new, make it available in the filter.
         * The filter remains a local interface control.
         */
        ensureDepartmentFilterOption(department);

        resetFilters();
        programmeForm.reset();

        showFormMessage(
            `Sample programme "${name}" (${code}) was added to this page. ` +
            "It has not been saved to an institutional database.",
            "success"
        );

        updateSummary();

        newRow.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    function ensureDepartmentFilterOption(department) {
        if (!departmentFilter) {
            return;
        }

        const exists = Array.from(departmentFilter.options).some(
            (option) =>
                option.value.toLowerCase() === department.toLowerCase()
        );

        if (exists) {
            return;
        }

        const option = document.createElement("option");
        option.value = department;
        option.textContent = department;

        departmentFilter.appendChild(option);
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (departmentFilter) {
        departmentFilter.addEventListener("change", applyFilters);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetFilters);
    }

    if (showFormButton) {
        showFormButton.addEventListener("click", showProgrammeForm);
    }

    if (showFormButtonSecondary) {
        showFormButtonSecondary.addEventListener(
            "click",
            showProgrammeForm
        );
    }

    if (closeFormButton) {
        closeFormButton.addEventListener("click", hideProgrammeForm);
    }

    if (cancelFormButton) {
        cancelFormButton.addEventListener("click", hideProgrammeForm);
    }

    if (programmeForm) {
        programmeForm.addEventListener(
            "submit",
            handleProgrammeSubmit
        );
    }

    tableBody.addEventListener("click", (event) => {
        const viewButton = event.target.closest(".view-programme");

        if (!viewButton || !tableBody.contains(viewButton)) {
            return;
        }

        const row = viewButton.closest("tr");

        if (row) {
            showProgrammeDetails(row);
        }
    });

    /*
     * Initialize department attributes and catalogue controls.
     */
    getProgrammeRows().forEach((row) => {
        row.dataset.department = getDepartment(row);
    });

    if (formPanel) {
        formPanel.hidden = true;
    }

    updateSummary();
    applyFilters();
});
