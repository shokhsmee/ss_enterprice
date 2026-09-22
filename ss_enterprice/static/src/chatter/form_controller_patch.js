import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { FormController } from "@web/views/form/form_controller";
import { SsChatterToggle } from "./chatter_toggle";

patch(FormController.prototype, {
    setup() {
        super.setup();
        this.ssChatterToggle = SsChatterToggle;
        useService("ss_chatter");
    },

    /** The button is only useful on a form that actually declares a chatter. */
    get ssHasChatter() {
        if (this.env.inDialog) {
            return false;
        }
        return Boolean(this.archInfo?.xmlDoc?.querySelector("chatter"));
    },
});
