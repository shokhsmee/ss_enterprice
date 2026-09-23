import { Component, signal } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";

/**
 * The grab strip on the edge the chatter grows from: its inline-start edge when
 * it sits beside the form, its top edge when it sits under it.
 *
 * It is a component rather than a bare div injected by the form compiler
 * because event directives added to compiled nodes are not bound.
 */
export class SsChatterResizer extends Component {
    static template = "ss_enterprice.ChatterResizer";
    static props = {};

    root = signal.ref();

    setup() {
        this.ssChatter = useService("ss_chatter");
    }

    get chatterEl() {
        return this.root()?.closest(".o-mail-Form-chatter") || null;
    }

    /** Stacked under the form, as opposed to beside it. */
    isStacked(chatterEl) {
        return !chatterEl.classList.contains("o-aside");
    }

    get label() {
        return _t("Drag to resize the chatter, double-click to reset it");
    }

    onPointerDown(ev) {
        const chatterEl = this.chatterEl;
        if (ev.button !== 0 || !chatterEl) {
            return;
        }
        ev.preventDefault();

        const stacked = this.isStacked(chatterEl);
        const rect = chatterEl.getBoundingClientRect();
        const start = stacked ? ev.clientY : ev.clientX;
        const startSize = stacked ? rect.height : rect.width;

        document.body.classList.add("o_ss_chatter_resizing");
        const onMove = (moveEv) => {
            // The handle is on the leading edge, so dragging towards it grows
            // the chatter: the delta is inverted.
            const delta = start - (stacked ? moveEv.clientY : moveEv.clientX);
            const next = startSize + delta;
            if (stacked) {
                this.ssChatter.setHeight(next, { persist: false });
            } else {
                this.ssChatter.setWidth(next, { persist: false });
            }
        };
        const onUp = () => {
            document.body.classList.remove("o_ss_chatter_resizing");
            if (stacked) {
                this.ssChatter.setHeight(this.ssChatter.height());
            } else {
                this.ssChatter.setWidth(this.ssChatter.width());
            }
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    }

    /** Back to the size Odoo gives the chatter on its own. */
    onDoubleClick() {
        const chatterEl = this.chatterEl;
        if (!chatterEl) {
            return;
        }
        if (this.isStacked(chatterEl)) {
            this.ssChatter.resetHeight();
        } else {
            this.ssChatter.resetWidth();
        }
    }
}
