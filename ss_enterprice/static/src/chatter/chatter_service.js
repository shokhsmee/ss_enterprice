import { signal, t } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { registry } from "@web/core/registry";

const STORAGE_KEY = "ss_enterprice.chatter_hidden";

/**
 * Holds the "is the chatter hidden" flag, shared between the toggle button in
 * the control panel and the form renderer that decides whether to render it.
 */
export const ssChatterService = {
    start() {
        let initial = false;
        try {
            initial = browser.localStorage.getItem(STORAGE_KEY) === "1";
        } catch {
            // private mode / blocked storage: start with the chatter visible
        }
        const hidden = signal(initial, { type: t.boolean() });
        return {
            hidden,
            toggle() {
                hidden.set(!hidden());
                try {
                    browser.localStorage.setItem(STORAGE_KEY, hidden() ? "1" : "0");
                } catch {
                    // the choice just won't survive a reload
                }
            },
        };
    },
};

registry.category("services").add("ss_chatter", ssChatterService);
