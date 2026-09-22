from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class ResCompany(models.Model):
    _inherit = 'res.company'

    # --- Backend sidebar ---------------------------------------------------
    ss_sidebar_enabled = fields.Boolean(
        string="Left Sidebar",
        default=True,
        help="Show a collapsible sidebar on the left of the backend, with the "
             "menus of the current app and the list of the other apps.",
    )
    ss_sidebar_default_open = fields.Boolean(
        string="Sidebar Expanded by Default",
        default=True,
        help="State of the sidebar the first time a user loads the backend. "
             "Afterwards each user keeps their own choice.",
    )
    ss_sidebar_logo = fields.Binary(
        string="Sidebar Logo",
        attachment=True,
        help="Logo displayed at the top of the sidebar. "
             "Falls back to the company logo when empty.",
    )

    # --- Login page --------------------------------------------------------
    ss_login_background = fields.Binary(
        string="Login Background",
        attachment=True,
        help="Picture used as the full-screen background of the login page.",
    )
    ss_login_position = fields.Selection(
        selection=[
            ('left', "Left"),
            ('center', "Center"),
            ('right', "Right"),
        ],
        string="Login Form Position",
        default='center',
        required=True,
    )
    ss_login_overlay = fields.Integer(
        string="Login Overlay",
        default=35,
        help="Opacity (0-100) of the dark veil drawn over the background "
             "picture, to keep the login form readable.",
    )
    ss_login_tagline = fields.Char(
        string="Login Tagline",
        help="Short line shown inside the login card, under the logo.",
    )
    ss_login_note = fields.Text(
        string="Login Note",
        help="Plain text shown under the login card, e.g. a support address. "
             "Rendered escaped: the login page is served before anyone is "
             "authenticated, so no HTML is accepted here.",
    )
    ss_login_hide_db_manager = fields.Boolean(
        string="Hide Database Manager Link",
        help="Remove the 'Manage Databases' link from the login page.",
    )

    @api.constrains('ss_login_overlay')
    def _check_ss_login_overlay(self):
        for company in self:
            if not 0 <= company.ss_login_overlay <= 100:
                raise ValidationError(_("The login overlay must be between 0 and 100."))

    def _ss_asset_version(self):
        """Cache buster for the images served to the browser."""
        self.ensure_one()
        return str(int(self.write_date.timestamp())) if self.write_date else '0'
