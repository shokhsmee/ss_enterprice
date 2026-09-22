{
    'name': "SS Enterprise — Backend Sidebar, Chatter Toggle & Login Designer",
    'summary': "Left sidebar with pinned menus and your logo, a chatter toggle "
               "on form views, and a login page you can brand",
    'description': """
SS Enterprise
=============

A light UI layer for the Odoo 20 backend. It does not replace Odoo's own
design: the navbar, the views and the login card keep their standard markup
and styling. Everything here is added next to them, and every part can be
switched off.
    """,
    'version': '20.0.1.1.0',
    'category': 'Themes/Backend',
    'license': 'LGPL-3',

    'author': "shokhsmee",
    'maintainer': "shokhsmee",
    'website': "https://github.com/shokhsmee/ss_enterprice",
    'support': "shohjahonobruyev3@gmail.com",

    'depends': ['web', 'mail'],
    'data': [
        'views/res_config_settings_views.xml',
        'views/login_templates.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'ss_enterprice/static/src/scss/variables.scss',
            'ss_enterprice/static/src/sidebar/sidebar.scss',
            'ss_enterprice/static/src/sidebar/sidebar.js',
            'ss_enterprice/static/src/sidebar/sidebar.xml',
            'ss_enterprice/static/src/chatter/chatter_service.js',
            'ss_enterprice/static/src/chatter/chatter_toggle.js',
            'ss_enterprice/static/src/chatter/chatter_toggle.xml',
            'ss_enterprice/static/src/chatter/form_compiler_patch.js',
            'ss_enterprice/static/src/chatter/form_renderer_patch.js',
            'ss_enterprice/static/src/chatter/form_controller_patch.js',
            'ss_enterprice/static/src/chatter/form_controller_patch.xml',
            'ss_enterprice/static/src/webclient/webclient_patch.js',
            'ss_enterprice/static/src/webclient/webclient_patch.xml',
        ],
        'web.assets_frontend': [
            'ss_enterprice/static/src/login/login.scss',
        ],
    },

    'images': ['static/description/banner.png'],
    'installable': True,
    'application': True,
    'auto_install': False,
}
