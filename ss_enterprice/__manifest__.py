{
    'name': "SS Enterprise — Backend Sidebar, Chatter Toggle & Login Designer",
    'summary': "Open a record beside the list instead of on top of it, resize "
               "the chatter, a left sidebar with pinned menus and your logo, "
               "and a login page you can brand",
    'description': """
SS Enterprise
=============

A light UI layer for the Odoo 20 backend. It does not replace Odoo's own
design: the navbar, the views and the login card keep their standard markup
and styling. Everything here is added next to them, and every part can be
switched off.

Split view
    Open a record in a second pane instead of replacing the list. Side by
    side or top and bottom, with a divider you can drag.

Resizable chatter
    Drag its edge to give the history the room it needs. In the split view it
    becomes a panel of its own, where only the messages scroll.

Left sidebar
    The menus of the app you are in and a way to reach the others, with your
    logo on top and the entries you pin.

Login page
    A background picture, your own wording and the card where you want it.
    """,
    'version': '20.0.2.0.0',
    'category': 'Themes/Backend',
    'license': 'LGPL-3',

    # Read by the Odoo Apps store when the module is uploaded; Odoo itself
    # ignores keys it does not know.
    'price': 47.00,
    'currency': 'USD',

    'author': "shokhsmee",
    'maintainer': "shokhsmee",
    'website': "https://github.com/shokhsmee/ss_enterprice",
    'support': "shohjahonobruyev3@gmail.com",

    'depends': ['web', 'mail'],
    'post_init_hook': 'post_init_hook',
    'data': [
        'views/res_config_settings_views.xml',
        'views/login_templates.xml',
    ],
    'assets': {
        'web.assets_backend': [
            # A template that copies web.ListView with t-inherit-mode="primary"
            # only picks up the extensions declared BEFORE it in the bundle, so
            # the split has to be prepended or Purchase, Expenses, Time Off and
            # every other list view with its own template would silently miss it.
            ('prepend', 'ss_enterprice/static/src/split/list_controller_patch.xml'),
            'ss_enterprice/static/src/scss/variables.scss',
            'ss_enterprice/static/src/sidebar/sidebar.scss',
            'ss_enterprice/static/src/sidebar/sidebar.js',
            'ss_enterprice/static/src/sidebar/sidebar.xml',
            'ss_enterprice/static/src/chatter/chatter.scss',
            'ss_enterprice/static/src/chatter/chatter_service.js',
            'ss_enterprice/static/src/chatter/chatter_toggle.js',
            'ss_enterprice/static/src/chatter/chatter_toggle.xml',
            'ss_enterprice/static/src/chatter/chatter_resizer.js',
            'ss_enterprice/static/src/chatter/chatter_resizer.xml',
            'ss_enterprice/static/src/chatter/form_compiler_patch.js',
            'ss_enterprice/static/src/chatter/form_renderer_patch.js',
            'ss_enterprice/static/src/chatter/form_controller_patch.js',
            'ss_enterprice/static/src/chatter/form_controller_patch.xml',
            'ss_enterprice/static/src/split/split.scss',
            'ss_enterprice/static/src/split/split_service.js',
            'ss_enterprice/static/src/split/split_form.js',
            'ss_enterprice/static/src/split/split_form.xml',
            'ss_enterprice/static/src/split/split_toggle.js',
            'ss_enterprice/static/src/split/split_toggle.xml',
            'ss_enterprice/static/src/split/list_controller_patch.js',
            'ss_enterprice/static/src/webclient/webclient_patch.js',
            'ss_enterprice/static/src/webclient/webclient_patch.xml',
        ],
        'web.assets_tests': [
            'ss_enterprice/static/tests/tours/split_view_tour.js',
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
