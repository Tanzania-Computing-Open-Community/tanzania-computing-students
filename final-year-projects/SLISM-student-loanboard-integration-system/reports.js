
"use strict";

/* =========================================================
   SLB-IMS — REPORTING DASHBOARD
   File: reports.js

   Features:
   - Report search and category filtering
   - Six sample report types
   - Dynamic report previews and summaries
   - CSV export
   - Demonstration-only data
   - Safe DOM rendering
   - No backend or live loan-board connection
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeReportsDashboard();
});

function initializeReportsDashboard() {
    const elements = {
        search: document.getElementById("report-search"),
        categoryFilter: document.getElementById("report-category-filter"),
        resetFilters: document.getElementById("reset-report-filters"),
        resultCount: document.getElementById("report-result-count"),
        catalogue: document.getElementById("report-catalogue"),
        reportCards: Array.from(
            document.querySelectorAll("[data-report-card]")
        ),
        emptyState: document.getElementById("report-empty-state"),
        emptyReset: document.getElementById("report-empty-reset"),

        totalStudents: document.getElementById("report-total-students"),
        totalProgrammes: document.getElementById("report-total-programmes"),
        totalFees: document.getElementById("report-total-fees"),
        reconciliationAlerts: document.getElementById(
            "report-reconciliation-alerts"
        ),

        previewPanel: document.getElementById("report-preview-panel"),
        previewTitle: document.getElementById("report-preview-title"),
        previewDescription: document.getElementById(
            "report-preview-description"
        ),
        previewSummary: document.getElementById("report-preview-summary"),
        previewTableHead: document.getElementById(
            "report-preview-table-head"
        ),
        previewTableBody: document.getElementById(
            "report-preview-table-body"
        ),
        closePreview: document.getElementById("close-report-preview"),
        exportButton: document.getElementById("export-report-csv"),
        generatedAt: document.getElementById("report-generated-at")
    };

    const requiredElements = [
        elements.search,
        elements.categoryFilter,
        elements.resetFilters,
        elements.resultCount,
        elements.catalogue,
        elements.emptyState,
        elements.previewPanel,
        elements.previewTitle,
        elements.previewDescription,
        elements.previewSummary,
        elements.previewTableHead,
        elements.previewTableBody,
        elements.closePreview,
        elements.exportButton,
        elements.generatedAt
    ];

    if (requiredElements.some((element) => !element)) {
        console.error(
            "SLB-IMS Reports: Required HTML elements are missing. " +
            "Check reports.html against reports.js."
        );
        return;
    }

    /* -----------------------------------------------------
       DEMONSTRATION DATA
       Amounts are in Tanzanian shillings (TZS).
       These are fictional examples, not live records.
       ----------------------------------------------------- */

    const students = [
        {
            name: "Alex Mwakalinga",
            number: "SLB-2026-001",
            email: "alex.example@email.test",
            programme: "Computer Science",
            year: "2026/2027",
            status: "Registered"
        },
        {
            name: "Janeth Nyerere",
            number: "SLB-2026-002",
            email: "janeth.example@email.test",
            programme: "Information Systems",
            year: "2026/2027",
            status: "Pending"
        },
        {
            name: "Daniel Kileo",
            number: "SLB-2026-003",
            email: "daniel.example@email.test",
            programme: "Business Information Technology",
            year: "2026/2027",
            status: "Registered"
        },
        {
            name: "Sarah Ngowi",
            number: "SLB-2026-004",
            email: "sarah.example@email.test",
            programme: "Computer Engineering",
            year: "2026/2027",
            status: "Pending"
        }
    ];

    const programmes = [
        {
            name: "Computer Science",
            code: "CS",
            department: "Computing",
            duration: "3 years",
            records: 1
        },
        {
            name: "Information Systems",
            code: "IS",
            department: "Computing",
            duration: "3 years",
            records: 1
        },
        {
            name: "Business Information Technology",
            code: "BIT",
            department: "Business and Technology",
            duration: "3 years",
            records: 1
        },
        {
            name: "Computer Engineering",
            code: "CE",
            department: "Engineering",
            duration: "4 years",
            records: 1
        }
    ];

    const financeRecords = [
        {
            name: "Alex Mwakalinga",
            number: "SLB-2026-001",
            assessed: 1500000,
            received: 1000000,
            fundingPending: 300000,
            balance: 500000,
            status: "Partially paid",
            fundingSource: "Loan board"
        },
        {
            name: "Janeth Nyerere",
            number: "SLB-2026-002",
            assessed: 1800000,
            received: 600000,
            fundingPending: 900000,
            balance: 1200000,
            status: "Funding pending",
            fundingSource: "Loan board"
        },
        {
            name: "Daniel Kileo",
            number: "SLB-2026-003",
            assessed: 1250000,
            received: 1250000,
            fundingPending: 0,
            balance: 0,
            status: "Paid",
            fundingSource: "Self-funded"
        },
        {
            name: "Sarah Ngowi",
            number: "SLB-2026-004",
            assessed: 1600000,
            received: 800000,
            fundingPending: 500000,
            balance: 800000,
            status: "Reconciliation review",
            fundingSource: "Mixed"
        }
    ];

    const loanRecords = [
        {
            name: "Alex Mwakalinga",
            number: "SLB-2026-001",
            reference: "DEMO-LB-001",
            year: "2026/2027",
            approved: 1200000,
            disbursed: 1000000,
            institutionReceived: 1000000,
            approvalStatus: "Approved",
            disbursementStatus: "Partially disbursed",
            receiptStatus: "Verified sample"
        },
        {
            name: "Janeth Nyerere",
            number: "SLB-2026-002",
            reference: "DEMO-LB-002",
            year: "2026/2027",
            approved: 1500000,
            disbursed: 900000,
            institutionReceived: 600000,
            approvalStatus: "Approved",
            disbursementStatus: "Partially disbursed",
            receiptStatus: "Partial / review"
        },
        {
            name: "Daniel Kileo",
            number: "SLB-2026-003",
            reference: "DEMO-LB-003",
            year: "2026/2027",
            approved: 0,
            disbursed: 0,
            institutionReceived: 0,
            approvalStatus: "Not applicable",
            disbursementStatus: "Not disbursed",
            receiptStatus: "Not received"
        },
        {
            name: "Sarah Ngowi",
            number: "SLB-2026-004",
            reference: "DEMO-LB-004",
            year: "2026/2027",
            approved: 1100000,
            disbursed: 800000,
            institutionReceived: 0,
            approvalStatus: "Approved",
            disbursementStatus: "Partially disbursed",
            receiptStatus: "Awaiting verification"
        }
    ];

    const reconciliationRecords = [
        {
            name: "Alex Mwakalinga",
            number: "SLB-2026-001",
            reference: "DEMO-LB-001",
            year: "2026/2027",
            boardDisbursed: 1000000,
            institutionReceived: 1000000,
            posted: 1000000,
            status: "Matched"
        },
        {
            name: "Janeth Nyerere",
            number: "SLB-2026-002",
            reference: "DEMO-LB-002",
            year: "2026/2027",
            boardDisbursed: 900000,
            institutionReceived: 600000,
            posted: 600000,
            status: "Amount mismatch"
        },
        {
            name: "Daniel Kileo",
            number: "SLB-2026-003",
            reference: "DEMO-LB-003",
            year: "2026/2027",
            boardDisbursed: 1250000,
            institutionReceived: 1250000,
            posted: 1200000,
            status: "Posting mismatch"
        },
        {
            name: "Sarah Ngowi",
            number: "SLB-2026-004",
            reference: "DEMO-LB-004",
            year: "2026/2027",
            boardDisbursed: 800000,
            institutionReceived: 0,
            posted: 0,
            status: "Receipt pending"
        }
    ];

    const registrationRecords = students.map((student) => ({
        name: student.name,
        number: student.number,
        programme: student.programme,
        year: student.year,
        status: student.status
    }));

    /* -----------------------------------------------------
       REPORT DEFINITIONS
       ----------------------------------------------------- */

    const reportDefinitions = {
        "student-directory": {
            title: "Student Directory",
            description:
                "Sample institutional student records, including " +
                "student identifiers, programmes and registration statuses.",
            headers: [
                "Student name",
                "Student number",
                "Programme",
                "Academic year",
                "Registration status"
            ],
            rows: () => registrationRecords.map((record) => [
                record.name,
                record.number,
                record.programme,
                record.year,
                record.status
            ]),
            summaries: () => [
                {
                    label: "Student records",
                    value: students.length
                },
                {
                    label: "Registered",
                    value: countWhere(
                        students,
                        (student) => student.status === "Registered"
                    )
                },
                {
                    label: "Pending registration",
                    value: countWhere(
                        students,
                        (student) => student.status === "Pending"
                    )
                }
            ]
        },

        "academic-programmes": {
            title: "Academic Programmes",
            description:
                "Illustrative academic programme catalogue with " +
                "programme codes, departments and study duration.",
            headers: [
                "Programme",
                "Programme code",
                "Department",
                "Duration",
                "Sample student records"
            ],
            rows: () => programmes.map((programme) => [
                programme.name,
                programme.code,
                programme.department,
                programme.duration,
                programme.records
            ]),
            summaries: () => [
                {
                    label: "Programmes",
                    value: programmes.length
                },
                {
                    label: "Departments",
                    value: new Set(
                        programmes.map((programme) => programme.department)
                    ).size
                },
                {
                    label: "Student records represented",
                    value: programmes.reduce(
                        (total, programme) => total + programme.records,
                        0
                    )
                }
            ]
        },

        "finance-summary": {
            title: "Institutional Fee Summary",
            description:
                "Illustrative student-account balances and payments. " +
                "The balance is calculated from assessed fees minus " +
                "institutional receipts; unconfirmed funding is not " +
                "treated as money received.",
            headers: [
                "Student",
                "Student number",
                "Assessed fees (TZS)",
                "Received (TZS)",
                "Balance (TZS)",
                "Account status",
                "Funding source"
            ],
            rows: () => financeRecords.map((record) => [
                record.name,
                record.number,
                record.assessed,
                record.received,
                record.balance,
                record.status,
                record.fundingSource
            ]),
            summaries: () => [
                {
                    label: "Total assessed",
                    value: formatMoney(sum(
                        financeRecords,
                        (record) => record.assessed
                    ))
                },
                {
                    label: "Total received",
                    value: formatMoney(sum(
                        financeRecords,
                        (record) => record.received
                    ))
                },
                {
                    label: "Outstanding balance",
                    value: formatMoney(sum(
                        financeRecords,
                        (record) => record.balance
                    ))
                },
                {
                    label: "Funding pending",
                    value: formatMoney(sum(
                        financeRecords,
                        (record) => record.fundingPending
                    ))
                }
            ]
        },

        "loan-funding": {
            title: "Loan Funding Status",
            description:
                "Illustrative loan-board records showing approval, " +
                "reported disbursement and institution-confirmed receipts " +
                "as separate values. A disbursement is not automatically " +
                "treated as an institutional receipt.",
            headers: [
                "Student",
                "Student number",
                "Board reference",
                "Approval status",
                "Approved (TZS)",
                "Reported disbursed (TZS)",
                "Institution received (TZS)",
                "Receipt status"
            ],
            rows: () => loanRecords.map((record) => [
                record.name,
                record.number,
                record.reference,
                record.approvalStatus,
                record.approved,
                record.disbursed,
                record.institutionReceived,
                record.receiptStatus
            ]),
            summaries: () => [
                {
                    label: "Funding records",
                    value: loanRecords.length
                },
                {
                    label: "Total approved",
                    value: formatMoney(sum(
                        loanRecords,
                        (record) => record.approved
                    ))
                },
                {
                    label: "Reported disbursement",
                    value: formatMoney(sum(
                        loanRecords,
                        (record) => record.disbursed
                    ))
                },
                {
                    label: "Institution-confirmed receipts",
                    value: formatMoney(sum(
                        loanRecords,
                        (record) => record.institutionReceived
                    ))
                }
            ]
        },

        "reconciliation-exceptions": {
            title: "Reconciliation Exceptions",
            description:
                "Illustrative comparisons of loan-board reported " +
                "disbursements, institution-confirmed receipts and " +
                "payments posted to student accounts.",
            headers: [
                "Student",
                "Student number",
                "Board reference",
                "Board disbursed (TZS)",
                "Institution received (TZS)",
                "Posted to account (TZS)",
                "Receipt difference (TZS)",
                "Posting difference (TZS)",
                "Status"
            ],
            rows: () => reconciliationRecords.map((record) => [
                record.name,
                record.number,
                record.reference,
                record.boardDisbursed,
                record.institutionReceived,
                record.posted,
                record.boardDisbursed - record.institutionReceived,
                record.institutionReceived - record.posted,
                record.status
            ]),
            summaries: () => [
                {
                    label: "Records reviewed",
                    value: reconciliationRecords.length
                },
                {
                    label: "Matched",
                    value: countWhere(
                        reconciliationRecords,
                        (record) => record.status === "Matched"
                    )
                },
                {
                    label: "Requiring review",
                    value: countWhere(
                        reconciliationRecords,
                        (record) => record.status !== "Matched"
                    )
                },
                {
                    label: "Board-to-receipt difference",
                    value: formatMoney(sum(
                        reconciliationRecords,
                        (record) =>
                            record.boardDisbursed -
                            record.institutionReceived
                    ))
                }
            ]
        },

        "admissions-summary": {
            title: "Registration Summary",
            description:
                "Sample registration-status distribution for institutional " +
                "follow-up. Registration is an institutional record and " +
                "is not determined solely by loan approval.",
            headers: [
                "Student",
                "Student number",
                "Programme",
                "Academic year",
                "Registration status"
            ],
            rows: () => students.map((student) => [
                student.name,
                student.number,
                student.programme,
                student.year,
                student.status
            ]),
            summaries: () => [
                {
                    label: "Total student records",
                    value: students.length
                },
                {
                    label: "Registered",
                    value: countWhere(
                        students,
                        (student) => student.status === "Registered"
                    )
                },
                {
                    label: "Pending",
                    value: countWhere(
                        students,
                        (student) => student.status === "Pending"
                    )
                }
            ]
        }
    };

    /* -----------------------------------------------------
       HELPERS
       ----------------------------------------------------- */

    let activeReportId = null;
    let activeReportRows = [];
    let activeReportHeaders = [];

    function countWhere(records, predicate) {
        return records.filter(predicate).length;
    }

    function sum(records, selector) {
        return records.reduce(
            (total, record) => total + Number(selector(record) || 0),
            0
        );
    }

    function formatMoney(amount) {
        const value = Number(amount) || 0;

        return "TZS " + new Intl.NumberFormat("en-TZ", {
            maximumFractionDigits: 0
        }).format(value);
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("en-TZ", {
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function formatDateTime(date = new Date()) {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: false
        }).format(date);
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text !== undefined && text !== null) {
            element.textContent = String(text);
        }

        return element;
    }

    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /* -----------------------------------------------------
       DASHBOARD SUMMARY
       ----------------------------------------------------- */

    function updateDashboardSummary() {
        const totalFees = sum(
            financeRecords,
            (record) => record.assessed
        );

        const alertCount = countWhere(
            reconciliationRecords,
            (record) => record.status !== "Matched"
        );

        if (elements.totalStudents) {
            elements.totalStudents.textContent = formatNumber(
                students.length
            );
        }

        if (elements.totalProgrammes) {
            elements.totalProgrammes.textContent = formatNumber(
                programmes.length
            );
        }

        if (elements.totalFees) {
            elements.totalFees.textContent = formatMoney(totalFees);
        }

        if (elements.reconciliationAlerts) {
            elements.reconciliationAlerts.textContent = formatNumber(
                alertCount
            );
        }
    }

    /* -----------------------------------------------------
       REPORT SEARCH AND FILTERS
       ----------------------------------------------------- */

    function filterReports() {
        const searchTerm = elements.search.value
            .trim()
            .toLowerCase();

        const category = elements.categoryFilter.value;

        let visibleCount = 0;

        elements.reportCards.forEach((card) => {
            const cardCategory = card.dataset.category || "";
            const searchText = (
                card.dataset.search + " " + card.textContent
            ).toLowerCase();

            const matchesSearch =
                !searchTerm || searchText.includes(searchTerm);

            const matchesCategory =
                category === "all" || cardCategory === category;

            const visible = matchesSearch && matchesCategory;

            card.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        elements.resultCount.textContent =
            `${visibleCount} report${visibleCount === 1 ? "" : "s"} shown` +
            " — prototype catalogue";

        elements.emptyState.hidden = visibleCount !== 0;

        if (visibleCount === 0) {
            elements.catalogue.hidden = true;
        } else {
            elements.catalogue.hidden = false;
        }
    }

    function resetFilters() {
        elements.search.value = "";
        elements.categoryFilter.value = "all";
        filterReports();
    }

    /* -----------------------------------------------------
       REPORT PREVIEW SUMMARY
       ----------------------------------------------------- */

    function renderSummary(summaries) {
        clearElement(elements.previewSummary);

        summaries.forEach((summary) => {
            const item = createElement(
                "div",
                "preview-summary-item"
            );

            const label = createElement(
                "span",
                "preview-summary-label",
                summary.label
            );

            const value = createElement(
                "strong",
                "preview-summary-value",
                summary.value
            );

            item.append(label, value);
            elements.previewSummary.appendChild(item);
        });
    }

    /* -----------------------------------------------------
       REPORT TABLE
       ----------------------------------------------------- */

    function renderTable(headers, rows) {
        clearElement(elements.previewTableHead);
        clearElement(elements.previewTableBody);

        const headerRow = document.createElement("tr");

        headers.forEach((header) => {
            const th = createElement("th", "", header);
            th.scope = "col";
            headerRow.appendChild(th);
        });

        const headerSection = document.createElement("tr");

        /*
         * Keep the header row directly inside <thead>.
         * The HTML uses a <thead> element with the supplied ID.
         */
        elements.previewTableHead.appendChild(headerRow);

        rows.forEach((row) => {
            const tr = document.createElement("tr");

            row.forEach((value) => {
                const td = document.createElement("td");

                if (typeof value === "number") {
                    td.textContent = formatNumber(value);
                } else {
                    td.textContent = value === null ||
                        value === undefined
                        ? ""
                        : String(value);
                }

                tr.appendChild(td);
            });

            elements.previewTableBody.appendChild(tr);
        });

        if (rows.length === 0) {
            const tr = document.createElement("tr");
            const td = createElement(
                "td",
                "",
                "No records are available for this report."
            );

            td.colSpan = Math.max(headers.length, 1);
            tr.appendChild(td);
            elements.previewTableBody.appendChild(tr);
        }
    }

    /* -----------------------------------------------------
       OPEN REPORT
       ----------------------------------------------------- */

    function openReport(reportId) {
        const report = reportDefinitions[reportId];

        if (!report) {
            console.error("Unknown report:", reportId);
            return;
        }

        activeReportId = reportId;
        activeReportHeaders = [...report.headers];
        activeReportRows = report.rows().map((row) => [...row]);

        elements.previewTitle.textContent = report.title;
        elements.previewDescription.textContent = report.description;

        renderSummary(report.summaries());
        renderTable(activeReportHeaders, activeReportRows);

        elements.generatedAt.textContent = formatDateTime();

        elements.previewPanel.hidden = false;
        elements.exportButton.disabled = false;

        /*
         * Scroll after opening so the report preview is visible.
         */
        elements.previewPanel.scrollIntoView({
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth",
            block: "start"
        });
    }

    function closeReportPreview() {
        elements.previewPanel.hidden = true;
        activeReportId = null;
        activeReportRows = [];
        activeReportHeaders = [];
        elements.exportButton.disabled = true;
    }

    /* -----------------------------------------------------
       CSV EXPORT
       ----------------------------------------------------- */

    function csvEscape(value) {
        const text = value === null || value === undefined
            ? ""
            : String(value);

        /*
         * Prevent spreadsheet formula injection for cells that
         * begin with formula-triggering characters.
         */
        const safeText = /^[\s\u0000-\u001f]*[=+\-@]/.test(text)
            ? "'" + text
            : text;

        return '"' + safeText.replace(/"/g, '""') + '"';
    }

    function exportReportCSV() {
        if (
            !activeReportId ||
            !activeReportHeaders.length
        ) {
            return;
        }

        const report = reportDefinitions[activeReportId];

        if (!report) {
            return;
        }

        const rows = [
            activeReportHeaders,
            ...activeReportRows
        ];

        const csvContent = "\uFEFF" + rows
            .map((row) => row.map(csvEscape).join(","))
            .join("\r\n");

        const blob = new Blob(
            [csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${activeReportId}-sample-report.csv`;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        /*
         * Delay revocation to allow the browser to begin the download.
         */
        window.setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    /* -----------------------------------------------------
       EVENT LISTENERS
       ----------------------------------------------------- */

    elements.search.addEventListener("input", filterReports);
    elements.categoryFilter.addEventListener("change", filterReports);

    elements.resetFilters.addEventListener("click", resetFilters);

    if (elements.emptyReset) {
        elements.emptyReset.addEventListener("click", resetFilters);
    }

    elements.catalogue.addEventListener("click", (event) => {
        const button = event.target.closest("[data-report]");

        if (!button || !elements.catalogue.contains(button)) {
            return;
        }

        openReport(button.dataset.report);
    });

    elements.closePreview.addEventListener(
        "click",
        closeReportPreview
    );

    elements.exportButton.addEventListener(
        "click",
        exportReportCSV
    );

    /* -----------------------------------------------------
       INITIALIZE
       ----------------------------------------------------- */

    updateDashboardSummary();
    filterReports();

    console.info(
        "SLB-IMS Reports initialized. " +
        "All report data is local demonstration data."
    );
}
