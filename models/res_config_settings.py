from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    ss_sidebar_enabled = fields.Boolean(
        related='company_id.ss_sidebar_enabled', readonly=False)
    ss_sidebar_default_open = fields.Boolean(
        related='company_id.ss_sidebar_default_open', readonly=False)
    ss_sidebar_logo = fields.Binary(
        related='company_id.ss_sidebar_logo', readonly=False)

    ss_login_background = fields.Binary(
        related='company_id.ss_login_background', readonly=False)
    ss_login_position = fields.Selection(
        related='company_id.ss_login_position', readonly=False)
    ss_login_overlay = fields.Integer(
        related='company_id.ss_login_overlay', readonly=False)
    ss_login_tagline = fields.Char(
        related='company_id.ss_login_tagline', readonly=False)
    ss_login_note = fields.Text(
        related='company_id.ss_login_note', readonly=False)
    ss_login_hide_db_manager = fields.Boolean(
        related='company_id.ss_login_hide_db_manager', readonly=False)
