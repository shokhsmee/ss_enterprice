import { patch } from "@web/core/utils/patch";
import { FormCompiler } from "@web/views/form/form_compiler";

// Rather than forcing `mailLayout()` to "NONE" -- which would also take the
// attachment preview down with it -- the condition is added to the chatter
// containers only. The sheet then reclaims the space on its own.
patch(FormCompiler.prototype, {
    compile(node, params) {
        const res = super.compile(...arguments);
        for (const hook of res.querySelectorAll(".o-mail-Form-chatter")) {
            const condition = hook.getAttribute("t-if") || "true";
            hook.setAttribute("t-if", `(${condition}) and !__comp__.ssChatterHidden()`);
        }
        return res;
    },
});
