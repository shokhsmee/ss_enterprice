import { signal, t } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { registry } from "@web/core/registry";

const KEY_ENABLED = "ss_enterprice.split_enabled";
const KEY_ORIENTATION = "ss_enterprice.split_orientation";
const KEY_SIZE = "ss_enterprice.split_size";

export const SS_SPLIT_MIN = 20;
export const SS_SPLIT_MAX = 80;
export const SS_SPLIT_DEFAULT = 55;

function read(key, fallback) {
    try {
        const value = browser.localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch {
        // private mode / blocked storage: fall back to the default
        return fallback;
    }
}

function write(key, value) {
    try {
        browser.localStorage.setItem(key, String(value));
    } catch {
        // the choice just won't survive a reload
    }
}

function clampSize(value) {
    const size = Number.parseFloat(value);
    if (!Number.isFinite(size)) {
        return SS_SPLIT_DEFAULT;
    }
    return Math.min(SS_SPLIT_MAX, Math.max(SS_SPLIT_MIN, size));
}

/**
 * Holds the split view preferences, shared between the control panel toggle and
 * the list views that render a form pane next to their rows. Only the
 * preferences live here; which record is open is per list view, so that it
 * resets by itself when you leave the action.
 */
export const ssSplitService = {
    start() {
        const enabled = signal(read(KEY_ENABLED, "0") === "1", { type: t.boolean() });
        const orientation = signal(
            read(KEY_ORIENTATION, "vertical") === "horizontal" ? "horizontal" : "vertical",
            { type: t.string() }
        );
        const size = signal(clampSize(read(KEY_SIZE, SS_SPLIT_DEFAULT)), { type: t.number() });

        return {
            enabled,
            orientation,
            /** Share of the content taken by the form pane, in percent. */
            size,
            toggle() {
                enabled.set(!enabled());
                write(KEY_ENABLED, enabled() ? "1" : "0");
            },
            setOrientation(value) {
                orientation.set(value === "horizontal" ? "horizontal" : "vertical");
                write(KEY_ORIENTATION, orientation());
            },
            /**
             * `persist` is false while a gutter is being dragged: the size
             * follows the pointer but is only written down when it is released.
             */
            setSize(value, { persist = true } = {}) {
                size.set(clampSize(value));
                if (persist) {
                    write(KEY_SIZE, size());
                }
            },
            resetSize() {
                size.set(SS_SPLIT_DEFAULT);
                write(KEY_SIZE, SS_SPLIT_DEFAULT);
            },
        };
    },
};

registry.category("services").add("ss_split", ssSplitService);
