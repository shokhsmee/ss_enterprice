import { Component, t, useProps } from "@odoo/owl";
import { useSubEnv } from "@web/owl2/utils";
import { View, getDefaultConfig } from "@web/views/view";

/**
 * The form pane of a split list view: a plain form view on the record that is
 * selected in the list.
 *
 * It runs in its own `config` sub-environment. Sharing the list's config would
 * let the form call `setDisplayName`, which renames the breadcrumb of the
 * action the list still owns; the action id and the view list are carried over
 * by hand so the form view of the action is still the one that gets loaded.
 */
export class SsSplitForm extends Component {
    static template = "ss_enterprice.SplitForm";
    static components = { View };

    props = useProps({
        resModel: t.string(),
        resId: t.or([t.number(), t.boolean()]),
        context: t.object().optional({}),
        // CallbackRecorder the form registers its `beforeLeave` on, so the list
        // can flush unsaved changes before it swaps the record.
        beforeLeave: t.any().optional(),
        onSave: t.function().optional(() => () => {}),
    });

    setup() {
        const parent = this.env.config;
        useSubEnv({
            // The pane is narrow whatever the window measures; the chatter reads
            // this to stack itself under the form instead of squeezing beside it.
            ssInSplitPane: true,
            config: {
                ...getDefaultConfig(),
                actionId: parent.actionId,
                actionType: parent.actionType,
                actionXmlId: parent.actionXmlId,
                views: parent.views,
            },
        });
    }

    /** No search panel, and no breadcrumbs: the list already owns them. */
    get display() {
        return { mode: "current", searchPanel: false };
    }
}
