import { signal, t } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { registry } from "@web/core/registry";

const STORAGE_KEY = "ss_enterprice.chatter_hidden";
const WIDTH_KEY = "ss_enterprice.chatter_width";
const HEIGHT_KEY = "ss_enterprice.chatter_height";

// Odoo's own aside width is $o-mail-Chatter-minWidth (530px). Dragging is
// allowed either side of it; an unset value means "leave Odoo's rule alone".
export const SS_CHATTER_MIN_WIDTH = 300;
export const SS_CHATTER_MAX_WIDTH = 1000;
export const SS_CHATTER_DEFAULT_HEIGHT = 320;
export const SS_CHATTER_MIN_HEIGHT = 120;
export const SS_CHATTER_MAX_HEIGHT = 900;

function read(key) {
    try {
        const value = Number.parseFloat(browser.localStorage.getItem(key));
        return Number.isFinite(value) ? value : null;
    } catch {
        // private mode / blocked storage: fall back to Odoo's own size
        return null;
    }
}

function write(key, value) {
    try {
        if (value === null) {
            browser.localStorage.removeItem(key);
        } else {
            browser.localStorage.setItem(key, String(value));
        }
    } catch {
        // the choice just won't survive a reload
    }
}

function clamp(value, min, max) {
    return Math.round(Math.min(max, Math.max(min, value)));
}

/**
 * Holds whether the chatter is hidden, and how big the user dragged it: a width
 * when it sits beside the form, a height when it sits under it in the split
 * pane. `null` means untouched, and Odoo's own sizing applies.
 */
export const ssChatterService = {
    start() {
        let initialHidden = false;
        try {
            initialHidden = browser.localStorage.getItem(STORAGE_KEY) === "1";
        } catch {
            // private mode / blocked storage: start with the chatter visible
        }
        const hidden = signal(initialHidden, { type: t.boolean() });
        const width = signal(read(WIDTH_KEY), { type: t.any() });
        const height = signal(read(HEIGHT_KEY), { type: t.any() });

        return {
            hidden,
            width,
            height,
            toggle() {
                hidden.set(!hidden());
                try {
                    browser.localStorage.setItem(STORAGE_KEY, hidden() ? "1" : "0");
                } catch {
                    // the choice just won't survive a reload
                }
            },
            /** `persist` is false while dragging; the value is written on release. */
            setWidth(value, { persist = true } = {}) {
                width.set(clamp(value, SS_CHATTER_MIN_WIDTH, SS_CHATTER_MAX_WIDTH));
                if (persist) {
                    write(WIDTH_KEY, width());
                }
            },
            setHeight(value, { persist = true } = {}) {
                height.set(clamp(value, SS_CHATTER_MIN_HEIGHT, SS_CHATTER_MAX_HEIGHT));
                if (persist) {
                    write(HEIGHT_KEY, height());
                }
            },
            /** Back to whatever Odoo would have done on its own. */
            resetWidth() {
                width.set(null);
                write(WIDTH_KEY, null);
            },
            resetHeight() {
                height.set(null);
                write(HEIGHT_KEY, null);
            },
        };
    },
};

registry.category("services").add("ss_chatter", ssChatterService);
