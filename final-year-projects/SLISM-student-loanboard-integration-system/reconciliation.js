
/* =========================================================
   SLB-IMS — RECONCILIATION MODULE
   File: reconciliation.js

   Prototype only:
   - No live loan-board connection.
   - No bank integration.
   - No persistent database.
   - No real payment verification.
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const elements = {
        totalRecords: $("#recon-total-records"),
        matchedCount: $("#recon-matched-count"),
        reviewCount: $("#recon-review-count"),
        valueDifference: $("#recon-value-difference"),

        search: $("#recon-search"),
        statusFilter: $("#recon-status-filter"),
        yearFilter: $("#recon-year-filter"),
        resetFilters: $("#recon-reset-filters"),
        emptyReset: $("#recon-empty-reset"),

        resultCount: $("#recon-result-count"),
        tableBody: $("#recon-table-body"),
        emptyState: $("#recon-empty-state"),

        showForm: $("#show-recon-form"),
        showFormSecondary: $("#show-recon-form-secondary"),
        formPanel: $("#recon-form-panel"),
        closeForm: $("#close-recon-form"),
        cancelForm: $("#cancel-recon-form"),
        form: $("#recon-record-form"),
        formMessage: $("#recon-form-message"),

        studentNumber: $("#recon-student-number"),
        boardReference: $("#recon-board-reference"),
        academicYear: $("#recon-academic-year"),
        approvedAmount: $("#recon-approved-amount"),
        reportedDisbursement: $("#recon-reported-disbursement"),
        institutionReceipt: $("#recon-institution-receipt"),
        postedAmount: $("#recon-posted-amount"),
        receiptReference: $("#recon-receipt-reference"),
        matchStatus: $("#recon-match-status"),
        notes: $("#recon-notes")
    };

    if (!elements.tableBody || !elements.form) {
        console.error(
            "SLB-IMS Reconciliation: required table or form was not found."
        );
        return;
    }

    const STATUS = Object.freeze({
        MATCHED: "Matched",
        AMOUNT_MISMATCH: "Amount mismatch",
        RECEIPT_PENDING: "Receipt pending",
        POSTING_MISMATCH: "Posting mismatch",
        UNDER_REVIEW: "Under review"
    });

    const moneyFormatter = new Intl.NumberFormat("en-TZ", {
        maximumFractionDigits: 2
    });

    const money = value =>
        `TZS ${moneyFormatter.format(Number(value) || 0)}`;

    const parseAmount = value => {
        const amount = Number(value);
        return Number.isFinite(amount) && amount >= 0 ? amount : 0;
    };

    const readAmount = (row, attribute) =>
        parseAmount(row.dataset[attribute]);

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    function normalized(value) {
        return String(value ?? "").trim().toLowerCase();
    }

    function initials(name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "ST";
    }

    function getStudentName(row) {
        return row.querySelector(".recon-student-cell strong")
            ?.textContent.trim() || "Student record";
    }

    function getStudentNumber(row) {
        return row.dataset.studentNumber || "";
    }

    function getBoardReference(row) {
        return row.dataset.boardReference || "";
    }

    function getAcademicYear(row) {
        return row.dataset.academicYear || "";
    }

    function getStatus(row) {
        return row.dataset.status || STATUS.UNDER_REVIEW;
    }

    function getBoardDisbursed(row) {
        return readAmount(row, "boardDisbursed");
    }

    function getInstitutionReceived(row) {
        return readAmount(row, "institutionReceived");
    }

    function getPostedAmount(row) {
        return readAmount(row, "postedAmount");
    }

    /*
     * Difference is defined consistently as:
     * board-reported disbursement minus verified institutional receipt.
     *
     * A posting mismatch can still exist when this difference is zero.
     * That means the institution's receipt and posted student-account
     * amount need separate investigation.
     */
    function getDifference(row) {
        return getBoardDisbursed(row) - getInstitutionReceived(row);
    }

    function approximatelyEqual(first, second) {
        return Math.abs(first - second) < 0.005;
    }

    function setStatusBadge(row, status) {
        const cell = row.cells[6];
        if (!cell) return;

        const classes = {
            [STATUS.MATCHED]: "recon-status recon-status-matched",
            [STATUS.AMOUNT_MISMATCH]: "recon-status recon-status-mismatch",
            [STATUS.RECEIPT_PENDING]: "recon-status recon-status-pending",
            [STATUS.POSTING_MISMATCH]: "recon-status recon-status-posting",
            [STATUS.UNDER_REVIEW]: "recon-status recon-status-review"
        };

        const badge = document.createElement("span");
        badge.className = classes[status] || classes[STATUS.UNDER_REVIEW];
        badge.textContent = status;

        cell.replaceChildren(badge);
    }

    function setDifferenceCell(row) {
        const cell = row.cells[5];
        if (!cell) return;

        const difference = getDifference(row);
        cell.textContent = money(difference);
        cell.classList.toggle(
            "recon-difference-cell",
            !approximatelyEqual(difference, 0)
        );
    }

    function makeAvatar(name) {
        const avatar = document.createElement("span");
        avatar.className = "recon-avatar";
        avatar.textContent = initials(name);
        avatar.setAttribute("aria-hidden", "true");
        return avatar;
    }

    function createTextElement(tagName, className, textContent) {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        element.textContent = textContent;
        return element;
    }

    function refreshRowPresentation(row) {
        const difference = getDifference(row);

        if (row.cells[5]) {
            row.cells[5].textContent = money(difference);
        }

        setDifferenceCell(row);
        setStatusBadge(row, getStatus(row));
    }

    function createRow(record) {
        const row = document.createElement("tr");

        row.dataset.studentNumber = record.studentNumber;
        row.dataset.boardReference = record.boardReference;
        row.dataset.academicYear = record.academicYear;
        row.dataset.boardDisbursed = String(record.reportedDisbursement);
        row.dataset.institutionReceived = String(record.institutionReceipt);
        row.dataset.postedAmount = String(record.postedAmount);
        row.dataset.approvedAmount = String(record.approvedAmount);
        row.dataset.status = record.status;
        row.dataset.receiptReference = record.receiptReference;
        row.dataset.notes = record.notes;

        const studentCell = document.createElement("td");
        const studentWrapper = document.createElement("div");
        studentWrapper.className = "recon-student-cell";

        studentWrapper.append(
            makeAvatar(record.studentName)
        );

        const studentDetails = document.createElement("div");
        studentDetails.append(
            createTextElement("strong", "", record.studentName),
            createTextElement("small", "", record.studentNumber)
        );

        studentWrapper.append(studentDetails);
        studentCell.append(studentWrapper);

        const referenceCell = document.createElement("td");
        referenceCell.append(
            createTextElement("span", "recon-reference", record.boardReference)
        );

        const yearCell = createTextElement("td", "", record.academicYear);
        const boardCell = createTextElement(
            "td", "", money(record.reportedDisbursement)
        );
        const receivedCell = createTextElement(
            "td", "", money(record.institutionReceipt)
        );
        const differenceCell = createTextElement(
            "td", "recon-difference-cell",
            money(record.reportedDisbursement - record.institutionReceipt)
        );

        const statusCell = document.createElement("td");
        const actionCell = document.createElement("td");

        const reviewButton = document.createElement("button");
        reviewButton.type = "button";
        reviewButton.className = "recon-review-button";
        reviewButton.dataset.student = record.studentNumber;
        reviewButton.dataset.reconId = record.boardReference;
        reviewButton.append(
            document.createTextNode("Review "),
            createTextElement("span", "", "↗")
        );
        reviewButton.lastElementChild.setAttribute("aria-hidden", "true");

        actionCell.append(reviewButton);

        row.append(
            studentCell,
            referenceCell,
            yearCell,
            boardCell,
            receivedCell,
            differenceCell,
            statusCell,
            actionCell
        );

        setStatusBadge(row, record.status);
        return row;
    }

    function readInitialRecords() {
        return $$("#recon-table-body > tr").map((row, index) => ({
            studentNumber: getStudentNumber(row),
            boardReference: getBoardReference(row),
            academicYear: getAcademicYear(row),
            reportedDisbursement: getBoardDisbursed(row),
            institutionReceipt: getInstitutionReceived(row),
            postedAmount: getPostedAmount(row),
            status: getStatus(row),
            rowIndex: index
        }));
    }

    /*
     * Existing HTML rows are the initial data source.
     * The module does not fabricate a connection to an external service.
     */
    let records = readInitialRecords();

    function syncRecordsFromTable() {
        records = $$("#recon-table-body > tr").map(row => ({
            studentNumber: getStudentNumber(row),
            boardReference: getBoardReference(row),
            academicYear: getAcademicYear(row),
            reportedDisbursement: getBoardDisbursed(row),
            institutionReceipt: getInstitutionReceived(row),
            postedAmount: getPostedAmount(row),
            status: getStatus(row)
        }));
    }

    function updateSummary(visibleRows) {
        const allRows = $$("#recon-table-body > tr");

        const matched = allRows.filter(row =>
            getStatus(row) === STATUS.MATCHED
        );

        const requiresReview = allRows.filter(row =>
            getStatus(row) !== STATUS.MATCHED
        );

        const netDifference = allRows.reduce(
            (total, row) => total + getDifference(row),
            0
        );

        if (elements.totalRecords) {
            elements.totalRecords.textContent = String(allRows.length);
        }

        if (elements.matchedCount) {
            elements.matchedCount.textContent = String(matched.length);
        }

        if (elements.reviewCount) {
            elements.reviewCount.textContent = String(requiresReview.length);
        }

        if (elements.valueDifference) {
            elements.valueDifference.textContent = money(netDifference);
        }

        if (elements.resultCount) {
            const count = visibleRows.length;
            elements.resultCount.textContent =
                `${count} ${count === 1 ? "record" : "records"} shown`;
        }
    }

    function matchesSearch(row, query) {
        if (!query) return true;

        const haystack = [
            getStudentName(row),
            getStudentNumber(row),
            getBoardReference(row),
            getAcademicYear(row),
            getStatus(row)
        ].join(" ");

        return normalized(haystack).includes(query);
    }

    function applyFilters() {
        const query = normalized(elements.search?.value);
        const selectedStatus = elements.statusFilter?.value || "all";
        const selectedYear = elements.yearFilter?.value || "all";

        const allRows = $$("#recon-table-body > tr");
        const visibleRows = [];

        allRows.forEach(row => {
            const matches =
                matchesSearch(row, query) &&
                (selectedStatus === "all" ||
                    getStatus(row) === selectedStatus) &&
                (selectedYear === "all" ||
                    getAcademicYear(row) === selectedYear);

            row.hidden = !matches;

            if (matches) {
                visibleRows.push(row);
            }
        });

        if (elements.emptyState) {
            elements.emptyState.hidden = visibleRows.length > 0;
        }

        if (elements.tableBody.closest(".recon-table-scroll")) {
            elements.tableBody.closest(".recon-table-scroll").hidden =
                visibleRows.length === 0;
        }

        updateSummary(visibleRows);
    }

    function resetFilters() {
        if (elements.search) elements.search.value = "";
        if (elements.statusFilter) elements.statusFilter.value = "all";
        if (elements.yearFilter) elements.yearFilter.value = "all";

        applyFilters();
    }

    function showMessage(message, type = "") {
        if (!elements.formMessage) return;

        elements.formMessage.textContent = message;
        elements.formMessage.className = "recon-form-message";

        if (type === "error") {
            elements.formMessage.classList.add("is-error");
        } else if (type === "success") {
            elements.formMessage.classList.add("is-success");
        }
    }

    function openForm(record = null) {
        if (!elements.formPanel) return;

        elements.formPanel.hidden = false;
        showMessage("");

        if (record) {
            elements.studentNumber.value = record.studentNumber || "";
            elements.boardReference.value = record.boardReference || "";
            elements.academicYear.value = record.academicYear || "2026/2027";

            if (elements.approvedAmount) {
                elements.approvedAmount.value =
                    record.approvedAmount ?? "";
            }

            elements.reportedDisbursement.value =
                record.reportedDisbursement ?? "";

            elements.institutionReceipt.value =
                record.institutionReceipt ?? "";

            elements.postedAmount.value = record.postedAmount ?? "";

            elements.receiptReference.value =
                record.receiptReference || "";

            elements.matchStatus.value =
                record.status || STATUS.UNDER_REVIEW;

            elements.notes.value = record.notes || "";
        } else {
            elements.form.reset();
            elements.academicYear.value = "2026/2027";
            elements.matchStatus.value = STATUS.UNDER_REVIEW;
        }

        elements.formPanel.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            block: "start"
        });

        window.setTimeout(() => {
            elements.studentNumber?.focus({ preventScroll: true });
        }, 50);
    }

    function closeForm() {
        if (elements.formPanel) {
            elements.formPanel.hidden = true;
        }

        showMessage("");
    }

    function getFormRecord() {
        return {
            studentNumber: elements.studentNumber.value.trim(),
            boardReference: elements.boardReference.value.trim(),
            academicYear: elements.academicYear.value,
            approvedAmount: parseAmount(elements.approvedAmount?.value),
            reportedDisbursement: parseAmount(
                elements.reportedDisbursement.value
            ),
            institutionReceipt: parseAmount(
                elements.institutionReceipt.value
            ),
            postedAmount: parseAmount(elements.postedAmount.value),
            receiptReference: elements.receiptReference.value.trim(),
            status: elements.matchStatus.value,
            notes: elements.notes.value.trim()
        };
    }

    function validateRecord(record) {
        const numericFields = [
            ["Approved amount", elements.approvedAmount],
            ["Reported disbursement", elements.reportedDisbursement],
            ["Institution receipt", elements.institutionReceipt],
            ["Posted amount", elements.postedAmount]
        ];

        for (const [label, input] of numericFields) {
            if (!input) continue;

            if (input.value.trim() !== "" &&
                (!Number.isFinite(Number(input.value)) ||
                    Number(input.value) < 0)) {
                return `${label} must be a valid non-negative amount.`;
            }
        }

        if (!record.studentNumber) {
            return "Enter the student's institutional number.";
        }

        if (!record.boardReference) {
            return "Enter the loan-board reference.";
        }

        const duplicate = $$("#recon-table-body > tr").some(row =>
            getStudentNumber(row) === record.studentNumber &&
            getBoardReference(row) === record.boardReference
        );

        if (duplicate) {
            return "A record with this student number and board reference already exists.";
        }

        if (record.institutionReceipt > 0 && !record.receiptReference) {
            return "Enter the receipt or transaction reference for a reported institutional receipt.";
        }

        if (
            record.status === STATUS.MATCHED &&
            (
                !approximatelyEqual(
                    record.reportedDisbursement,
                    record.institutionReceipt
                ) ||
                !approximatelyEqual(
                    record.institutionReceipt,
                    record.postedAmount
                ) ||
                record.institutionReceipt <= 0 ||
                !record.receiptReference
            )
        ) {
            return "A record can be marked Matched only when the reported disbursement, verified receipt and posted amount agree, a receipt reference is provided, and the receipt is greater than zero.";
        }

        if (
            record.status === STATUS.AMOUNT_MISMATCH &&
            approximatelyEqual(
                record.reportedDisbursement,
                record.institutionReceipt
            )
        ) {
            return "The board-reported amount and institutional receipt are equal. Select another status or verify the amounts.";
        }

        if (
            record.status === STATUS.POSTING_MISMATCH &&
            approximatelyEqual(
                record.institutionReceipt,
                record.postedAmount
            )
        ) {
            return "The institutional receipt and posted amount agree. Select another status or verify the posting.";
        }

        if (
            record.status === STATUS.RECEIPT_PENDING &&
            record.institutionReceipt > 0
        ) {
            return "A receipt-pending record cannot have a positive verified institutional receipt. Verify the evidence or choose another status.";
        }

        if (
            record.status === STATUS.POSTING_MISMATCH &&
            record.institutionReceipt <= 0
        ) {
            return "A posting mismatch requires a verified institutional receipt to compare against the posted amount.";
        }

        return "";
    }

    function buildRecordFromRow(row) {
        return {
            studentNumber: getStudentNumber(row),
            boardReference: getBoardReference(row),
            academicYear: getAcademicYear(row),
            approvedAmount: readAmount(row, "approvedAmount"),
            reportedDisbursement: getBoardDisbursed(row),
            institutionReceipt: getInstitutionReceived(row),
            postedAmount: getPostedAmount(row),
            receiptReference: row.dataset.receiptReference || "",
            status: getStatus(row),
            notes: row.dataset.notes || "",
            studentName: getStudentName(row)
        };
    }

    function reviewRecord(studentNumber, boardReference) {
        const row = $$("#recon-table-body > tr").find(candidate =>
            getStudentNumber(candidate) === studentNumber &&
            getBoardReference(candidate) === boardReference
        );

        if (!row) {
            showMessage("The selected reconciliation record could not be found.", "error");
            openForm();
            return;
        }

        const record = buildRecordFromRow(row);

        /*
         * Keep the existing record in the register.
         * Review opens the form with its values for inspection.
         * The prototype does not imply external evidence has been verified.
         */
        openForm(record);

        showMessage(
            `Reviewing ${record.studentNumber}. Confirm the source evidence before changing its reconciliation status.`,
            ""
        );

        /*
         * Editing an existing row is intentionally not performed by the
         * generic create form. Prevent duplicate submissions for a record
         * opened from Review by setting its edit reference.
         */
        elements.form.dataset.editStudentNumber = record.studentNumber;
        elements.form.dataset.editBoardReference = record.boardReference;
    }

    function deriveStatus(record) {
        const difference = record.reportedDisbursement -
            record.institutionReceipt;

        if (record.institutionReceipt <= 0 &&
            record.reportedDisbursement > 0) {
            return STATUS.RECEIPT_PENDING;
        }

        if (!approximatelyEqual(difference, 0)) {
            return STATUS.AMOUNT_MISMATCH;
        }

        if (!approximatelyEqual(
            record.institutionReceipt,
            record.postedAmount
        )) {
            return STATUS.POSTING_MISMATCH;
        }

        return STATUS.MATCHED;
    }

    function resetEditState() {
        delete elements.form.dataset.editStudentNumber;
        delete elements.form.dataset.editBoardReference;
    }

    function updateExistingRow(row, record) {
        const studentCell = row.cells[0];
        const studentWrapper = studentCell?.querySelector(".recon-student-cell");

        if (studentWrapper) {
            const details = studentWrapper.querySelector("div");

            if (details) {
                details.replaceChildren(
                    createTextElement("strong", "", record.studentName),
                    createTextElement("small", "", record.studentNumber)
                );
            }
        }

        if (row.cells[1]) {
            row.cells[1].replaceChildren(
                createTextElement("span", "recon-reference", record.boardReference)
            );
        }

        if (row.cells[2]) {
            row.cells[2].textContent = record.academicYear;
        }

        if (row.cells[3]) {
            row.cells[3].textContent = money(record.reportedDisbursement);
        }

        if (row.cells[4]) {
            row.cells[4].textContent = money(record.institutionReceipt);
        }

        if (row.cells[5]) {
            row.cells[5].textContent = money(
                record.reportedDisbursement - record.institutionReceipt
            );
        }

        row.dataset.studentNumber = record.studentNumber;
        row.dataset.boardReference = record.boardReference;
        row.dataset.academicYear = record.academicYear;
        row.dataset.boardDisbursed = String(record.reportedDisbursement);
        row.dataset.institutionReceived = String(record.institutionReceipt);
        row.dataset.postedAmount = String(record.postedAmount);
        row.dataset.approvedAmount = String(record.approvedAmount);
        row.dataset.status = record.status;
        row.dataset.receiptReference = record.receiptReference;
        row.dataset.notes = record.notes;

        const reviewButton = row.querySelector(".recon-review-button");

        if (reviewButton) {
            reviewButton.dataset.student = record.studentNumber;
            reviewButton.dataset.reconId = record.boardReference;
        }

        refreshRowPresentation(row);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const record = getFormRecord();

        const editStudentNumber =
            elements.form.dataset.editStudentNumber || "";

        const editBoardReference =
            elements.form.dataset.editBoardReference || "";

        const existingRow = editStudentNumber && editBoardReference
            ? $$("#recon-table-body > tr").find(row =>
                getStudentNumber(row) === editStudentNumber &&
                getBoardReference(row) === editBoardReference
            )
            : null;

        if (
            existingRow &&
            (
                record.studentNumber !== editStudentNumber ||
                record.boardReference !== editBoardReference
            )
        ) {
            const duplicate = $$("#recon-table-body > tr").some(row =>
                row !== existingRow &&
                getStudentNumber(row) === record.studentNumber &&
                getBoardReference(row) === record.boardReference
            );

            if (duplicate) {
                showMessage(
                    "Another record already uses this student number and board reference.",
                    "error"
                );
                return;
            }
        }

        if (!existingRow) {
            const error = validateRecord(record);

            if (error) {
                showMessage(error, "error");
                return;
            }
        } else {
            const numericFields = [
                ["Approved amount", elements.approvedAmount],
                ["Reported disbursement", elements.reportedDisbursement],
                ["Institution receipt", elements.institutionReceipt],
                ["Posted amount", elements.postedAmount]
            ];

            for (const [label, input] of numericFields) {
                if (
                    input &&
                    input.value.trim() !== "" &&
                    (!Number.isFinite(Number(input.value)) ||
                        Number(input.value) < 0)
                ) {
                    showMessage(
                        `${label} must be a valid non-negative amount.`,
                        "error"
                    );
                    return;
                }
            }

            if (
                record.institutionReceipt > 0 &&
                !record.receiptReference
            ) {
                showMessage(
                    "Enter the receipt or transaction reference for a reported institutional receipt.",
                    "error"
                );
                return;
            }

            if (
                record.status === STATUS.MATCHED &&
                (
                    !approximatelyEqual(
                        record.reportedDisbursement,
                        record.institutionReceipt
                    ) ||
                    !approximatelyEqual(
                        record.institutionReceipt,
                        record.postedAmount
                    ) ||
                    record.institutionReceipt <= 0 ||
                    !record.receiptReference
                )
            ) {
                showMessage(
                    "A record can be marked Matched only when all three amounts agree, a receipt reference is supplied, and the receipt is greater than zero.",
                    "error"
                );
                return;
            }

            if (
                record.status === STATUS.AMOUNT_MISMATCH &&
                approximatelyEqual(
                    record.reportedDisbursement,
                    record.institutionReceipt
                )
            ) {
                showMessage(
                    "The board-reported amount and institutional receipt are equal. Verify the amounts or choose another status.",
                    "error"
                );
                return;
            }

            if (
                record.status === STATUS.POSTING_MISMATCH &&
                approximatelyEqual(
                    record.institutionReceipt,
                    record.postedAmount
                )
            ) {
                showMessage(
                    "The institutional receipt and posted amount agree. Verify the posting or choose another status.",
                    "error"
                );
                return;
            }

            if (
                record.status === STATUS.RECEIPT_PENDING &&
                record.institutionReceipt > 0
            ) {
                showMessage(
                    "A receipt-pending record cannot have a positive verified institutional receipt.",
                    "error"
                );
                return;
            }

            if (
                record.status === STATUS.POSTING_MISMATCH &&
                record.institutionReceipt <= 0
            ) {
                showMessage(
                    "A posting mismatch requires a verified institutional receipt.",
                    "error"
                );
                return;
            }
        }

        /*
         * Store the current form status rather than automatically marking
         * the record matched. A real implementation should additionally
         * require role authorization and evidence verification.
         */
        if (existingRow) {
            updateExistingRow(existingRow, record);
        } else {
            record.studentName = record.studentNumber;
            const newRow = createRow(record);
            elements.tableBody.prepend(newRow);
        }

        syncRecordsFromTable();
        resetEditState();
        elements.form.reset();

        showMessage(
            "Sample record saved in this page session. No external system or database was updated.",
            "success"
        );

        applyFilters();

        /*
         * Keep the confirmation visible briefly, then close the panel.
         * The record remains in the page's current in-memory table.
         */
        window.setTimeout(() => {
            closeForm();
        }, 1200);
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    elements.search?.addEventListener("input", applyFilters);
    elements.statusFilter?.addEventListener("change", applyFilters);
    elements.yearFilter?.addEventListener("change", applyFilters);

    elements.resetFilters?.addEventListener("click", resetFilters);
    elements.emptyReset?.addEventListener("click", resetFilters);

    elements.showForm?.addEventListener("click", () => {
        resetEditState();
        openForm();
    });

    elements.showFormSecondary?.addEventListener("click", () => {
        resetEditState();
        openForm();
    });

    elements.closeForm?.addEventListener("click", closeForm);
    elements.cancelForm?.addEventListener("click", closeForm);

    elements.form.addEventListener("submit", handleSubmit);

    /*
     * Event delegation means newly created table rows work without
     * attaching individual listeners to every Review button.
     */
    elements.tableBody.addEventListener("click", event => {
        const button = event.target.closest(".recon-review-button");

        if (!button) return;

        const studentNumber = button.dataset.student;
        const boardReference = button.dataset.reconId;

        reviewRecord(studentNumber, boardReference);
    });

    /*
     * Escape closes the form when it is open.
     */
    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            elements.formPanel &&
            !elements.formPanel.hidden
        ) {
            closeForm();
        }
    });

    /*
     * If the user changes any amount while a record is being reviewed,
     * show the arithmetic result without silently changing its status.
     */
    [
        elements.reportedDisbursement,
        elements.institutionReceipt,
        elements.postedAmount
    ].forEach(input => {
        input?.addEventListener("input", () => {
            const board = parseAmount(elements.reportedDisbursement.value);
            const received = parseAmount(elements.institutionReceipt.value);
            const posted = parseAmount(elements.postedAmount.value);

            if (
                elements.formPanel &&
                !elements.formPanel.hidden
            ) {
                const difference = board - received;

                if (approximatelyEqual(difference, 0) &&
                    approximatelyEqual(received, posted)) {
                    showMessage(
                        "Amounts agree arithmetically. Confirm the source evidence and receipt reference before selecting Matched.",
                        ""
                    );
                } else {
                    showMessage(
                        `Board-reported minus institution-received: ${money(difference)}. Institution-received minus account-posted: ${money(received - posted)}. Verify both differences before resolving the record.`,
                        ""
                    );
                }
            }
        });
    });

    /*
     * Ensure all initial row differences and status badges are consistent.
     */
    $$("#recon-table-body > tr").forEach(row => {
        refreshRowPresentation(row);
    });

    syncRecordsFromTable();
    applyFilters();

    console.info(
        "SLB-IMS Reconciliation initialized. Prototype mode: no live integrations."
    );
});
