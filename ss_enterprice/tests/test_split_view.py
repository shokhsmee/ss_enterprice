from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestSsSplitView(HttpCase):
    def test_split_view_tour(self):
        """The list keeps its rows and opens the record in a second pane."""
        self.start_tour("/odoo/contacts", "ss_enterprice_split_view", login="admin")

    def test_split_view_on_primary_list_template(self):
        """Lists that copy web.ListView instead of using it still get the split."""
        installed = self.env["ir.module.module"].search_count(
            [("name", "=", "purchase"), ("state", "=", "installed")]
        )
        if not installed:
            self.skipTest("purchase is not installed")
        self.start_tour(
            "/odoo/purchase", "ss_enterprice_split_primary_template", login="admin"
        )

    def test_pane_chatter_scrolls_its_own_thread(self):
        """Only the messages move: the form and the composer stay where they are.

        Needs a thread long enough to overflow, so the record is built here
        rather than relying on whatever demo data happens to be around.
        """
        partner = self.env["res.partner"].create({"name": "ZZ Chatter Scroll Probe"})
        for index in range(25):
            partner.message_post(body="probe message number {}".format(index))
        self.env.cr.flush()
        self.browser_js(
            "/odoo",
            CHATTER_SCROLL_CODE.replace("PARTNER_ID", str(partner.id)),
            login="admin",
            timeout=240,
        )


CHATTER_SCROLL_CODE = """
(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const fail = (msg) => { throw new Error(msg); };
    while (!odoo.__WOWL_DEBUG__?.root?.env) { await sleep(200); }
    const env = odoo.__WOWL_DEBUG__.root.env;
    await env.services.action.doAction({
        type: "ir.actions.act_window", res_model: "res.partner",
        domain: [["id", "=", PARTNER_ID]], views: [[false, "list"], [false, "form"]],
    });
    await sleep(1500);
    const toggle = document.querySelector("button.o_ss_split_toggle");
    if (toggle && !toggle.classList.contains("active")) { toggle.click(); await sleep(700); }
    document.querySelector(".o_ss_split_list .o_data_row .o_data_cell").click();
    await sleep(3000);

    const box = document.querySelector(".o_ss_split_pane .o-mail-Form-chatter");
    if (!box) fail("no chatter in the split pane");
    const thread = box.querySelector(".o-mail-Thread");
    const top = box.querySelector(".o-mail-Chatter-top");
    if (!thread) fail("no message thread in the chatter");

    if (thread.scrollHeight <= thread.clientHeight + 2) {
        fail("the thread does not scroll: client " + thread.clientHeight
             + " scroll " + thread.scrollHeight);
    }
    if (box.scrollHeight > box.clientHeight + 2) {
        fail("the chatter itself scrolls instead of its thread");
    }
    const topBefore = top.getBoundingClientRect().top;
    thread.scrollTop = 400;
    await sleep(300);
    if (thread.scrollTop < 100) fail("the thread would not move, scrollTop " + thread.scrollTop);
    if (Math.abs(top.getBoundingClientRect().top - topBefore) > 2) {
        fail("the composer moved while the thread scrolled");
    }
    console.log("SCROLL ok thread client=" + thread.clientHeight
        + " scroll=" + thread.scrollHeight + " scrollTop=" + thread.scrollTop);
    console.log("test successful");
})();
"""
