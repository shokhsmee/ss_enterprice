# SS Enterprise

A light UI layer for the **Odoo 20** backend and login page.

It does not replace Odoo's design. The navbar, the views and the login card
keep their standard markup and styling — everything here is added next to
them, and every part can be switched off.

---

## Features

### Split view

A button in the control panel of any list view. Turn it on and clicking a row
fills a second pane instead of replacing the whole view, so the rows stay
where they are.

* **Side by side or top and bottom**, with a button to flip between them.
* **Drag the divider** to share the space; double-click it to go back to the
  middle.
* Unsaved edits in the pane are saved before another row opens. When they
  cannot be saved you are told why, and offered a way to discard them.
* A close button empties the pane without leaving the list.
* On, off, orientation and size are remembered per user.
* Works on list views that ship their own template too, such as Purchase and
  Reordering Rules.

### Resizable chatter

* **Drag its edge** to resize: the width when it sits beside the form, the
  height when it sits under it in the split pane.
* Double-click the edge to hand the sizing back to Odoo.
* In the split pane the chatter is a panel of its own: only the messages
  scroll, the composer and the form stay where they are.
* The size is remembered per user.

### Left sidebar

A collapsible panel next to the standard navbar, showing the menus of the app
you are in and the list of the other apps.

* **Your logo on top.** Falls back to the company logo when none is set.
* **Pinned menus.** Pin any menu entry and it gets its own section at the top.
  Pins are per user and follow them to any browser.
* **Resizable.** Drag the right edge (180–480 px); double-click it to reset.
* **Collapses to an icon rail.** Hovering an icon opens that app's menus in a
  flyout, so you can navigate without expanding the panel again.
* Menu groups start closed and open on click.
* Hidden below 1024 px, where Odoo's own burger menu takes over, and on print.

### Chatter toggle

A button in the control panel of every form view that has a chatter. It hides
the chatter and lets the sheet use the full width — useful on wide records
such as sales orders or invoices.

* The choice is remembered per user.
* An attachment preview keeps working while the chatter is hidden.

### Login page

* A full-screen **background picture**, with an adjustable dark overlay so the
  form stays readable on any image.
* The login card can sit on the **left, in the centre or on the right**.
* A **tagline** inside the card and a **note** underneath it, for a welcome
  line or a support address.
* An option to hide the **"Manage Databases"** link.

---

## Installation

1. Copy `ss_enterprice` into your addons path.
2. Update the apps list.
3. Install **SS Enterprise**.

No configuration is required: the sidebar is on and everything else is off
until you set it.

## Configuration

Everything lives in **Settings → SS Enterprise**, per company.

| Setting | Default |
|---|---|
| Left Sidebar | on |
| Sidebar Expanded by Default | on |
| Sidebar Logo | company logo |
| Login Background Picture | none |
| Login Overlay | 35 % |
| Login Form Position | centre |
| Login Tagline / Note | empty |
| Hide Database Manager Link | off |

The chatter toggle, the sidebar width and the pinned menus are per user, not
per company — each person keeps their own.

---

## Compatibility

* **Odoo 20.0**, Community and Enterprise.
* Depends on `web` and `mail` only.
* Works with the light and dark colour schemes: the panel is built from Odoo's
  own theme variables, so it follows whichever is active.

## Languages

English, Russian (`ru`), Uzbek (`uz`).

## License

LGPL-3. See [LICENSE](LICENSE).

## Support

shohjahonobruyev3@gmail.com

---

Developers: see [DEVELOPMENT.md](DEVELOPMENT.md) for how each piece hooks into
Odoo and why.
