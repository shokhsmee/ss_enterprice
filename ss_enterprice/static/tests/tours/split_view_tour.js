import { registry } from "@web/core/registry";

registry.category("web_tour.tours").add("ss_enterprice_split_view", {
    steps: () => [
        {
            content: "Switch the contacts to their list view",
            trigger: ".o_cp_switch_buttons button.o_list",
            run: "click",
        },
        {
            content: "The split view is off, so the rows own the whole content",
            trigger: ".o_list_renderer .o_data_row",
        },
        {
            content: "Turn the split view on",
            trigger: "button.o_ss_split_toggle",
            run: "click",
        },
        {
            content: "The rows moved into the first pane, the second one waits",
            trigger: ".o_ss_split.o_ss_split_vertical .o_ss_split_list .o_list_renderer",
        },
        {
            trigger: ".o_ss_split_pane .o_ss_split_placeholder",
        },
        {
            content: "Open a record",
            trigger: ".o_ss_split_list .o_data_row:first-child .o_data_cell",
            run: "click",
        },
        {
            content: "It opens in the second pane, not over the list",
            trigger: ".o_ss_split_pane .o_form_view",
        },
        {
            content: "...and the list is still there",
            trigger: ".o_ss_split_list .o_list_renderer .o_data_row",
        },
        {
            content: "The form pane borrowed no breadcrumb from the list",
            trigger: ".o_ss_split_pane .o_form_view:not(:has(.o_breadcrumb))",
        },
        {
            content: "The chatter stacks under the form instead of squeezing beside it",
            trigger: ".o_ss_split_pane .o-mail-Form-chatter:not(.o-aside)",
        },
        {
            content: "The chatter can be dragged taller by its top edge",
            trigger: ".o_ss_split_pane .o-mail-Form-chatter > .o_ss_chatter_resizer",
            async run() {
                const chatter = () =>
                    document.querySelector(".o_ss_split_pane .o-mail-Form-chatter");
                const handle = chatter().querySelector(":scope > .o_ss_chatter_resizer");
                const before = chatter().getBoundingClientRect().height;
                const r = handle.getBoundingClientRect();
                const x = r.left + r.width / 2;
                const y = r.top + r.height / 2;
                const send = (target, type, clientY) =>
                    target.dispatchEvent(
                        new PointerEvent(type, {
                            bubbles: true,
                            cancelable: true,
                            clientX: x,
                            clientY,
                            button: 0,
                            pointerId: 1,
                        })
                    );
                send(handle, "pointerdown", y);
                send(window, "pointermove", y - 80);
                send(window, "pointerup", y - 80);
                await new Promise((resolve) => setTimeout(resolve, 400));
                const after = chatter().getBoundingClientRect().height;
                if (after <= before) {
                    throw new Error(`chatter did not grow: ${before} -> ${after}`);
                }
            },
        },
        {
            content: "Remember which record the pane is showing",
            trigger: ".o_ss_split_pane [name='name'] input",
            run() {
                window.__ssPaneFirst = document.querySelector(
                    ".o_ss_split_pane [name='name'] input"
                ).value;
            },
        },
        {
            content: "Pick a second row",
            trigger: ".o_ss_split_list .o_data_row:nth-child(2) .o_data_cell",
            run: "click",
        },
        {
            content: "The pane follows the selection instead of keeping the first record",
            trigger: ".o_ss_split_pane [name='name'] input",
            async run() {
                const read = () =>
                    document.querySelector(".o_ss_split_pane [name='name'] input")?.value;
                let shown = read();
                // The second record is still loading for a moment after the click.
                for (let i = 0; i < 50 && (!shown || shown === window.__ssPaneFirst); i++) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    shown = read();
                }
                if (!shown || shown === window.__ssPaneFirst) {
                    throw new Error(
                        `the pane did not follow the list, still showing ${JSON.stringify(shown)}`
                    );
                }
            },
        },
        {
            content: "Make the record impossible to save",
            trigger: ".o_ss_split_pane [name='name'] input",
            run() {
                // `edit ""` types a space, which is a perfectly saveable name;
                // the field has to be genuinely emptied to make the save fail.
                const input = document.querySelector(".o_ss_split_pane [name='name'] input");
                input.focus();
                input.value = "";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
            },
        },
        {
            content: "Leaving is refused, but it says so instead of going quiet",
            trigger: ".o_ss_sidebar_app:not(.o_ss_sidebar_app_current)",
            run: "click",
        },
        {
            trigger: ".o_notification:contains(cannot be saved) button:contains(Discard)",
            run: "click",
        },
        {
            content: "Discarding empties the pane so the list is free again",
            trigger: ".o_ss_split_pane .o_ss_split_placeholder",
        },
        {
            content: "Open a record again to check the close button",
            trigger: ".o_ss_split_list .o_data_row:first-child .o_data_cell",
            run: "click",
        },
        {
            trigger: "button.o_ss_split_close",
            run: "click",
        },
        {
            trigger: ".o_ss_split_pane .o_ss_split_placeholder",
        },
        {
            content: "Reopen one so the orientation check below has something to show",
            trigger: ".o_ss_split_list .o_data_row:first-child .o_data_cell",
            run: "click",
        },
        {
            trigger: ".o_ss_split_pane .o_form_view",
        },
        {
            content: "Flip it to top and bottom",
            trigger: "button.o_ss_split_orientation",
            run: "click",
        },
        {
            trigger: ".o_ss_split.o_ss_split_horizontal .o_ss_split_pane .o_form_view",
        },
        {
            content: "Turn the split view off again",
            trigger: "button.o_ss_split_toggle",
            run: "click",
        },
        {
            content: "The list goes back to owning the content area",
            trigger: ".o_content > .o_list_renderer",
        },
    ],
});

// Purchase builds its list template with t-inherit-mode="primary", which copies
// web.ListView as it stood at that point in the bundle. It is the regression
// guard for the split being prepended rather than appended.
registry.category("web_tour.tours").add("ss_enterprice_split_primary_template", {
    steps: () => [
        {
            trigger: ".o_cp_switch_buttons button.o_list",
            run: "click",
        },
        {
            content: "The toggle reached a list view with a template of its own",
            trigger: "button.o_ss_split_toggle",
            run: "click",
        },
        {
            trigger: ".o_ss_split .o_ss_split_list .o_list_renderer",
        },
        {
            trigger: ".o_ss_split_list .o_data_row:first-child .o_data_cell",
            run: "click",
        },
        {
            trigger: ".o_ss_split_pane .o_form_view",
        },
        {
            content: "Leave the split off for whatever runs next",
            trigger: "button.o_ss_split_close",
            run: "click",
        },
        {
            trigger: "button.o_ss_split_toggle",
            run: "click",
        },
    ],
});
