
/* =========================================================
   SLB-IMS — STUDENT PORTAL
   File: student-portal.js

   Front-end prototype only.
   No live API, authentication, or database connection.
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        studentName: document.getElementById("portal-student-name"),
        studentNumber: document.getElementById("portal-student-number"),
        programme: document.getElementById("portal-programme"),
        academicYear: document.getElementById("portal-academic-year"),
        registrationStatus: document.getElementById(
            "portal-registration-status"
        ),

        assessedFees: document.getElementById("portal-assessed-fees"),
        receivedPayments: document.getElementById(
            "portal-received-payments"
        ),
        feeBalance: document.getElementById("portal-fee-balance"),
        academicStanding: document.getElementById(
            "portal-academic-standing"
        ),

        loanStatus: document.getElementById("portal-loan-status"),
        approvedAmount: document.getElementById("portal-approved-amount"),
        disbursedAmount: document.getElementById("portal-disbursed-amount"),
        institutionReceived: document.getElementById(
            "portal-institution-received"
        ),
        fundingExplanation: document.getElementById(
            "portal-funding-explanation"
        ),

        paymentPercentage: document.getElementById(
            "portal-payment-percentage"
        ),
        paymentProgress: document.getElementById(
            "portal-payment-progress"
        ),
        paymentProgressBar: document.getElementById(
            "portal-payment-progress-bar"
        ),

        breakdownAssessed: document.getElementById(
            "portal-breakdown-assessed"
        ),
        breakdownReceived: document.getElementById(
            "portal-breakdown-received"
        ),
        breakdownBalance: document.getElementById(
            "portal-breakdown-balance"
        )
    };

    /*
     * Clearly identified demonstration data.
     * Replace with authenticated, authorized server data
     * when a backend is implemented.
     *
     * These amounts illustrate different financial concepts:
     * - approvedAmount: loan-board approval
     * - disbursedAmount: amount reported as disbursed
     * - institutionReceived: amount recorded as received
     * - assessedFees: institutional charges
     * - receivedPayments: verified payments posted to the account
     */
    const sampleStudent = Object.freeze({
        studentName: "Alex Mwakalinga",
        initials: "AM",
        studentNumber: "SLB-2026-001",
        programme: "Computer Science",
        programmeDetail: "Bachelor of Computer Science",
        academicYear: "2026/2027",
        registrationStatus: "Registered",
        academicStanding: "In progress",

        assessedFees: 1500000,
        receivedPayments: 1000000,

        loanStatus: "Approved",
        approvedAmount: 1200000,
        disbursedAmount: 1000000,
        institutionReceived: 1000000
    });

    const currencyFormatter = new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: "TZS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    function formatMoney(amount) {
        const safeAmount = Number.isFinite(amount) ? amount : 0;

        return currencyFormatter.format(safeAmount);
    }

    function setText(element, value) {
        if (element) {
            element.textContent = String(value);
        }
    }

    function setStatus(element, status, className) {
        if (!element) {
            return;
        }

        element.textContent = status;
        element.classList.remove(
            "portal-status-success",
            "portal-status-info",
            "portal-status-warning",
            "portal-status-danger"
        );

        element.classList.add(className);
    }

    function getStatusClass(status) {
        const normalized = String(status).trim().toLowerCase();

        if (
            normalized === "registered" ||
            normalized === "paid" ||
            normalized === "verified"
        ) {
            return "portal-status-success";
        }

        if (
            normalized === "approved" ||
            normalized === "disbursed" ||
            normalized === "in progress"
        ) {
            return "portal-status-info";
        }

        if (
            normalized.includes("pending") ||
            normalized.includes("partial") ||
            normalized.includes("review") ||
            normalized.includes("awaiting") ||
            normalized.includes("not received")
        ) {
            return "portal-status-warning";
        }

        if (
            normalized.includes("rejected") ||
            normalized.includes("suspended") ||
            normalized.includes("failed")
        ) {
            return "portal-status-danger";
        }

        return "portal-status-info";
    }

    /*
     * Calculates the amount still outstanding on the
     * institutional account.
     *
     * It deliberately does not subtract loan approvals or
     * unreceived disbursements from assessed institutional fees.
     */
    function calculateFeeBalance(assessedFees, receivedPayments) {
        const assessed = Math.max(0, Number(assessedFees) || 0);
        const received = Math.max(0, Number(receivedPayments) || 0);

        return Math.max(0, assessed - received);
    }

    function calculatePaymentPercentage(assessedFees, receivedPayments) {
        const assessed = Math.max(0, Number(assessedFees) || 0);
        const received = Math.max(0, Number(receivedPayments) || 0);

        if (assessed === 0) {
            return 0;
        }

        return Math.min(100, (received / assessed) * 100);
    }

    function getFundingExplanation(student) {
        const approved = Number(student.approvedAmount) || 0;
        const disbursed = Number(student.disbursedAmount) || 0;
        const institutionReceived = Number(student.institutionReceived) || 0;
        const receivedPayments = Number(student.receivedPayments) || 0;

        if (student.loanStatus === "Rejected") {
            return (
                "The sample loan record is marked rejected. " +
                "Check the official loan-board record for the reason. " +
                "Institutional fee payments remain a separate record."
            );
        }

        if (student.loanStatus === "Pending approval") {
            return (
                "The sample loan application is awaiting approval. " +
                "Do not treat a pending application as approved funding " +
                "or as payment received by the institution."
            );
        }

        if (approved === 0 && disbursed === 0) {
            return (
                "No approved or disbursed loan amount is recorded in this " +
                "sample. Check official funding records for the current status."
            );
        }

        if (disbursed > approved) {
            return (
                "The reported disbursement exceeds the approved amount. " +
                "This sample contains an inconsistency that requires " +
                "verification before the records can be reconciled."
            );
        }

        if (institutionReceived > disbursed) {
            return (
                "The institutional receipt exceeds the reported loan-board " +
                "disbursement. Verify the transfer reference and both records."
            );
        }

        if (institutionReceived < disbursed) {
            return (
                "The reported disbursement exceeds the amount recorded as " +
                "received by the institution. Verify the transfer, receipt, " +
                "and posting records before changing the fee account."
            );
        }

        if (disbursed < approved) {
            return (
                "The sample shows approved funding that has not been fully " +
                "disbursed. Only verified payments actually received and " +
                "posted by the institution count toward the fee account. " +
                "Institutional receipt recorded: " +
                formatMoney(institutionReceived) +
                ". Payments posted: " +
                formatMoney(receivedPayments) +
                "."
            );
        }

        return (
            "The sample shows the same amount reported as disbursed and " +
            "received by the institution. The fee account still depends " +
            "on institutional charges and verified payments posted. " +
            "Payments posted: " +
            formatMoney(receivedPayments) +
            "."
        );
    }

    function renderProfile(student) {
        setText(elements.studentName, student.studentName);
        setText(elements.studentNumber, student.studentNumber);
        setText(elements.programme, student.programme);
        setText(elements.academicYear, student.academicYear);
        setText(elements.academicStanding, student.academicStanding);

        const registrationClass = getStatusClass(
            student.registrationStatus
        );

        setStatus(
            elements.registrationStatus,
            student.registrationStatus,
            registrationClass
        );

        const avatar = document.querySelector(".portal-avatar");

        if (avatar) {
            const initials = student.initials ||
                student.studentName
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(part => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

            setText(avatar, initials);
        }

        setText(
            document.getElementById("portal-programme-detail"),
            student.programmeDetail || student.programme
        );
    }

    function renderFinance(student) {
        const assessed = Math.max(0, Number(student.assessedFees) || 0);
        const received = Math.max(0, Number(student.receivedPayments) || 0);
        const balance = calculateFeeBalance(assessed, received);
        const percentage = calculatePaymentPercentage(assessed, received);

        setText(elements.assessedFees, formatMoney(assessed));
        setText(elements.receivedPayments, formatMoney(received));
        setText(elements.feeBalance, formatMoney(balance));

        setText(elements.breakdownAssessed, formatMoney(assessed));
        setText(elements.breakdownReceived, formatMoney(received));
        setText(elements.breakdownBalance, formatMoney(balance));

        setText(elements.paymentPercentage, `${percentage.toFixed(1)}%`);

        if (elements.paymentProgress) {
            elements.paymentProgress.setAttribute(
                "aria-valuenow",
                percentage.toFixed(1)
            );
        }

        if (elements.paymentProgressBar) {
            elements.paymentProgressBar.style.width = `${percentage}%`;
        }
    }

    function renderFunding(student) {
        setStatus(
            elements.loanStatus,
            student.loanStatus,
            getStatusClass(student.loanStatus)
        );

        setText(
            elements.approvedAmount,
            formatMoney(student.approvedAmount)
        );

        setText(
            elements.disbursedAmount,
            formatMoney(student.disbursedAmount)
        );

        setText(
            elements.institutionReceived,
            formatMoney(student.institutionReceived)
        );

        setText(
            elements.fundingExplanation,
            getFundingExplanation(student)
        );
    }

    function renderPortal(student) {
        renderProfile(student);
        renderFinance(student);
        renderFunding(student);
    }

    /*
     * The prototype currently uses a fixed sample record.
     * No student can change identity by editing the page,
     * and no data is sent to a server.
     */
    renderPortal(sampleStudent);

    /*
     * Expose read-only calculation helpers for future
     * integration and manual browser-console testing.
     * These are not authentication or authorization controls.
     */
    window.SLBIMSStudentPortal = Object.freeze({
        formatMoney,
        calculateFeeBalance,
        calculatePaymentPercentage
    });
});
