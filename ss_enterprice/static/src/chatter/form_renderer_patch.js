import { patch } from "@web/core/utils/patch";
import { FormRenderer } from "@web/views/form/form_renderer";
import { SS_CHATTER_DEFAULT_HEIGHT } from "./chatter_service";
import { SsChatterResizer } from "./chatter_resizer";

// What `mailLayout` returns below the XXL breakpoint, for each of the layouts
// it only ever returns above it.
const SS_NARROW_LAYOUTS = {
    SIDE_CHATTER: "BOTTOM_CHATTER",
    COMBO: "BOTTOM_CHATTER",
    EXTERNAL_COMBO_XXL: "EXTERNAL_COMBO",
};

// Loaded after mail's own FormRenderer patch (this module depends on `mail`),
// so `mailLayout` already exists here.
patch(FormRenderer.prototype, {
    setup() {
        super.setup();
        this.ssChatterState = this.env.services.ss_chatter;
        this.ssChatterResizer = SsChatterResizer;
    },

    /**
     * Read by the compiled form template to drop the chatter from the DOM.
     * Reading the signal here subscribes the renderer, so toggling re-renders.
     * @returns {boolean}
     */
    ssChatterHidden() {
        return Boolean(this.ssChatterState?.hidden());
    },

    /**
     * `mailLayout` picks the side-by-side layouts off `uiService.size`, which
     * measures the window. Inside the split pane the window is still wide while
     * the form has half of it, so the chatter ends up wedged into a column too
     * narrow to read. Fall back to the layouts Odoo itself uses below XXL,
     * which put the chatter under the form.
     */
    mailLayout(hasAttachmentContainer) {
        const layout = super.mailLayout(hasAttachmentContainer);
        if (!this.env.ssInSplitPane) {
            return layout;
        }
        return SS_NARROW_LAYOUTS[layout] || layout;
    },

    /** True when the chatter is stacked under the form rather than beside it. */
    ssChatterIsStacked() {
        return !["SIDE_CHATTER", "EXTERNAL_COMBO_XXL", "EXTERNAL_COMBO"].includes(
            this.mailLayout(Boolean(this.props.record?.resId))
        );
    },

    /**
     * A stacked chatter is only given a height inside the split pane: on a plain
     * narrow window it flows after the sheet and pinning it would cost the form
     * the space it needs.
     */
    ssChatterStyle() {
        if (!this.ssChatterState) {
            return "";
        }
        if (this.ssChatterIsStacked()) {
            if (!this.env.ssInSplitPane) {
                return "";
            }
            const height = this.ssChatterState.height() ?? SS_CHATTER_DEFAULT_HEIGHT;
            return `height: ${height}px;`;
        }
        const width = this.ssChatterState.width();
        return width ? `width: ${width}px; flex-grow: 0;` : "";
    },

});
