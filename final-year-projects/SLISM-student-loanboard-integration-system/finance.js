
/* =========================================================
   SLB-IMS — STUDENT FINANCE
   File: finance.js

   Front-end prototype only:
   - No backend or database connection
   - No real payment processing
   - No real loan-board integration
   - Changes exist only in the current page session
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("finance-table-body");
    const searchInput = document.getElementById("finance-search");
    const statusFilter = document.getElementById("finance-status-filter");
    const fundingFilter = document.getElementById("finance-funding-filter");
    const resetFiltersButton = document.getElementById("reset-finance-filters");
    const emptyState = document.getElementById("finance-empty-state");
    const resultCount = document.getElementById("finance-result-count");

    const feePanel = document.getElementById("fee-form-panel");
    const paymentPanel = document.getElementById("payment-form-panel");

    const feeForm = document.getElementById("fee-assessment-form");
    const paymentForm = document.getElementById("payment-record-form");

    const feeMessage = document.getElementById("fee-form-message");
    const paymentMessage = document.getElementById("payment-form-message");

    const yearSelector = document.getElementById("finance-academic-year");
    const exportButton = document.getElementById("export-finance-records");

    if (!tableBody) {
        console.error("SLB-IMS Finance: finance-table-body was not found.");
        return;
    }

    /*
     * Read the initial illustrative records from the HTML.
     * All monetary values are represented internally as numbers in TZS.
     */

    const records = Array.from(tableBody.querySelectorAll("tr")).map((row) => {
        const cells = row.querySelectorAll("td");
        const studentCell = cells[0];
        const studentName = studentCell?.querySelector("strong")?.textContent.trim() || "";
        const studentNumber =
            studentCell?.querySelector("small")?.textContent.trim() ||
            row.dataset.student ||
            "";

        const programme =
            studentCell?.querySelector("div span")?.textContent.trim() || "";

        return {
            studentNumber,
            studentName,
            programme,
            academicYear: "2026/27",
            assessed: Number(row.dataset.assessed || 0),
            received: Number(row.dataset.received || 0),
            pending: Number(row.dataset.pending || 0),
            funding: row.dataset.funding || "Self-funded",
            status: row.dataset.status || "Balance due",
            notes: "",
            element: row
        };
    });

    /*
     * Illustrative finance records are session-only.
     * Do not treat these records as verified institutional data.
     */

    const moneyFormatter = new Intl.NumberFormat("en-TZ", {
        maximumFractionDigits: 0
    });

    const formatMoney = (amount) => {
        return `TZS ${moneyFormatter.format(Math.max(0, Number(amount) || 0))}`;
    };

    const escapeCSV = (value) => {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    };

    const getBalance = (record) => {
        return Math.max(0, record.assessed - record.received);
    };

    const getRecordStatus = (record) => {
        const balance = getBalance(record);

        if (record.reviewRequired) {
            return "Reconciliation review";
        }

        if (balance === 0 && record.assessed > 0) {
            return "Paid";
        }

        if (record.pending > 0 && record.received > 0) {
            return "Funding pending";
        }

        if (record.pending > 0 && record.received === 0) {
            return "Funding pending";
        }

        if (record.received > 0 && balance > 0) {
            return "Partially paid";
        }

        return "Balance due";
    };

    /*
     * Status presentation
     */

    const statusClass = (status) => {
        const classes = {
            "Paid": "status-paid",
            "Partially paid": "status-partial",
            "Funding pending": "status-funding",
            "Balance due": "status-due",
            "Reconciliation review": "status-review"
        };

        return classes[status] || "status-due";
    };

    const setMessage = (element, message, type = "success") => {
        if (!element) return;

        element.textContent = message;
        element.classList.remove("is-error", "is-warning");

        if (type === "error") {
            element.classList.add("is-error");
        } else if (type === "warning") {
            element.classList.add("is-warning");
        }
    };

    const clearMessage = (element) => {
        if (!element) return;

        element.textContent = "";
        element.classList.remove("is-error", "is-warning");
    };

    /*
     * Build table cells using textContent, rather than inserting
     * user-provided values as HTML.
     */

    const createCell = (text, className = "") => {
        const cell = document.createElement("td");
        cell.textContent = text;

        if (className) {
            cell.className = className;
        }

        return cell;
    };

    const createStudentCell = (record) => {
        const cell = document.createElement("td");
        const wrapper = document.createElement("div");
        const avatar = document.createElement("span");
        const details = document.createElement("div");

        wrapper.className = "finance-student-cell";
        avatar.className = "finance-avatar avatar-blue";

        avatar.textContent = record.studentName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("");

        const name = document.createElement("strong");
        name.textContent = record.studentName;

        const number = document.createElement("small");
        number.textContent = record.studentNumber;

        const programme = document.createElement("span");
        programme.textContent = record.programme || "Programme not specified";

        details.append(name, number, programme);
        wrapper.append(avatar, details);
        cell.append(wrapper);

        return cell;
    };

    const createStatusCell = (record) => {
        const cell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = `finance-status ${statusClass(record.status)}`;
        badge.textContent = record.status;

        cell.append(badge);
        return cell;
    };

    const createActionCell = (record) => {
        const cell = document.createElement("td");
        const button = document.createElement("button");

        button.type = "button";
        button.className = "finance-row-action view-finance-record";
        button.dataset.student = record.studentNumber;
        button.textContent = "View";
        button.setAttribute(
            "aria-label",
            `View finance record for ${record.studentName}`
        );

        cell.append(button);
        return cell;
    };

    const renderRecord = (record) => {
        const row = document.createElement("tr");

        row.dataset.student = record.studentNumber;
        row.dataset.status = record.status;
        row.dataset.funding = record.funding;
        row.dataset.assessed = String(record.assessed);
        row.dataset.received = String(record.received);
        row.dataset.pending = String(record.pending);
        row.dataset.balance = String(getBalance(record));

        row.append(
            createStudentCell(record),
            createCell(formatMoney(record.assessed)),
            createCell(formatMoney(record.received)),
            createCell(formatMoney(record.pending)),
            createCell(
                formatMoney(getBalance(record)),
                getBalance(record) === 0 ? "balance-cell balance-zero" : "balance-cell"
            ),
            createStatusCell(record),
            createActionCell(record)
        );

        record.element = row;
        return row;
    };

    /*
     * Keep existing HTML records but update their presentation
     * when an account is changed during this session.
     */

    const updateExistingRow = (record) => {
        if (!record.element) return;

        const replacement = renderRecord(record);
        record.element.replaceWith(replacement);
    };

    /*
     * Search and filtering
     */

    const getSelectedYear = () => {
        return yearSelector?.value || "2026/27";
    };

    const getVisibleRecords = () => {
        const query = (searchInput?.value || "").trim().toLowerCase();
        const status = statusFilter?.value || "all";
        const funding = fundingFilter?.value || "all";
        const academicYear = getSelectedYear();

        return records.filter((record) => {
            const searchable = [
                record.studentName,
                record.studentNumber,
                record.programme
            ].join(" ").toLowerCase();

            return (
                record.academicYear === academicYear &&
                (!query || searchable.includes(query)) &&
                (status === "all" || record.status === status) &&
                (funding === "all" || record.funding === funding)
            );
        });
    };

    const updateResultCount = (visibleRecords) => {
        if (!resultCount) return;

        const total = visibleRecords.length;
        resultCount.textContent =
            `${total} illustrative record${total === 1 ? "" : "s"}`;
    };

    const applyFilters = () => {
        const visibleRecords = getVisibleRecords();

        records.forEach((record) => {
            if (record.element) {
                record.element.hidden = !visibleRecords.includes(record);
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleRecords.length !== 0;
        }

        updateResultCount(visibleRecords);
    };

    searchInput?.addEventListener("input", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);
    fundingFilter?.addEventListener("change", applyFilters);
    yearSelector?.addEventListener("change", () => {
        updateSummary();
        applyFilters();
    });

    resetFiltersButton?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (statusFilter) statusFilter.value = "all";
        if (fundingFilter) fundingFilter.value = "all";

        applyFilters();
    });

    /*
     * Summary calculations
     *
     * Outstanding balance is based on assessed charges minus posted
     * receipts. Pending funding is shown separately and does not reduce
     * the outstanding balance until a payment is actually posted.
     */

    const updateText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    const updateSummary = () => {
        const year = getSelectedYear();
        const yearRecords = records.filter(
            (record) => record.academicYear === year
        );

        const assessed = yearRecords.reduce(
            (total, record) => total + record.assessed,
            0
        );

        const received = yearRecords.reduce(
            (total, record) => total + record.received,
            0
        );

        const pending = yearRecords.reduce(
            (total, record) => total + record.pending,
            0
        );

        const outstanding = yearRecords.reduce(
            (total, record) => total + getBalance(record),
            0
        );

        const paymentRate = assessed > 0
            ? Math.min(100, Math.round((received / assessed) * 100))
            : 0;

        updateText("total-assessed", formatMoney(assessed));
        updateText("total-received", formatMoney(received));
        updateText("total-funding-pending", formatMoney(pending));
        updateText("total-outstanding", formatMoney(outstanding));

        updateText("overview-assessed", formatMoney(assessed));
        updateText("overview-payment-rate", `${paymentRate}%`);

        const progressBar = document.getElementById("overview-progress-bar");
        const progressTrack = document.getElementById("overview-progress-track");

        if (progressBar) {
            progressBar.style.width = `${paymentRate}%`;
        }

        if (progressTrack) {
            progressTrack.setAttribute("aria-valuenow", String(paymentRate));
        }
    };

    /*
     * Form visibility
     */

    const showPanel = (panel, focusSelector) => {
        if (!panel) return;

        panel.hidden = false;
        panel.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            block: "start"
        });

        if (focusSelector) {
            panel.querySelector(focusSelector)?.focus({ preventScroll: true });
        }
    };

    const hidePanel = (panel, form, message) => {
        if (panel) panel.hidden = true;
        if (form) form.reset();
        clearMessage(message);
    };

    document.getElementById("show-fee-form")?.addEventListener("click", () => {
        showPanel(feePanel, "#fee-student-number");
    });

    document.getElementById("show-payment-form")?.addEventListener("click", () => {
        showPanel(paymentPanel, "#payment-student-number");
    });

    document.getElementById("close-fee-form")?.addEventListener("click", () => {
        hidePanel(feePanel, feeForm, feeMessage);
    });

    document.getElementById("cancel-fee-form")?.addEventListener("click", () => {
        hidePanel(feePanel, feeForm, feeMessage);
    });

    document.getElementById("close-payment-form")?.addEventListener("click", () => {
        hidePanel(paymentPanel, paymentForm, paymentMessage);
    });

    document.getElementById("cancel-payment-form")?.addEventListener("click", () => {
        hidePanel(paymentPanel, paymentForm, paymentMessage);
    });

    /*
     * Resolve a student record from a student number.
     */

    const findRecord = (studentNumber) => {
        const normalized = String(studentNumber || "").trim().toLowerCase();

        return records.find(
            (record) => record.studentNumber.toLowerCase() === normalized
        );
    };

    /*
     * Create an illustrative fee assessment.
     *
     * For this prototype, a new assessment is allowed only for an
     * existing student record, avoiding invented admission records.
     */

    feeForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        clearMessage(feeMessage);

        if (!feeForm.reportValidity()) return;

        const studentNumber =
            document.getElementById("fee-student-number").value.trim();

        const academicYear =
            document.getElementById("fee-academic-year").value;

        const category =
            document.getElementById("fee-category").value;

        const amount = Number(
            document.getElementById("fee-amount").value
        );

        const description =
            document.getElementById("fee-description").value.trim();

        const record = findRecord(studentNumber);

        if (!record) {
            setMessage(
                feeMessage,
                "Student number not found in the illustrative records. Use an existing sample student number.",
                "error"
            );
            return;
        }

        if (!Number.isSafeInteger(amount) || amount <= 0) {
            setMessage(
                feeMessage,
                "Enter a positive whole-number amount in TZS.",
                "error"
            );
            return;
        }

        if (record.academicYear !== academicYear) {
            setMessage(
                feeMessage,
                "This prototype stores one academic-year record per student. A separate year-specific account is needed for this assessment.",
                "warning"
            );
            return;
        }

        if (!category || !description) {
            setMessage(
                feeMessage,
                "Select a charge category and enter its description.",
                "error"
            );
            return;
        }

        record.assessed += amount;
        record.notes = [record.notes, `${category}: ${description}`]
            .filter(Boolean)
            .join(" | ");

        record.status = getRecordStatus(record);
        updateExistingRow(record);
        updateSummary();
        applyFilters();

        setMessage(
            feeMessage,
            `Illustrative assessment of ${formatMoney(amount)} added to ${record.studentName}. No real account was changed.`
        );

        feeForm.reset();
    });

    /*
     * Record a payment only when the prototype form says the receipt
     * has been verified. "Requires review" must never reduce a balance.
     *
     * Production implementation must verify transactions against
     * trusted institutional or financial evidence on the server.
     */

    paymentForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        clearMessage(paymentMessage);

        if (!paymentForm.reportValidity()) return;

        const studentNumber =
            document.getElementById("payment-student-number").value.trim();

        const amount = Number(
            document.getElementById("payment-amount").value
        );

        const source =
            document.getElementById("payment-source").value;

        const reference =
            document.getElementById("payment-reference").value.trim();

        const paymentDate =
            document.getElementById("payment-date").value;

        const verification =
            document.getElementById("payment-verification").value;

        const notes =
            document.getElementById("payment-notes").value.trim();

        const record = findRecord(studentNumber);

        if (!record) {
            setMessage(
                paymentMessage,
                "Student number not found in the illustrative records. Use an existing sample student number.",
                "error"
            );
            return;
        }

        if (!Number.isSafeInteger(amount) || amount <= 0) {
            setMessage(
                paymentMessage,
                "Enter a positive whole-number payment amount in TZS.",
                "error"
            );
            return;
        }

        if (!source || !reference || !paymentDate) {
            setMessage(
                paymentMessage,
                "Complete the payment source, transaction reference, and date.",
                "error"
            );
            return;
        }

        const parsedDate = new Date(`${paymentDate}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            setMessage(
                paymentMessage,
                "Enter a valid payment date.",
                "error"
            );
            return;
        }

        if (parsedDate > new Date()) {
            setMessage(
                paymentMessage,
                "The payment date cannot be in the future.",
                "error"
            );
            return;
        }

        if (verification !== "verified") {
            record.reviewRequired = true;
            record.status = "Reconciliation review";

            updateExistingRow(record);
            updateSummary();
            applyFilters();

            setMessage(
                paymentMessage,
                "This entry requires review. No payment was posted and the balance was not reduced.",
                "warning"
            );

            return;
        }

        if (amount > getBalance(record)) {
            setMessage(
                paymentMessage,
                `The entered payment exceeds the current recorded balance of ${formatMoney(getBalance(record))}. Review the allocation or any possible credit balance before posting.`,
                "error"
            );
            return;
        }

        record.received += amount;
        record.funding = source;
        record.notes = [
            record.notes,
            `Sample receipt ${reference} on ${paymentDate}`,
            notes
        ].filter(Boolean).join(" | ");

        /*
         * Pending funding remains separate until its own transfer
         * is verified and posted. This sample action does not silently
         * clear the pending funding amount.
         */

        record.status = getRecordStatus(record);
        updateExistingRow(record);
        updateSummary();
        applyFilters();

        setMessage(
            paymentMessage,
            `Illustrative payment of ${formatMoney(amount)} recorded for ${record.studentName}. This change exists only in this browser session.`
        );

        paymentForm.reset();
    });

    /*
     * View a student account.
     */

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest(".view-finance-record");

        if (!button) return;

        const record = findRecord(button.dataset.student);

        if (!record) return;

        const balance = getBalance(record);

        window.alert(
            [
                "SLB-IMS — STUDENT FINANCIAL ACCOUNT",
                "",
                `Student: ${record.studentName}`,
                `Student number: ${record.studentNumber}`,
                `Programme: ${record.programme}`,
                `Academic year: ${record.academicYear}`,
                "",
                `Assessed charges: ${formatMoney(record.assessed)}`,
                `Payments received and posted: ${formatMoney(record.received)}`,
                `Funding pending: ${formatMoney(record.pending)}`,
                `Recorded balance: ${formatMoney(balance)}`,
                `Funding source: ${record.funding}`,
                `Account status: ${record.status}`,
                "",
                "Prototype notice: these are illustrative records only.",
                "Pending funding is not counted as a completed payment."
            ].join("\n")
        );
    });

    /*
     * Export currently visible records to CSV.
     * Export is a convenience feature, not an audited financial report.
     */

    exportButton?.addEventListener("click", () => {
        const visibleRecords = getVisibleRecords();

        if (visibleRecords.length === 0) {
            window.alert("There are no visible records to export.");
            return;
        }

        const headers = [
            "Student Name",
            "Student Number",
            "Programme",
            "Academic Year",
            "Assessed Charges TZS",
            "Payments Received and Posted TZS",
            "Funding Pending TZS",
            "Recorded Balance TZS",
            "Funding Source",
            "Account Status",
            "Prototype Notes"
        ];

        const rows = visibleRecords.map((record) => [
            record.studentName,
            record.studentNumber,
            record.programme,
            record.academicYear,
            record.assessed,
            record.received,
            record.pending,
            getBalance(record),
            record.funding,
            record.status,
            record.notes
        ]);

        const csv = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(","))
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF", csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `slb-ims-finance-${getSelectedYear().replace("/", "-")}.csv`;

        document.body.append(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    });

    /*
     * Initialize the prototype dashboard.
     */

    updateSummary();
    applyFilters();

    console.info(
        "SLB-IMS Finance initialized. Demo data only; no backend is connected."
    );
});
