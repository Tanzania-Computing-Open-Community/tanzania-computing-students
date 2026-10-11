
"use strict";

/* =========================================================
   SLB-IMS — LOAN INTEGRATION
   File: loan-integration.js

   Front-end prototype only.
   - No backend or database connection.
   - No real loan-board API integration.
   - No official funding or receipt verification.
   - Newly added records remain in page memory only.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const byId = (id) => document.getElementById(id);

  const elements = {
    totalRecords: byId("loan-total-records"),
    approvedCount: byId("loan-approved-count"),
    disbursedTotal: byId("loan-disbursed-total"),
    pendingCount: byId("loan-pending-count"),

    search: byId("loan-search"),
    statusFilter: byId("loan-status-filter"),
    academicYearFilter: byId("loan-academic-year"),
    fundingTypeFilter: byId("loan-funding-type-filter"),
    resetFilters: byId("reset-loan-filters"),
    emptyReset: byId("loan-empty-reset"),

    resultCount: byId("loan-result-count"),
    tableBody: byId("loan-table-body"),
    emptyState: byId("loan-empty-state"),

    formPanel: byId("loan-record-form-panel"),
    form: byId("loan-record-form"),
    formMessage: byId("loan-form-message"),

    studentNumber: byId("loan-student-number"),
    boardReference: byId("loan-board-reference"),
    formAcademicYear: byId("loan-academic-year-form"),
    fundingType: byId("loan-funding-type"),
    approvalStatus: byId("loan-approval-status"),
    approvedAmount: byId("loan-approved-amount"),
    disbursementStatus: byId("loan-disbursement-status"),
    disbursedAmount: byId("loan-disbursed-amount"),
    transferReference: byId("loan-transfer-reference"),

    showFormButtons: [
      byId("show-loan-record-form"),
      byId("show-loan-record-form-secondary")
    ],
    closeForm: byId("close-loan-form"),
    cancelForm: byId("cancel-loan-form")
  };

  const requiredElements = [
    elements.totalRecords,
    elements.approvedCount,
    elements.disbursedTotal,
    elements.pendingCount,
    elements.search,
    elements.statusFilter,
    elements.academicYearFilter,
    elements.fundingTypeFilter,
    elements.resetFilters,
    elements.resultCount,
    elements.tableBody,
    elements.emptyState,
    elements.formPanel,
    elements.form,
    elements.formMessage
  ];

  const missingElements = requiredElements.filter((element) => !element);

  if (missingElements.length > 0) {
    console.error(
      "SLB-IMS Loan Integration: required HTML elements are missing.",
      missingElements
    );
    return;
  }

  const moneyFormatter = new Intl.NumberFormat("en-TZ", {
    maximumFractionDigits: 0
  });

  const money = (amount) => `TZS ${moneyFormatter.format(amount)}`;

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });

  const normalize = (value) =>
    String(value ?? "").trim().toLowerCase();

  /*
   * The initial table rows in loan-integration.html are illustrative.
   * Read those rows into memory so the displayed data and filters
   * share one source during this browser session.
   *
   * Receipt verification is intentionally separate from disbursement.
   */

  const initialRecords = [
    {
      loanId: "LOAN-DEMO-001",
      studentNumber: "SLB-2026-001",
      studentName: "Alex Mwakalinga",
      initials: "AM",
      avatarClass: "avatar-blue",
      boardReference: "DEMO-LB-26001",
      academicYear: "2026/2027",
      fundingType: "Full sponsorship",
      approvalStatus: "Approved",
      approvedAmount: 1200000,
      disbursementStatus: "Partially disbursed",
      disbursedAmount: 800000,
      transferReference: "DEMO-TXN-26001",
      receiptStatus: "Partial / review"
    },
    {
      loanId: "LOAN-DEMO-002",
      studentNumber: "SLB-2026-002",
      studentName: "Janeth Nyerere",
      initials: "JN",
      avatarClass: "avatar-gold",
      boardReference: "DEMO-LB-26002",
      academicYear: "2026/2027",
      fundingType: "Partial sponsorship",
      approvalStatus: "Approved",
      approvedAmount: 900000,
      disbursementStatus: "Not disbursed",
      disbursedAmount: 0,
      transferReference: "",
      receiptStatus: "Not received"
    },
    {
      loanId: "LOAN-DEMO-003",
      studentNumber: "SLB-2026-003",
      studentName: "Daniel Kileo",
      initials: "DK",
      avatarClass: "avatar-teal",
      boardReference: "DEMO-LB-26003",
      academicYear: "2026/2027",
      fundingType: "Full sponsorship",
      approvalStatus: "Approved",
      approvedAmount: 1000000,
      disbursementStatus: "Disbursed",
      disbursedAmount: 800000,
      transferReference: "DEMO-TXN-26003",
      receiptStatus: "Verified sample"
    },
    {
      loanId: "LOAN-DEMO-004",
      studentNumber: "SLB-2026-004",
      studentName: "Sarah Ngowi",
      initials: "SN",
      avatarClass: "avatar-purple",
      boardReference: "DEMO-LB-26004",
      academicYear: "2026/2027",
      fundingType: "Partial sponsorship",
      approvalStatus: "Pending approval",
      approvedAmount: 700000,
      disbursementStatus: "Not disbursed",
      disbursedAmount: 0,
      transferReference: "",
      receiptStatus: "Not received"
    }
  ];

  let records = readInitialTableRecords(initialRecords);

  let nextRecordNumber = records.length + 1;

  const statusClasses = {
    "Approved": "status-approved",
    "Pending approval": "status-awaiting",
    "Partially disbursed": "status-partial",
    "Disbursed": "status-disbursed",
    "Scheduled": "status-approved",
    "Not disbursed": "status-awaiting",
    "Awaiting verification": "status-awaiting",
    "Rejected": "status-awaiting"
  };

  const receiptClasses = {
    "Verified sample": "receipt-verified",
    "Not received": "receipt-pending",
    "Partial / review": "receipt-pending",
    "Awaiting verification": "receipt-pending"
  };

  const statusOptions = [
    "Approved",
    "Pending approval",
    "Partially disbursed",
    "Disbursed",
    "Scheduled",
    "Not disbursed",
    "Awaiting verification",
    "Rejected"
  ];

  /*
   * Read the existing HTML table when possible.
   * This preserves compatibility with the sample rows supplied
   * by loan-integration.html.
   */

  function readInitialTableRecords(fallbackRecords) {
    const rows = Array.from(elements.tableBody.querySelectorAll("tr"));

    if (rows.length === 0) {
      return fallbackRecords.map((record) => ({ ...record }));
    }

    const parsed = rows
      .map((row, index) => {
        const cells = row.querySelectorAll("td");

        if (cells.length < 8) {
          return null;
        }

        const nameElement = cells[0].querySelector("strong");
        const studentNumberElement = cells[0].querySelector("small");
        const avatarElement = cells[0].querySelector(".loan-avatar");
        const statusElement = cells[5].querySelector(".loan-status");
        const receiptElement = cells[6].querySelector(".loan-receipt");

        const fallback = fallbackRecords[index];

        const studentName =
          nameElement?.textContent.trim() ||
          fallback?.studentName ||
          "Unknown student";

        const studentNumber =
          studentNumberElement?.textContent.trim() ||
          row.dataset.student ||
          fallback?.studentNumber ||
          "";

        const approvalStatus = inferApprovalStatus(
          row.dataset.status || statusElement?.textContent.trim(),
          fallback?.approvalStatus
        );

        const disbursementStatus = inferDisbursementStatus(
          row.dataset.status || statusElement?.textContent.trim(),
          fallback?.disbursementStatus
        );

        return {
          loanId:
            row.dataset.loanId ||
            fallback?.loanId ||
            `LOAN-DEMO-${String(index + 1).padStart(3, "0")}`,

          studentNumber,
          studentName,
          initials: initialsFor(studentName),

          avatarClass:
            avatarElement?.className
              .split(/\s+/)
              .find((className) => className.startsWith("avatar-")) ||
            fallback?.avatarClass ||
            "avatar-blue",

          boardReference:
            cells[1].textContent.trim() ||
            fallback?.boardReference ||
            "",

          academicYear:
            row.dataset.year ||
            cells[2].textContent.trim() ||
            fallback?.academicYear ||
            "2026/2027",

          fundingType:
            row.dataset.fundingType ||
            fallback?.fundingType ||
            "Partial sponsorship",

          approvalStatus,

          approvedAmount:
            parseAmount(cells[3].textContent) ??
            fallback?.approvedAmount ??
            0,

          disbursementStatus,

          disbursedAmount:
            parseAmount(cells[4].textContent) ??
            fallback?.disbursedAmount ??
            0,

          transferReference: fallback?.transferReference || "",

          receiptStatus:
            receiptElement?.textContent.trim() ||
            fallback?.receiptStatus ||
            "Not received"
        };
      })
      .filter(Boolean);

    return parsed.length > 0 ? parsed : fallbackRecords.map((record) => ({ ...record }));
  }

  function inferApprovalStatus(value, fallback) {
    const normalized = normalize(value);

    if (normalized === "rejected") {
      return "Rejected";
    }

    if (normalized === "pending approval") {
      return "Pending approval";
    }

    if (normalized === "approved") {
      return "Approved";
    }

    return fallback || "Pending approval";
  }

  function inferDisbursementStatus(value, fallback) {
    const normalized = normalize(value);

    if (normalized === "partially disbursed") {
      return "Partially disbursed";
    }

    if (normalized === "disbursed") {
      return "Disbursed";
    }

    if (normalized === "scheduled") {
      return "Scheduled";
    }

    if (normalized === "awaiting verification") {
      return "Awaiting verification";
    }

    if (normalized === "not disbursed") {
      return "Not disbursed";
    }

    return fallback || "Not disbursed";
  }

  function parseAmount(value) {
    const normalized = String(value ?? "").replace(/[^\d.-]/g, "");

    if (normalized === "") {
      return null;
    }

    const amount = Number(normalized);

    return Number.isFinite(amount) && amount >= 0
      ? amount
      : null;
  }

  function initialsFor(name) {
    return String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ST";
  }

  /*
   * Summary calculations
   *
   * Approved sponsorship is counted independently from actual
   * disbursement. The disbursed total is a demonstration figure,
   * not a verified institutional receipt total.
   */

  function updateSummary() {
    const approvedRecords = records.filter(
      (record) => record.approvalStatus === "Approved"
    );

    const disbursedTotal = records.reduce((total, record) => {
      return total + Number(record.disbursedAmount || 0);
    }, 0);

    const pendingRecords = records.filter((record) => {
      const approvalPending =
        record.approvalStatus === "Pending approval";

      const approvedButNotCompleted =
        record.approvalStatus === "Approved" &&
        !["Disbursed"].includes(record.disbursementStatus);

      const awaitingVerification =
        record.disbursementStatus === "Awaiting verification";

      return (
        approvalPending ||
        approvedButNotCompleted ||
        awaitingVerification
      );
    });

    elements.totalRecords.textContent = String(records.length);
    elements.approvedCount.textContent = String(approvedRecords.length);
    elements.disbursedTotal.textContent = money(disbursedTotal);
    elements.pendingCount.textContent = String(pendingRecords.length);
  }

  /*
   * Status display
   */

  function displayFundingStatus(record) {
    if (record.approvalStatus === "Rejected") {
      return "Rejected";
    }

    if (record.approvalStatus === "Pending approval") {
      return "Pending approval";
    }

    return record.disbursementStatus;
  }

  function getStatusClass(status) {
    return statusClasses[status] || "status-awaiting";
  }

  function getReceiptClass(status) {
    return receiptClasses[status] || "receipt-pending";
  }

  /*
   * Record filtering
   */

  function getFilteredRecords() {
    const query = normalize(elements.search.value);
    const selectedStatus = elements.statusFilter.value;
    const selectedYear = elements.academicYearFilter.value;
    const selectedFundingType = elements.fundingTypeFilter.value;

    return records.filter((record) => {
      const searchableText = normalize([
        record.studentName,
        record.studentNumber,
        record.boardReference,
        record.loanId,
        record.transferReference
      ].join(" "));

      const matchesSearch =
        query === "" || searchableText.includes(query);

      const matchesStatus =
        selectedStatus === "all" ||
        displayFundingStatus(record) === selectedStatus ||
        record.approvalStatus === selectedStatus ||
        record.disbursementStatus === selectedStatus;

      const matchesYear =
        selectedYear === "all" ||
        record.academicYear === selectedYear;

      const matchesFundingType =
        selectedFundingType === "all" ||
        record.fundingType === selectedFundingType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesYear &&
        matchesFundingType
      );
    });
  }

  /*
   * Table rendering
   */

  function renderTable() {
    const filteredRecords = getFilteredRecords();

    elements.tableBody.innerHTML = filteredRecords
      .map((record) => {
        const fundingStatus = displayFundingStatus(record);

        return `
          <tr
            data-student="${escapeHTML(record.studentNumber)}"
            data-loan-id="${escapeHTML(record.loanId)}"
            data-status="${escapeHTML(fundingStatus)}"
            data-year="${escapeHTML(record.academicYear)}"
            data-funding-type="${escapeHTML(record.fundingType)}"
          >
            <td>
              <div class="loan-student-cell">
                <span class="loan-avatar ${escapeHTML(record.avatarClass)}">
                  ${escapeHTML(record.initials)}
                </span>
                <div>
                  <strong>${escapeHTML(record.studentName)}</strong>
                  <small>${escapeHTML(record.studentNumber)}</small>
                </div>
              </div>
            </td>

            <td>
              <span class="loan-reference">
                ${escapeHTML(record.boardReference)}
              </span>
            </td>

            <td>${escapeHTML(record.academicYear)}</td>

            <td>${money(record.approvedAmount)}</td>

            <td>${money(record.disbursedAmount)}</td>

            <td>
              <span class="loan-status ${getStatusClass(fundingStatus)}">
                ${escapeHTML(fundingStatus)}
              </span>
            </td>

            <td>
              <span class="loan-receipt ${getReceiptClass(record.receiptStatus)}">
                ${escapeHTML(record.receiptStatus)}
              </span>
            </td>

            <td>
              <button
                class="loan-view-button"
                type="button"
                data-student="${escapeHTML(record.studentNumber)}"
                data-loan-id="${escapeHTML(record.loanId)}"
              >
                Review <span aria-hidden="true">↗</span>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    elements.emptyState.hidden = filteredRecords.length > 0;
    elements.tableBody.closest("table").hidden = filteredRecords.length === 0;

    elements.resultCount.textContent =
      `${filteredRecords.length} of ${records.length} records shown — prototype data`;

    updateSummary();
  }

  function resetFilters() {
    elements.search.value = "";
    elements.statusFilter.value = "all";
    elements.academicYearFilter.value = "all";
    elements.fundingTypeFilter.value = "all";

    renderTable();
  }

  /*
   * Form visibility and feedback
   */

  function showForm() {
    elements.formPanel.hidden = false;
    elements.formMessage.textContent = "";
    elements.formMessage.classList.remove("error");

    elements.formPanel.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start"
    });

    window.setTimeout(() => {
      elements.studentNumber?.focus({ preventScroll: true });
    }, 100);
  }

  function closeForm() {
    elements.formPanel.hidden = true;
    elements.form.reset();
    elements.formMessage.textContent = "";
    elements.formMessage.classList.remove("error");
  }

  function showFormMessage(message, isError = false) {
    elements.formMessage.textContent = message;
    elements.formMessage.classList.toggle("error", isError);
  }

  /*
   * Funding record validation
   */

  function validateFormRecord(data) {
    if (!data.studentNumber) {
      return "Enter the student's institutional number.";
    }

    if (!data.boardReference) {
      return "Enter the loan-board reference.";
    }

    if (!data.academicYear) {
      return "Select an academic year.";
    }

    if (!data.fundingType) {
      return "Select a funding type.";
    }

    if (!statusOptions.includes(data.disbursementStatus)) {
      return "Select a valid disbursement status.";
    }

    if (!["Approved", "Pending approval", "Rejected"].includes(data.approvalStatus)) {
      return "Select a valid sponsorship decision.";
    }

    if (
      !Number.isSafeInteger(data.approvedAmount) ||
      data.approvedAmount < 0
    ) {
      return "The approved amount must be a valid non-negative whole number.";
    }

    if (
      !Number.isSafeInteger(data.disbursedAmount) ||
      data.disbursedAmount < 0
    ) {
      return "The disbursed amount must be a valid non-negative whole number.";
    }

    if (data.disbursedAmount > data.approvedAmount) {
      return "The reported disbursed amount cannot exceed the approved amount.";
    }

    if (
      data.approvalStatus !== "Approved" &&
      data.disbursedAmount > 0
    ) {
      return "A positive disbursement requires an approved sponsorship decision. Verify the source record before entering it.";
    }

    if (
      data.approvalStatus === "Rejected" &&
      data.disbursementStatus !== "Not disbursed"
    ) {
      return "A rejected sponsorship must use 'Not disbursed' in this prototype.";
    }

    if (
      data.approvalStatus === "Pending approval" &&
      data.disbursementStatus !== "Not disbursed"
    ) {
      return "A pending sponsorship cannot be marked as disbursed in this prototype.";
    }

    if (
      data.disbursementStatus === "Not disbursed" &&
      data.disbursedAmount > 0
    ) {
      return "The disbursed amount is greater than zero. Select an appropriate disbursement status.";
    }

    if (
      ["Partially disbursed", "Disbursed", "Awaiting verification"].includes(
        data.disbursementStatus
      ) &&
      data.disbursedAmount <= 0
    ) {
      return "Enter a positive reported amount for this disbursement status.";
    }

    if (
      data.disbursementStatus === "Partially disbursed" &&
      data.disbursedAmount >= data.approvedAmount
    ) {
      return "A partially disbursed record must be less than the approved amount.";
    }

    if (
      data.disbursementStatus === "Disbursed" &&
      data.disbursedAmount <= 0
    ) {
      return "Enter the reported disbursed amount.";
    }

    const duplicateStudentYear = records.some((record) => {
      return (
        normalize(record.studentNumber) === normalize(data.studentNumber) &&
        record.academicYear === data.academicYear
      );
    });

    if (duplicateStudentYear) {
      return "A funding record already exists for this student and academic year. Review the existing record instead of creating a duplicate.";
    }

    const duplicateBoardReference = records.some((record) => {
      return (
        normalize(record.boardReference) === normalize(data.boardReference)
      );
    });

    if (duplicateBoardReference) {
      return "This loan-board reference already exists in the demonstration register.";
    }

    return "";
  }

  /*
   * Add a new sample record
   */

  function addRecord(event) {
    event.preventDefault();

    const data = {
      studentNumber: elements.studentNumber.value.trim(),
      boardReference: elements.boardReference.value.trim(),
      academicYear: elements.formAcademicYear.value,
      fundingType: elements.fundingType.value,
      approvalStatus: elements.approvalStatus.value,
      approvedAmount: Number(elements.approvedAmount.value),
      disbursementStatus: elements.disbursementStatus.value,
      disbursedAmount: Number(elements.disbursedAmount.value),
      transferReference: elements.transferReference.value.trim()
    };

    const validationError = validateFormRecord(data);

    if (validationError) {
      showFormMessage(validationError, true);
      return;
    }

    const studentNumber = data.studentNumber;

    const record = {
      loanId: `LOAN-DEMO-${String(nextRecordNumber).padStart(3, "0")}`,
      studentNumber,
      studentName: studentNumber,
      initials: initialsFor(studentNumber),
      avatarClass: "avatar-blue",
      boardReference: data.boardReference,
      academicYear: data.academicYear,
      fundingType: data.fundingType,
      approvalStatus: data.approvalStatus,
      approvedAmount: data.approvedAmount,
      disbursementStatus: data.disbursementStatus,
      disbursedAmount: data.disbursedAmount,
      transferReference: data.transferReference,
      receiptStatus: data.disbursedAmount > 0
        ? "Awaiting verification"
        : "Not received"
    };

    records.push(record);
    nextRecordNumber += 1;

    /*
     * A transfer reference is stored only as entered sample data.
     * It is not proof of a real transfer or institutional receipt.
     */

    resetFilters();

    elements.search.value = studentNumber;
    renderTable();

    closeForm();

    /*
     * Avoid implying that this front-end has verified official data.
     */

    window.alert(
      "Sample funding record added to this page session.\n\n" +
      `Student number: ${studentNumber}\n` +
      `Record reference: ${record.loanId}\n\n` +
      "This is demonstration data only. No database was updated, " +
      "no loan board was contacted, and no transfer or institutional " +
      "receipt was verified."
    );
  }

  /*
   * Record review
   *
   * The prototype uses a readable summary rather than pretending
   * to retrieve a live official loan-board record.
   */

  function reviewRecord(button) {
    const studentNumber = button.dataset.student;
    const loanId = button.dataset.loanId;

    const record = records.find((item) => {
      return (
        item.studentNumber === studentNumber ||
        item.loanId === loanId
      );
    });

    if (!record) {
      window.alert(
        "The selected demonstration record could not be found. Refresh the page and try again."
      );
      return;
    }

    const summary = [
      "SLB-IMS — SAMPLE FUNDING RECORD",
      "",
      `Student: ${record.studentName}`,
      `Student number: ${record.studentNumber}`,
      `Record reference: ${record.loanId}`,
      `Loan-board reference: ${record.boardReference}`,
      `Academic year: ${record.academicYear}`,
      `Funding type: ${record.fundingType}`,
      "",
      `Sponsorship decision: ${record.approvalStatus}`,
      `Approved amount: ${money(record.approvedAmount)}`,
      `Disbursement status: ${record.disbursementStatus}`,
      `Reported disbursed amount: ${money(record.disbursedAmount)}`,
      `Transfer reference: ${record.transferReference || "Not provided"}`,
      `Institution receipt: ${record.receiptStatus}`,
      "",
      "IMPORTANT:",
      "This is illustrative data only.",
      "A sponsorship approval does not prove payment.",
      "A reported disbursement does not independently prove that the institution received the funds.",
      "Verify official evidence and reconcile institutional accounts before making financial decisions."
    ];

    window.alert(summary.join("\n"));
  }

  /*
   * Synchronize disbursement fields to reduce inconsistent input.
   * The user can still correct the values before submitting.
   */

  function handleApprovalStatusChange() {
    if (
      elements.approvalStatus.value === "Pending approval" ||
      elements.approvalStatus.value === "Rejected"
    ) {
      elements.disbursementStatus.value = "Not disbursed";
      elements.disbursedAmount.value = "0";
    }

    elements.formMessage.textContent = "";
    elements.formMessage.classList.remove("error");
  }

  function handleDisbursementStatusChange() {
    if (elements.disbursementStatus.value === "Not disbursed") {
      elements.disbursedAmount.value = "0";
    }

    if (elements.disbursementStatus.value === "Scheduled") {
      elements.disbursedAmount.value = "0";
    }

    if (elements.disbursementStatus.value === "Partially disbursed") {
      elements.disbursedAmount.value = "";
    }

    if (
      elements.disbursementStatus.value === "Disbursed" ||
      elements.disbursementStatus.value === "Awaiting verification"
    ) {
      if (!elements.disbursedAmount.value || Number(elements.disbursedAmount.value) <= 0) {
        elements.disbursedAmount.value = elements.approvedAmount.value || "";
      }
    }

    elements.formMessage.textContent = "";
    elements.formMessage.classList.remove("error");
  }

  /*
   * Event listeners
   */

  elements.search.addEventListener("input", renderTable);
  elements.statusFilter.addEventListener("change", renderTable);
  elements.academicYearFilter.addEventListener("change", renderTable);
  elements.fundingTypeFilter.addEventListener("change", renderTable);

  elements.resetFilters.addEventListener("click", resetFilters);

  elements.emptyReset?.addEventListener("click", resetFilters);

  elements.showFormButtons.forEach((button) => {
    button?.addEventListener("click", showForm);
  });

  elements.closeForm?.addEventListener("click", closeForm);
  elements.cancelForm?.addEventListener("click", closeForm);

  elements.form.addEventListener("submit", addRecord);

  elements.approvalStatus?.addEventListener(
    "change",
    handleApprovalStatusChange
  );

  elements.disbursementStatus?.addEventListener(
    "change",
    handleDisbursementStatusChange
  );

  elements.approvedAmount?.addEventListener("input", () => {
    elements.formMessage.textContent = "";
    elements.formMessage.classList.remove("error");
  });

  elements.disbursedAmount?.addEventListener("input", () => {
    elements.formMessage.textContent = "";
    elements.formMessage.classList.remove("error");
  });

  elements.tableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".loan-view-button");

    if (!button) {
      return;
    }

    reviewRecord(button);
  });

  /*
   * Escape closes the form when it is open.
   */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.formPanel.hidden) {
      closeForm();
    }
  });

  /*
   * Initial render
   */

  renderTable();

  console.info(
    "SLB-IMS Loan Integration initialized in demonstration mode. " +
    "No live loan-board connection is configured."
  );
});
