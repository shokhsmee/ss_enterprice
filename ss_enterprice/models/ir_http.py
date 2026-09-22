from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        info = super().session_info()
        info['ss_enterprice'] = self._ss_enterprice_session_info()
        return info

    def _ss_enterprice_session_info(self):
        """Configuration the web client needs before its first render.

        The pinned menus travel here rather than in the core ``user_settings``
        key: Odoo 20 no longer ships that key to the browser (per-user settings
        moved into mail's ``storeData``, which only carries the fields mail
        declares). Keeping them under our own key avoids coupling to it.
        """
        company = self.env.company
        logo_url = False
        if company.ss_sidebar_logo:
            field = 'ss_sidebar_logo'
        elif company.logo:
            field = 'logo'
        else:
            field = False
        if field:
            logo_url = '/web/image/res.company/%s/%s?unique=%s' % (
                company.id, field, company._ss_asset_version(),
            )
        settings = self.env['res.users.settings']._find_or_create_for_user(self.env.user)
        return {
            'sidebar_enabled': company.ss_sidebar_enabled,
            'sidebar_default_open': company.ss_sidebar_default_open,
            'sidebar_logo_url': logo_url,
            'company_name': company.name,
            'settings_id': settings.id,
            'pinned_menus': settings.ss_pinned_menus or [],
        }
