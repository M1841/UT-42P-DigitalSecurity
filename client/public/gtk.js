/**
 * GTK Framework - JavaScript Module
 * Version 1.0.0
 * Handles interactive behaviors for GTK Framework components
 */

(function (global) {
  "use strict";

  const GTK = {
    version: "1.0.0",

    /**
     * Initialize all GTK components
     */
    init: function () {
      this.initDropdowns();
      this.initModals();
      this.initTabs();
      this.initAccordions();
      this.initNavbarToggle();
      this.initAlertDismiss();
      this.initTooltips();
      this.initMobileChat();

      // Add keyboard navigation support
      this.initKeyboardSupport();
    },

    /**
     * Dropdown Component
     */
    initDropdowns: function () {
      const dropdowns = document.querySelectorAll(".gtk-dropdown");

      dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".gtk-dropdown-toggle");
        const menu = dropdown.querySelector(".gtk-dropdown-menu");

        if (!toggle || !menu) return;

        toggle.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(dropdown, menu);
        });

        // Handle menu item clicks
        const items = menu.querySelectorAll(".gtk-dropdown-item");
        items.forEach((item) => {
          item.addEventListener("click", () => {
            this.closeDropdown(menu);
          });
        });
      });

      // Close dropdowns when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".gtk-dropdown")) {
          this.closeAllDropdowns();
        }
      });
    },

    toggleDropdown: function (dropdown, menu) {
      const isOpen = menu.classList.contains("gtk-show");

      // Close all other dropdowns first
      this.closeAllDropdowns();

      if (!isOpen) {
        menu.classList.add("gtk-show");
        dropdown.setAttribute("aria-expanded", "true");
      }
    },

    closeDropdown: function (menu) {
      menu.classList.remove("gtk-show");
      const dropdown = menu.closest(".gtk-dropdown");
      if (dropdown) {
        dropdown.setAttribute("aria-expanded", "false");
      }
    },

    closeAllDropdowns: function () {
      document
        .querySelectorAll(".gtk-dropdown-menu.gtk-show")
        .forEach((menu) => {
          this.closeDropdown(menu);
        });
    },

    /**
     * Modal Component
     */
    initModals: function () {
      // Modal triggers
      document.querySelectorAll("[data-gtk-modal]").forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          e.preventDefault();
          const modalId = trigger.getAttribute("data-gtk-modal");
          this.openModal(modalId);
        });
      });

      // Close buttons
      document
        .querySelectorAll(".gtk-modal-close, [data-gtk-modal-close]")
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            const modal = btn.closest(".gtk-modal");
            if (modal) {
              this.closeModal(modal.id);
            }
          });
        });

      // Backdrop click to close
      document.querySelectorAll(".gtk-modal-backdrop").forEach((backdrop) => {
        backdrop.addEventListener("click", () => {
          const modalId = backdrop.getAttribute("data-gtk-modal-backdrop");
          if (modalId) {
            this.closeModal(modalId);
          }
        });
      });

      // ESC key to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const openModal = document.querySelector(".gtk-modal.gtk-show");
          if (openModal) {
            this.closeModal(openModal.id);
          }
        }
      });
    },

    openModal: function (modalId) {
      const modal = document.getElementById(modalId);
      const backdrop = document.querySelector(
        `[data-gtk-modal-backdrop="${modalId}"]`,
      );

      if (modal) {
        modal.classList.add("gtk-show");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        // Focus first focusable element
        const focusable = modal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable) {
          setTimeout(() => focusable.focus(), 100);
        }
      }

      if (backdrop) {
        backdrop.classList.add("gtk-show");
      }

      // Dispatch custom event
      this.dispatch("gtk:modal:open", { modalId });
    },

    closeModal: function (modalId) {
      const modal = document.getElementById(modalId);
      const backdrop = document.querySelector(
        `[data-gtk-modal-backdrop="${modalId}"]`,
      );

      if (modal) {
        modal.classList.remove("gtk-show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }

      if (backdrop) {
        backdrop.classList.remove("gtk-show");
      }

      // Dispatch custom event
      this.dispatch("gtk:modal:close", { modalId });
    },

    /**
     * Tabs Component
     */
    initTabs: function () {
      document.querySelectorAll(".gtk-tabs").forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(".gtk-tab");

        tabs.forEach((tab) => {
          tab.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute("data-gtk-tab");
            this.switchTab(tabContainer, tab, targetId);
          });
        });
      });
    },

    switchTab: function (container, activeTab, targetId) {
      // Update tab states
      const tabs = container.querySelectorAll(".gtk-tab");
      tabs.forEach((tab) => {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      });
      activeTab.classList.add("active");
      activeTab.setAttribute("aria-selected", "true");

      // Find the parent of tabs and look for tab content
      const tabsParent = container.parentElement;
      const contents = tabsParent.querySelectorAll(".gtk-tab-content");

      contents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === targetId) {
          content.classList.add("active");
        }
      });

      // Dispatch custom event
      this.dispatch("gtk:tab:change", { tabId: targetId });
    },

    /**
     * Accordion Component
     */
    initAccordions: function () {
      document.querySelectorAll(".gtk-accordion").forEach((accordion) => {
        const headers = accordion.querySelectorAll(".gtk-accordion-header");

        headers.forEach((header) => {
          header.addEventListener("click", () => {
            const item = header.closest(".gtk-accordion-item");
            const isMultiple = accordion.hasAttribute(
              "data-gtk-accordion-multiple",
            );

            if (!isMultiple) {
              // Close other items
              accordion
                .querySelectorAll(".gtk-accordion-item")
                .forEach((otherItem) => {
                  if (otherItem !== item) {
                    otherItem.classList.remove("active");
                    otherItem
                      .querySelector(".gtk-accordion-header")
                      .setAttribute("aria-expanded", "false");
                  }
                });
            }

            // Toggle current item
            item.classList.toggle("active");
            const isExpanded = item.classList.contains("active");
            header.setAttribute("aria-expanded", isExpanded.toString());

            // Dispatch custom event
            this.dispatch("gtk:accordion:toggle", {
              item,
              isExpanded,
            });
          });
        });
      });
    },

    /**
     * Navbar Toggle (Mobile)
     */
    initNavbarToggle: function () {
      document.querySelectorAll(".gtk-navbar-toggle").forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const navbar = toggle.closest(".gtk-navbar");
          const collapse = navbar.querySelector(".gtk-navbar-collapse");

          if (collapse) {
            collapse.classList.toggle("gtk-show");
            const isExpanded = collapse.classList.contains("gtk-show");
            toggle.setAttribute("aria-expanded", isExpanded.toString());
          }
        });
      });
    },

    /**
     * Alert Dismiss
     */
    initAlertDismiss: function () {
      document.querySelectorAll(".gtk-alert-close").forEach((btn) => {
        btn.addEventListener("click", () => {
          const alert = btn.closest(".gtk-alert");
          if (alert) {
            alert.style.opacity = "0";
            alert.style.transform = "translateY(-10px)";
            setTimeout(() => {
              alert.remove();
            }, 150);

            // Dispatch custom event
            this.dispatch("gtk:alert:dismiss", { alert });
          }
        });
      });
    },

    /**
     * Tooltips
     */
    initTooltips: function () {
      document.querySelectorAll("[data-gtk-tooltip]").forEach((element) => {
        const text = element.getAttribute("data-gtk-tooltip");

        // Create tooltip element
        const tooltip = document.createElement("span");
        tooltip.className = "gtk-tooltip-content";
        tooltip.textContent = text;

        // Wrap element if not already wrapped
        if (!element.classList.contains("gtk-tooltip")) {
          element.classList.add("gtk-tooltip");
        }

        element.appendChild(tooltip);
      });
    },

    /**
     * Toast Notifications
     */
    toastContainer: null,

    getToastContainer: function () {
      if (!this.toastContainer) {
        this.toastContainer = document.createElement("div");
        this.toastContainer.className = "gtk-toast-container";
        document.body.appendChild(this.toastContainer);
      }
      return this.toastContainer;
    },

    toast: function (options) {
      const defaults = {
        title: "",
        message: "",
        type: "info", // info, success, warning, error
        duration: 5000,
        closable: true,
      };

      const settings = { ...defaults, ...options };
      const container = this.getToastContainer();

      const toast = document.createElement("div");
      toast.className = `gtk-toast gtk-toast-${settings.type}`;

      const icons = {
        info: '<svg class="gtk-toast-icon" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M10 9v4M10 6h.01"/></svg>',
        success:
          '<svg class="gtk-toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>',
        warning:
          '<svg class="gtk-toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/></svg>',
        error:
          '<svg class="gtk-toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>',
      };

      toast.innerHTML = `
        ${icons[settings.type]}
        <div class="gtk-toast-content">
          ${settings.title ? `<p class="gtk-toast-title">${settings.title}</p>` : ""}
          ${settings.message ? `<p class="gtk-toast-message">${settings.message}</p>` : ""}
        </div>
        ${settings.closable ? '<button class="gtk-toast-close" aria-label="Close">×</button>' : ""}
      `;

      container.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add("gtk-show");
      });

      // Close button handler
      if (settings.closable) {
        toast
          .querySelector(".gtk-toast-close")
          .addEventListener("click", () => {
            this.dismissToast(toast);
          });
      }

      // Auto dismiss
      if (settings.duration > 0) {
        setTimeout(() => {
          this.dismissToast(toast);
        }, settings.duration);
      }

      return toast;
    },

    dismissToast: function (toast) {
      toast.classList.remove("gtk-show");
      setTimeout(() => {
        toast.remove();
      }, 250);
    },

    /**
     * Keyboard Support
     */
    initKeyboardSupport: function () {
      // Add keyboard navigation for dropdowns
      document.addEventListener("keydown", (e) => {
        const dropdown = document.querySelector(".gtk-dropdown-menu.gtk-show");

        if (dropdown) {
          const items = dropdown.querySelectorAll(
            ".gtk-dropdown-item:not(:disabled)",
          );
          const currentIndex = Array.from(items).findIndex(
            (item) => item === document.activeElement,
          );

          if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextIndex =
              currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items[nextIndex].focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIndex =
              currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items[prevIndex].focus();
          } else if (
            e.key === "Enter" &&
            document.activeElement.classList.contains("gtk-dropdown-item")
          ) {
            document.activeElement.click();
          }
        }
      });
    },

    /**
     * Custom Event Dispatcher
     */
    dispatch: function (eventName, detail) {
      const event = new CustomEvent(eventName, {
        detail,
        bubbles: true,
      });
      document.dispatchEvent(event);
    },

    /**
     * Utility: Query selector helper
     */
    $: function (selector, context = document) {
      return context.querySelector(selector);
    },

    $$: function (selector, context = document) {
      return context.querySelectorAll(selector);
    },

    /**
     * Utility: Add event listener to multiple elements
     */
    on: function (elements, event, handler) {
      if (typeof elements === "string") {
        elements = document.querySelectorAll(elements);
      }
      elements.forEach((el) => el.addEventListener(event, handler));
    },

    /**
     * Utility: Toggle class
     */
    toggleClass: function (element, className) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (element) {
        element.classList.toggle(className);
      }
    },

    /**
     * Utility: Create element with attributes
     */
    createElement: function (tag, attributes = {}, innerHTML = "") {
      const el = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === "className") {
          el.className = value;
        } else if (key.startsWith("data-")) {
          el.setAttribute(key, value);
        } else {
          el[key] = value;
        }
      });
      if (innerHTML) {
        el.innerHTML = innerHTML;
      }
      return el;
    },

    /**
     * Range slider value display
     */
    initRangeSliders: function () {
      document
        .querySelectorAll(".gtk-range[data-gtk-range-output]")
        .forEach((range) => {
          const outputId = range.getAttribute("data-gtk-range-output");
          const output = document.getElementById(outputId);

          if (output) {
            output.textContent = range.value;
            range.addEventListener("input", () => {
              output.textContent = range.value;
            });
          }
        });
    },

    /* ============================================
       MOBILE CHAT APPLICATION COMPONENTS
       ============================================ */

    /**
     * Initialize Mobile Chat Components
     */
    initMobileChat: function () {
      this.initChatInput();
      this.initViewStack();
      this.initActionSheets();
      this.initMobileTabBar();
      this.initThemeEditor();
      this.initAccentColorPicker();
    },

    /**
     * Auto-expanding Chat Input
     */
    initChatInput: function () {
      document.querySelectorAll(".gtk-chat-input").forEach((input) => {
        // Auto-expand textarea
        const adjustHeight = () => {
          input.style.height = "auto";
          input.style.height = Math.min(input.scrollHeight, 150) + "px";
        };

        input.addEventListener("input", adjustHeight);

        // Reset height on clear
        input.addEventListener("focus", adjustHeight);

        // Handle send on Enter (without Shift)
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const container = input.closest(".gtk-chat-input-container");
            const sendBtn = container?.querySelector(".gtk-chat-send-btn");
            if (sendBtn && !sendBtn.disabled) {
              sendBtn.click();
            }
          }
        });

        // Toggle send button state
        const updateSendButton = () => {
          const container = input.closest(".gtk-chat-input-container");
          const sendBtn = container?.querySelector(".gtk-chat-send-btn");
          if (sendBtn) {
            sendBtn.disabled = input.value.trim().length === 0;
          }
        };

        input.addEventListener("input", updateSendButton);
        updateSendButton();
      });
    },

    /**
     * View Stack Navigation (for mobile-style navigation)
     */
    viewHistory: [],

    initViewStack: function () {
      // Initialize back buttons
      document.querySelectorAll("[data-gtk-view-back]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.navigateBack();
        });
      });

      // Initialize view triggers
      document.querySelectorAll("[data-gtk-view-target]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
          const targetId = trigger.getAttribute("data-gtk-view-target");
          this.navigateToView(targetId);
        });
      });
    },

    navigateToView: function (viewId) {
      const viewStack = document.querySelector(".gtk-view-stack");
      if (!viewStack) return;

      const currentView = viewStack.querySelector(".gtk-view.active");
      const targetView = document.getElementById(viewId);

      if (!targetView || targetView === currentView) return;

      // Save current view to history
      if (currentView) {
        this.viewHistory.push(currentView.id);
        currentView.classList.remove("active");
        currentView.classList.add("exiting");

        setTimeout(() => {
          currentView.classList.remove("exiting");
        }, 300);
      }

      // Show target view
      targetView.classList.add("active");

      // Dispatch event
      this.dispatch("gtk:view:change", {
        from: currentView?.id,
        to: viewId,
      });
    },

    navigateBack: function () {
      if (this.viewHistory.length === 0) return;

      const previousViewId = this.viewHistory.pop();
      const viewStack = document.querySelector(".gtk-view-stack");
      if (!viewStack) return;

      const currentView = viewStack.querySelector(".gtk-view.active");
      const previousView = document.getElementById(previousViewId);

      if (!previousView) return;

      if (currentView) {
        currentView.classList.remove("active");
      }

      previousView.classList.add("active");

      this.dispatch("gtk:view:back", {
        from: currentView?.id,
        to: previousViewId,
      });
    },

    /**
     * Action Sheets (Bottom Sheets)
     */
    initActionSheets: function () {
      // Open triggers
      document
        .querySelectorAll("[data-gtk-action-sheet]")
        .forEach((trigger) => {
          trigger.addEventListener("click", () => {
            const sheetId = trigger.getAttribute("data-gtk-action-sheet");
            this.openActionSheet(sheetId);
          });
        });

      // Close on backdrop click
      document
        .querySelectorAll(".gtk-action-sheet-backdrop")
        .forEach((backdrop) => {
          backdrop.addEventListener("click", () => {
            const sheetId = backdrop.getAttribute(
              "data-gtk-action-sheet-backdrop",
            );
            if (sheetId) {
              this.closeActionSheet(sheetId);
            }
          });
        });

      // Close buttons
      document
        .querySelectorAll("[data-gtk-action-sheet-close]")
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            const sheet = btn.closest(".gtk-action-sheet");
            if (sheet) {
              this.closeActionSheet(sheet.id);
            }
          });
        });

      // Handle swipe down to close
      document.querySelectorAll(".gtk-action-sheet").forEach((sheet) => {
        let startY = 0;
        let currentY = 0;

        sheet.addEventListener(
          "touchstart",
          (e) => {
            startY = e.touches[0].clientY;
          },
          { passive: true },
        );

        sheet.addEventListener(
          "touchmove",
          (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 0) {
              sheet.style.transform = `translateY(${diff}px)`;
            }
          },
          { passive: true },
        );

        sheet.addEventListener("touchend", () => {
          const diff = currentY - startY;

          if (diff > 100) {
            this.closeActionSheet(sheet.id);
          }

          sheet.style.transform = "";
          startY = 0;
          currentY = 0;
        });
      });
    },

    openActionSheet: function (sheetId) {
      const sheet = document.getElementById(sheetId);
      const backdrop = document.querySelector(
        `[data-gtk-action-sheet-backdrop="${sheetId}"]`,
      );

      if (sheet) {
        sheet.classList.add("gtk-show");
        document.body.style.overflow = "hidden";
      }

      if (backdrop) {
        backdrop.classList.add("gtk-show");
      }

      this.dispatch("gtk:actionsheet:open", { sheetId });
    },

    closeActionSheet: function (sheetId) {
      const sheet = document.getElementById(sheetId);
      const backdrop = document.querySelector(
        `[data-gtk-action-sheet-backdrop="${sheetId}"]`,
      );

      if (sheet) {
        sheet.classList.remove("gtk-show");
        sheet.style.transform = "";
        document.body.style.overflow = "";
      }

      if (backdrop) {
        backdrop.classList.remove("gtk-show");
      }

      this.dispatch("gtk:actionsheet:close", { sheetId });
    },

    /**
     * Mobile Tab Bar
     */
    initMobileTabBar: function () {
      document.querySelectorAll(".gtk-mobile-tabbar").forEach((tabbar) => {
        const tabs = tabbar.querySelectorAll(".gtk-mobile-tab");

        tabs.forEach((tab) => {
          tab.addEventListener("click", (e) => {
            // If it's a link, don't prevent default
            if (tab.tagName === "A" && tab.getAttribute("href") !== "#") {
              return;
            }

            e.preventDefault();

            // Update active state
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            // Handle view switching if data attribute present
            const viewTarget = tab.getAttribute("data-gtk-tab-view");
            if (viewTarget) {
              this.switchMobileView(viewTarget);
            }

            this.dispatch("gtk:mobiletab:change", {
              tab: tab,
              viewTarget,
            });
          });
        });
      });
    },

    switchMobileView: function (viewId) {
      document.querySelectorAll(".gtk-mobile-view").forEach((view) => {
        view.classList.remove("active");
        if (view.id === viewId) {
          view.classList.add("active");
        }
      });
    },

    /**
     * Theme Editor
     */
    currentTheme: "auto",

    initThemeEditor: function () {
      // Theme mode selector
      document.querySelectorAll(".gtk-theme-mode-option").forEach((option) => {
        option.addEventListener("click", () => {
          const mode = option.getAttribute("data-gtk-theme-mode");
          this.setThemeMode(mode);

          // Update UI
          document.querySelectorAll(".gtk-theme-mode-option").forEach((o) => {
            o.classList.remove("active");
          });
          option.classList.add("active");
        });
      });

      // Load saved theme
      const savedTheme = localStorage.getItem("gtk-theme-mode");
      if (savedTheme) {
        this.setThemeMode(savedTheme);
        const activeOption = document.querySelector(
          `[data-gtk-theme-mode="${savedTheme}"]`,
        );
        if (activeOption) {
          document
            .querySelectorAll(".gtk-theme-mode-option")
            .forEach((o) => o.classList.remove("active"));
          activeOption.classList.add("active");
        }
      }
    },

    setThemeMode: function (mode) {
      this.currentTheme = mode;
      localStorage.setItem("gtk-theme-mode", mode);

      const root = document.documentElement;

      if (mode === "light") {
        root.setAttribute("data-gtk-theme", "light");
        root.style.colorScheme = "light";
      } else if (mode === "dark") {
        root.setAttribute("data-gtk-theme", "dark");
        root.style.colorScheme = "dark";
      } else {
        root.removeAttribute("data-gtk-theme");
        root.style.colorScheme = "light dark";
      }

      this.dispatch("gtk:theme:change", { mode });
    },

    /**
     * Accent Color Picker
     */
    currentAccentColor: "#3584e4",

    initAccentColorPicker: function () {
      // Preset color options
      document
        .querySelectorAll(".gtk-accent-color-option")
        .forEach((option) => {
          option.addEventListener("click", () => {
            const color = getComputedStyle(option).backgroundColor;
            this.setAccentColor(color);

            // Update UI
            document
              .querySelectorAll(".gtk-accent-color-option")
              .forEach((o) => {
                o.classList.remove("active");
              });
            option.classList.add("active");
          });
        });

      // Custom color input
      document.querySelectorAll(".gtk-color-input").forEach((input) => {
        input.addEventListener("input", (e) => {
          this.setAccentColor(e.target.value);

          // Update hex display if present
          const container = input.closest(".gtk-custom-color-input");
          const hexInput = container?.querySelector(".gtk-custom-color-hex");
          if (hexInput) {
            hexInput.value = e.target.value.toUpperCase();
          }

          // Deselect preset options
          document.querySelectorAll(".gtk-accent-color-option").forEach((o) => {
            o.classList.remove("active");
          });
        });

        // Hex input sync
        const container = input.closest(".gtk-custom-color-input");
        const hexInput = container?.querySelector(".gtk-custom-color-hex");
        if (hexInput) {
          hexInput.addEventListener("input", (e) => {
            let hex = e.target.value;
            if (!hex.startsWith("#")) hex = "#" + hex;
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
              input.value = hex;
              this.setAccentColor(hex);
            }
          });
        }
      });

      // Load saved accent color
      const savedColor = localStorage.getItem("gtk-accent-color");
      if (savedColor) {
        this.setAccentColor(savedColor);
      }
    },

    setAccentColor: function (color) {
      // Convert rgb to hex if needed
      if (color.startsWith("rgb")) {
        const rgb = color.match(/\d+/g);
        if (rgb) {
          color =
            "#" +
            rgb.map((x) => parseInt(x).toString(16).padStart(2, "0")).join("");
        }
      }

      this.currentAccentColor = color;
      localStorage.setItem("gtk-accent-color", color);

      // Apply to CSS custom properties
      const root = document.documentElement;
      root.style.setProperty("--gtk-accent", color);

      // Calculate hover and active variants
      const hsl = this.hexToHSL(color);
      const hoverColor = this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 8));
      const activeColor = this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 15));
      const bgColor = this.hexToRGBA(color, 0.15);

      root.style.setProperty("--gtk-accent-hover", hoverColor);
      root.style.setProperty("--gtk-accent-active", activeColor);
      root.style.setProperty("--gtk-accent-bg", bgColor);

      this.dispatch("gtk:accent:change", { color });
    },

    // Color utility functions
    hexToHSL: function (hex) {
      hex = hex.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      return { h: h * 360, s: s * 100, l: l * 100 };
    },

    hslToHex: function (h, s, l) {
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    },

    hexToRGBA: function (hex, alpha) {
      hex = hex.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Chat Message Helper
     */
    addChatMessage: function (container, options) {
      const defaults = {
        text: "",
        type: "outgoing", // 'incoming' or 'outgoing'
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent", // 'sent', 'delivered', 'read'
        avatar: null,
      };

      const settings = { ...defaults, ...options };
      const messagesContainer =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      if (!messagesContainer) return null;

      const message = document.createElement("div");
      message.className = `gtk-message gtk-message-${settings.type}`;

      let avatarHTML = "";
      if (settings.avatar && settings.type === "incoming") {
        avatarHTML = `
          <div class="gtk-message-avatar">
            <div class="gtk-avatar gtk-avatar-sm">${settings.avatar}</div>
          </div>
        `;
      }

      let statusHTML = "";
      if (settings.type === "outgoing") {
        const statusIcons = {
          sent: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8l4 4 8-8"/></svg>',
          delivered:
            '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 8l3 3 6-6M6 11l3 3 6-6"/></svg>',
          read: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 8l3 3 6-6M6 11l3 3 6-6"/></svg>',
        };

        statusHTML = `
          <div class="gtk-message-status ${settings.status}">
            <span class="gtk-message-status-icon">${statusIcons[settings.status]}</span>
          </div>
        `;
      }

      message.innerHTML = `
        ${avatarHTML}
        <div class="gtk-message-content">
          <div class="gtk-message-bubble">${settings.text}</div>
          <div class="gtk-message-time">${settings.time}</div>
          ${statusHTML}
        </div>
      `;

      messagesContainer.appendChild(message);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      this.dispatch("gtk:chat:message", { message: settings });

      return message;
    },

    /**
     * Typing Indicator
     */
    showTypingIndicator: function (container, name) {
      const messagesContainer =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      if (!messagesContainer) return null;

      // Remove existing indicator
      this.hideTypingIndicator(container);

      const indicator = document.createElement("div");
      indicator.className = "gtk-typing-indicator";
      indicator.setAttribute("data-gtk-typing", "true");
      indicator.innerHTML = `
        <div class="gtk-typing-dots">
          <span class="gtk-typing-dot"></span>
          <span class="gtk-typing-dot"></span>
          <span class="gtk-typing-dot"></span>
        </div>
        <span>${name || "Someone"} is typing...</span>
      `;

      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      return indicator;
    },

    hideTypingIndicator: function (container) {
      const messagesContainer =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      if (!messagesContainer) return;

      const indicator = messagesContainer.querySelector("[data-gtk-typing]");
      if (indicator) {
        indicator.remove();
      }
    },
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => GTK.init());
  } else {
    GTK.init();
  }

  // Expose GTK to global scope
  global.GTK = GTK;
})(typeof window !== "undefined" ? window : this);
