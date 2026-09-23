from . import controllers
from . import models


def post_init_hook(env):
    """Make the module visible in the Apps list.

    `update_list()` creates the `ir.module.module` row during boot step 2, when
    only `base` is loaded. `module_type` is added by `base_import_module`, which
    is not in the registry yet, so `create()` cannot apply its "official"
    default and the column stays NULL. The Apps action opens with
    `searchpanel_default_module_type=official`, so a NULL module is filtered out
    and looks like it was never installed.
    """
    module = env["ir.module.module"].search([("name", "=", "ss_enterprice")], limit=1)
    if "module_type" in module._fields and not module.module_type:
        module.module_type = "official"
