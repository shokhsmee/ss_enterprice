# SS Enterprise (`ss_enterprice`)

Odoo **20.0**. Three additions on top of the standard backend and login page.
Odoo's own design is not replaced anywhere: the navbar, the form views and the
login card keep their stock markup and styling, they are only shifted or
extended.

## What it adds

| Feature | Where |
|---|---|
| Collapsible **and resizable** left sidebar (current app's menu tree + the other apps) | every backend screen, `≥ lg` viewports |
| **Pinned menus** — a per-user Favourites section at the top | any menu entry's pin button |
| **Hover flyout** — an app's menu tree opens beside the collapsed rail | collapsed sidebar |
| Logo at the top of the sidebar | falls back to the company logo |
| Chatter toggle | control panel of any form view that declares a `<chatter/>` |
| Login background picture | `/web/login` and the other login-layout pages |
| Login tagline (in the card) and note (under it) | idem |
| Hide the "Manage Databases" link | idem |
| Login form position: left / center / right | idem |

Everything is configured per company in
**Settings → SS Enterprise**.

## How it works

* **Sidebar** — `SsSidebar` (OWL) is inserted into `web.WebClient` through a
  template extension, and exposed on `WebClient.prototype` rather than on
  `static components`, so the Enterprise web client (which copies
  `WebClient.components` at class-definition time) picks it up as well.
  The panel is `position: fixed`; the body gets `padding-left`, so no part of
  the existing layout is restructured.
  The collapsed/expanded choice **and the width** are per user, in
  `localStorage`. Dragging the right edge writes the width straight to the
  `--ss-sidebar-width` custom property (no re-render per pointermove) and only
  commits it to the component state on release; double-clicking the handle
  resets it to 240px. Width is clamped to 180-480px and never more than half
  the window.

  Menu groups start **closed** and open on click.

  **Pins** are stored per user in `res.users.settings.ss_pinned_menus`, a JSON
  list of `ir.ui.menu` ids in pin order. They are shipped to the browser under
  our own `session.ss_enterprice` key, *not* the core `user_settings` one:
  Odoo 20 no longer sends that key to the web client (per-user settings moved
  into mail's `storeData`, which only carries the fields mail declares).
  Writes go through the stock `set_res_users_settings`, which every internal
  user may call on their own record. Ids of menus a user cannot see simply do
  not resolve client-side, so nothing leaks.

  The **flyout** is portalled to `body` (the panel clips its own overflow) and
  positioned against the hovered row. It closes on a short delay so the pointer
  can cross the gap between the rail and the panel.

  A logo is fitted into a fixed box, so a banner-shaped logo uses the full
  width and a square mark the full height. In the 56px collapsed rail a banner
  (ratio > 1.6) would be unreadable, so the company initials are shown instead;
  the `<img>` stays mounted behind `d-none` so its ratio is known as soon as it
  has loaded once.

* **Chatter toggle** — the flag lives in the `ss_chatter` service as an OWL
  signal. `FormCompiler.compile` is patched to append
  `and !__comp__.ssChatterHidden()` to the `t-if` of every
  `.o-mail-Form-chatter` container. Forcing `mailLayout()` to `"NONE"` would
  have been shorter but would also take the attachment preview down with it,
  because `.o_attachment_preview` is rendered on `mailLayout() == "COMBO"`.
  The state is per user, in `localStorage`.

* **Login page** — `web.login_layout` is inherited to drop two fixed layers
  behind the existing container (picture + dark veil) and to swap the classes
  of that container. The card itself is untouched; only its horizontal margins
  are overridden (with `!important`, because the card carries Bootstrap's
  `mx-auto`) and `width: 100%` is restored: making the container a flex box
  turns an auto margin into "size to content", which would otherwise shrink
  the card below the 300px it has in stock Odoo.
  The tagline and the note are rendered with `t-out`, so they are escaped: the
  page is served before anyone has authenticated and must not take HTML.
  "Manage Databases" is hidden by feeding the `disable_database_manager` flag
  the stock template already tests — nothing is removed from the arch.
  The picture is served by `/ss_enterprice/login_background`, a public
  read-only route, because `res.company` is not readable by the public user
  and the page is rendered before anyone is logged in.

## Configuration fields

On `res.company` (and mirrored on `res.config.settings`):

* `ss_sidebar_enabled`, `ss_sidebar_default_open`, `ss_sidebar_logo`
* `ss_login_background`, `ss_login_position`, `ss_login_overlay` (0-100)
* `ss_login_tagline`, `ss_login_note`, `ss_login_hide_db_manager`

On `res.users.settings`:

* `ss_pinned_menus` — JSON list of pinned `ir.ui.menu` ids, per user

## Not done on purpose

"Powered by Odoo" is left in place. Removing it is a trademark question with
Odoo Enterprise, not a technical one.
