from odoo import fields, models


class ResUsersSettings(models.Model):
    _inherit = 'res.users.settings'

    # A plain ordered list of ir.ui.menu ids rather than a many2many: the pin
    # order is the user's, and `_res_users_settings_format` ships the value to
    # the browser as-is in `session.user_settings`. Ids of menus the user may
    # not see are simply not resolved client-side.
    ss_pinned_menus = fields.Json(
        string="Pinned Menus",
        help="Menus pinned to the top of the SS Enterprise sidebar, in pin order.",
    )
