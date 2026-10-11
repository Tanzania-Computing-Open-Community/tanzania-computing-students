
/* =========================================================
   SLB-IMS | HOME PAGE INTERACTIONS
   File: script.js
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".main-navigation");

    const dropdowns = document.querySelectorAll(".nav-dropdown");
    const dropdownButtons = document.querySelectorAll(".dropdown-toggle");

    const navigationLinks = document.querySelectorAll(
        ".main-navigation a"
    );

    const currentYear = document.getElementById("current-year");


    /* ==================== FOOTER YEAR ==================== */

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    /* ==================== MOBILE MENU ==================== */

    function setMobileMenu(open) {
        if (!menuToggle || !navigation) {
            return;
        }

        navigation.classList.toggle("open", open);

        menuToggle.setAttribute(
            "aria-expanded",
            String(open)
        );

        menuToggle.setAttribute(
            "aria-label",
            open ? "Close navigation menu" : "Open navigation menu"
        );

        if (!open) {
            closeAllDropdowns();
        }
    }

    if (menuToggle && navigation) {
        menuToggle.addEventListener("click", () => {
            const isOpen =
                menuToggle.getAttribute("aria-expanded") === "true";

            setMobileMenu(!isOpen);
        });
    }


    /* ==================== DROPDOWN MENUS ==================== */

    function closeDropdown(dropdown) {
        const button = dropdown.querySelector(".dropdown-toggle");

        dropdown.classList.remove("open");

        if (button) {
            button.setAttribute("aria-expanded", "false");
        }
    }

    function closeAllDropdowns(except = null) {
        dropdowns.forEach((dropdown) => {
            if (dropdown !== except) {
                closeDropdown(dropdown);
            }
        });
    }

    function toggleDropdown(dropdown) {
        const button = dropdown.querySelector(".dropdown-toggle");

        if (!button) {
            return;
        }

        const isOpen = dropdown.classList.contains("open");

        closeAllDropdowns(dropdown);

        dropdown.classList.toggle("open", !isOpen);

        button.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    }

    dropdownButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();

            const dropdown = button.closest(".nav-dropdown");

            if (dropdown) {
                toggleDropdown(dropdown);
            }
        });
    });


    /* ==================== NAVIGATION LINKS ==================== */

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            setMobileMenu(false);
        });
    });


    /* ==================== OUTSIDE CLICK ==================== */

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const clickedInsideDropdown = target.closest(".nav-dropdown");

        if (!clickedInsideDropdown) {
            closeAllDropdowns();
        }

        if (
            navigation &&
            menuToggle &&
            !navigation.contains(target) &&
            !menuToggle.contains(target)
        ) {
            setMobileMenu(false);
        }
    });


    /* ==================== KEYBOARD ACCESSIBILITY ==================== */

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllDropdowns();
            setMobileMenu(false);

            if (menuToggle) {
                menuToggle.focus();
            }
        }
    });


    /* ==================== RESPONSIVE NAVIGATION ==================== */

    const desktopBreakpoint = window.matchMedia("(min-width: 901px)");

    function handleViewportChange(event) {
        if (event.matches) {
            setMobileMenu(false);
        }
    }

    if (typeof desktopBreakpoint.addEventListener === "function") {
        desktopBreakpoint.addEventListener(
            "change",
            handleViewportChange
        );
    } else {
        // Compatibility with older browsers.
        desktopBreakpoint.addListener(handleViewportChange);
    }


    /* ==================== INTERNAL PAGE LINKS ==================== */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") {
                return;
            }

            const destination = document.querySelector(href);

            if (!destination) {
                return;
            }

            event.preventDefault();

            destination.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
                    ? "auto"
                    : "smooth",

                block: "start"
            });

            // Keep the URL in sync with the selected section.
            if (window.location.hash !== href) {
                window.history.replaceState(
                    null,
                    "",
                    href
                );
            }
        });
    });

});
