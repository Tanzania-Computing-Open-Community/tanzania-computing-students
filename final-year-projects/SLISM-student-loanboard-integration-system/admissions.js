
/* =========================================================
   SLB-IMS — ADMISSIONS MANAGEMENT
   File: admissions.js

   Front-end prototype only.
   No database, API, or real student records are connected.
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("applicant-search");
    const statusFilter = document.getElementById("status-filter");
    const resetButton = document.getElementById("reset-filters");
    const applicationsBody = document.getElementById("applications-body");
    const emptyState = document.getElementById("empty-state");
    const applicationCount = document.getElementById("application-count");

    if (
        !searchInput ||
        !statusFilter ||
        !resetButton ||
        !applicationsBody ||
        !emptyState ||
        !applicationCount
    ) {
        console.error(
            "SLB-IMS Admissions: Required workspace elements were not found."
        );
        return;
    }

    const applicationRows = Array.from(
        applicationsBody.querySelectorAll("tr")
    );

    /*
     * Keep the initial sample data unchanged.
     * Search operates only on the records rendered in this page.
     */

    function getRowStatus(row) {
        const statusElement = row.querySelector(".application-status");

        return statusElement
            ? statusElement.textContent.trim()
            : "";
    }

    function filterApplications() {
        const query = searchInput.value.trim().toLocaleLowerCase();
        const selectedStatus = statusFilter.value;

        let visibleCount = 0;

        applicationRows.forEach((row) => {
            const rowText = row.textContent.toLocaleLowerCase();
            const matchesSearch = rowText.includes(query);

            const rowStatus = getRowStatus(row);
            const matchesStatus =
                selectedStatus === "all" ||
                rowStatus === selectedStatus;

            const shouldDisplay = matchesSearch && matchesStatus;

            row.hidden = !shouldDisplay;

            if (shouldDisplay) {
                visibleCount++;
            }
        });

        emptyState.hidden = visibleCount !== 0;

        applicationCount.textContent =
            visibleCount === 1
                ? "1 illustrative application"
                : `${visibleCount} illustrative applications`;
    }

    function resetFilters() {
        searchInput.value = "";
        statusFilter.value = "all";

        filterApplications();
        searchInput.focus();
    }

    function showApplicationDetails(applicationId) {
        const row = applicationRows.find((item) => {
            const idElement = item.querySelector(".application-id");

            return (
                idElement &&
                idElement.textContent.trim() === applicationId
            );
        });

        if (!row) {
            window.alert("Application record could not be found.");
            return;
        }

        const applicantName =
            row.querySelector(".applicant-cell strong")
                ?.textContent.trim() || "Not available";

        const applicantEmail =
            row.querySelector(".applicant-cell small")
                ?.textContent.trim() || "Not available";

        const programme = row.cells[2]?.textContent.trim() || "Not available";
        const submissionDate =
            row.cells[3]?.textContent.trim() || "Not available";

        const status = getRowStatus(row);

        /*
         * Display-only review.
         * This does not approve, reject, or modify an application.
         */

        window.alert(
            "APPLICATION REVIEW\n\n" +
            `Application ID: ${applicationId}\n` +
            `Applicant: ${applicantName}\n` +
            `Contact: ${applicantEmail}\n` +
            `Programme: ${programme}\n` +
            `Submitted: ${submissionDate}\n` +
            `Current status: ${status}\n\n` +
            "Prototype notice: This is illustrative data. " +
            "No admission decision has been changed."
        );
    }

    searchInput.addEventListener("input", filterApplications);
    statusFilter.addEventListener("change", filterApplications);
    resetButton.addEventListener("click", resetFilters);

    applicationsBody.addEventListener("click", (event) => {
        const reviewButton = event.target.closest("[data-application]");

        if (!reviewButton) {
            return;
        }

        const applicationId = reviewButton.dataset.application;

        if (applicationId) {
            showApplicationDetails(applicationId);
        }
    });

    /*
     * Initialise the workspace using the current sample records.
     */
    filterApplications();
});
