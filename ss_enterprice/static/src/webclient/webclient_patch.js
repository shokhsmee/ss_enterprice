import { patch } from "@web/core/utils/patch";
import { WebClient } from "@web/webclient/webclient";
import { session } from "@web/session";
import { SsSidebar } from "../sidebar/sidebar";

// The component is exposed on the prototype rather than on `static components`
// so that the Enterprise web client, which copies `WebClient.components` when
// its class is defined, picks it up too.
patch(WebClient.prototype, {
    setup() {
        super.setup();
        this.ssSidebar = SsSidebar;
    },

    get ssSidebarEnabled() {
        return (session.ss_enterprice || {}).sidebar_enabled !== false;
    },
});
