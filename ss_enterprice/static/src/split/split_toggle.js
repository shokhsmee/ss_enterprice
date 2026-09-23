import { Component } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";

/**
 * Control panel buttons of the split view: one to show the form pane next to
 * the rows, one to flip it between side-by-side and top-and-bottom.
 */
export class SsSplitToggle extends Component {
    static template = "ss_enterprice.SplitToggle";
    // onBeforeToggle: the list view's chance to flush the pane before it is
    // unmounted; returning false keeps the split open.
    static props = {};

    setup() {
        this.ssSplit = useService("ss_split");
    }

    get isActive() {
        return this.ssSplit.enabled();
    }

    get isVertical() {
        return this.ssSplit.orientation() === "vertical";
    }

    get toggleLabel() {
        return this.isActive ? _t("Close the split view") : _t("Open records beside the list");
    }

    get orientationLabel() {
        return this.isVertical ? _t("Show the record below") : _t("Show the record beside");
    }

    async onToggleClick() {
        const proceed = await this.props.onBeforeToggle?.();
        if (proceed === false) {
            return;
        }
        this.ssSplit.toggle();
    }

    onOrientationClick() {
        this.ssSplit.setOrientation(this.isVertical ? "horizontal" : "vertical");
    }
}
