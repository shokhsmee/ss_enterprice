import { Component } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";

/** Control panel button that shows/hides the chatter of a form view. */
export class SsChatterToggle extends Component {
    static template = "ss_enterprice.ChatterToggle";
    static props = {};

    setup() {
        this.ssChatter = useService("ss_chatter");
    }

    get isHidden() {
        return this.ssChatter.hidden();
    }

    get label() {
        return this.isHidden ? _t("Show chatter") : _t("Hide chatter");
    }

    onClick() {
        this.ssChatter.toggle();
    }
}
