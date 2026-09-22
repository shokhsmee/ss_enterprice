import { patch } from "@web/core/utils/patch";
import { FormRenderer } from "@web/views/form/form_renderer";

// Loaded after mail's own FormRenderer patch (this module depends on `mail`),
// so `mailLayout` already exists here.
patch(FormRenderer.prototype, {
    setup() {
        super.setup();
        this.ssChatterState = this.env.services.ss_chatter;
    },

    /**
     * Read by the compiled form template to drop the chatter from the DOM.
     * Reading the signal here subscribes the renderer, so toggling re-renders.
     * @returns {boolean}
     */
    ssChatterHidden() {
        return Boolean(this.ssChatterState?.hidden());
    },
});
