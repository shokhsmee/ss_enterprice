from odoo import api, http
from odoo.http import request


class SsEnterpriceController(http.Controller):

    @http.route(
        '/ss_enterprice/login_background',
        type='http', auth='none', readonly=True, sitemap=False,
    )
    def ss_login_background(self, company=None, **kwargs):
        """Serve the login background picture to anonymous visitors.

        The login page is rendered before any user is known, so the picture
        cannot go through ``/web/image`` (``res.company`` is not readable by
        the public user). The company is passed explicitly by the template.
        """
        env = request.env(user=request.session.uid or api.SUPERUSER_ID, su=True)
        companies = env['res.company']
        if company:
            try:
                companies = companies.browse(int(company)).exists()
            except (TypeError, ValueError):
                companies = env['res.company']
        if not companies:
            companies = env.company
        if not companies or not companies.ss_login_background:
            return request.not_found()
        stream = env['ir.binary']._get_stream_from(companies, 'ss_login_background')
        stream.public = True
        return stream.get_response()
