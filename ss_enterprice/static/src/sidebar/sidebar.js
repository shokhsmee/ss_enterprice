import { Component, onWillDestroy, proxy, signal, useEffect, usePlugin } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";
import { router, routerBus } from "@web/core/browser/router";
import { DebugModePlugin } from "@web/core/debug_mode_plugin";
import { useBus, useService } from "@web/core/utils/hooks";
import { session } from "@web/session";

const COLLAPSED_KEY = "ss_enterprice.sidebar_collapsed";
const WIDTH_KEY = "ss_enterprice.sidebar_width";

const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 180;
const MAX_WIDTH = 480;

// Above this width/height ratio a logo is a banner: it cannot be read in the
// collapsed rail, so the initials badge is shown instead.
const WIDE_LOGO_RATIO = 1.6;

// Grace period for the pointer to travel from a collapsed app icon into the
// flyout it opened, across the gap between them.
const FLYOUT_CLOSE_DELAY = 150;

/**
 * Collapsible, resizable left sidebar: logo on top, the menus of the current
 * app, then the other apps. It is rendered next to the standard navbar, which
 * is left untouched.
 */
export class SsSidebar extends Component {
    static template = "ss_enterprice.Sidebar";
    static props = {};

    debugMode = usePlugin(DebugModePlugin);
    logoRef = signal.ref();

    setup() {
        this.menuService = useService("menu");
        this.orm = useService("orm");
        this.config = session.ss_enterprice || {};

        this.state = proxy({
            collapsed: this.getStoredCollapsed(),
            width: this.getStoredWidth(),
            // A group is closed until the user opens it: only `true` opens one.
            openGroups: {},
            activePath: this.getCurrentActionPath(),
            logoRatio: 0,
            // Ordered ir.ui.menu ids, mirrored server-side in res.users.settings.
            pinnedIds: [...(this.config.pinned_menus || [])],
            // { app, top } while an app icon of the collapsed rail is hovered.
            flyout: null,
        });

        this.flyoutTimer = null;
        onWillDestroy(() => browser.clearTimeout(this.flyoutTimer));

        useBus(routerBus, "ROUTE_CHANGE", () => {
            this.state.activePath = this.getCurrentActionPath();
        });

        // Let the rest of the web client know how much room to leave on the
        // left. Reading the state here subscribes the effect.
        useEffect(() => {
            const { classList } = document.body;
            classList.add("o_ss_has_sidebar");
            classList.toggle("o_ss_sidebar_is_collapsed", this.state.collapsed);
            return () => {
                classList.remove("o_ss_has_sidebar", "o_ss_sidebar_is_collapsed");
            };
        });

        // No cleanup: the variable is simply overwritten on each change, so a
        // re-run never drops the width for a frame. It is cleared on destroy.
        useEffect(() => this.applyWidth(this.state.width));
        onWillDestroy(() => {
            document.documentElement.style.removeProperty("--ss-sidebar-width");
        });

        // A cached image can be complete before its `load` event is observed.
        useEffect(() => {
            const img = this.logoRef();
            if (img?.complete && img.naturalHeight) {
                this.state.logoRatio = img.naturalWidth / img.naturalHeight;
            }
        });
    }

    // ------------------------------------------------------------------
    // Collapsed state
    // ------------------------------------------------------------------

    getStoredCollapsed() {
        const stored = this.readStorage(COLLAPSED_KEY);
        if (stored !== null) {
            return stored === "1";
        }
        return this.config.sidebar_default_open === false;
    }

    /** Labels built here rather than in the template: a term inside a QWeb
     *  expression is invisible to the translation extractor. */
    get collapseLabel() {
        return this.state.collapsed ? _t("Expand sidebar") : _t("Collapse sidebar");
    }

    toggleCollapsed() {
        this.state.collapsed = !this.state.collapsed;
        this.writeStorage(COLLAPSED_KEY, this.state.collapsed ? "1" : "0");
    }

    // ------------------------------------------------------------------
    // Width
    // ------------------------------------------------------------------

    getStoredWidth() {
        const stored = Number(this.readStorage(WIDTH_KEY));
        return stored ? this.clampWidth(stored) : DEFAULT_WIDTH;
    }

    clampWidth(width) {
        // Never let the panel eat more than half of a narrow window.
        const max = Math.min(MAX_WIDTH, Math.round(browser.innerWidth / 2));
        return Math.round(Math.min(Math.max(width, MIN_WIDTH), Math.max(max, MIN_WIDTH)));
    }

    applyWidth(width) {
        document.documentElement.style.setProperty("--ss-sidebar-width", `${width}px`);
    }

    /**
     * Drag the right edge. The width is written straight to the CSS variable
     * while dragging -- re-rendering on every pointermove would be wasteful --
     * and only committed to the state (and to the storage) on release.
     */
    onResizeStart(ev) {
        if (this.state.collapsed || ev.button !== 0) {
            return;
        }
        ev.preventDefault();
        const startX = ev.clientX;
        const startWidth = this.state.width;
        let width = startWidth;

        const onMove = (moveEv) => {
            width = this.clampWidth(startWidth + moveEv.clientX - startX);
            this.applyWidth(width);
        };
        const onUp = () => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            document.body.classList.remove("o_ss_sidebar_resizing");
            this.state.width = width;
            this.writeStorage(WIDTH_KEY, String(width));
        };

        document.body.classList.add("o_ss_sidebar_resizing");
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
    }

    /** Double-clicking the handle restores the default width. */
    onResizeReset() {
        this.state.width = DEFAULT_WIDTH;
        this.writeStorage(WIDTH_KEY, String(DEFAULT_WIDTH));
    }

    // ------------------------------------------------------------------
    // Branding
    // ------------------------------------------------------------------

    get logoUrl() {
        return this.config.sidebar_logo_url || false;
    }

    get companyName() {
        return this.config.company_name || "";
    }

    get companyInitials() {
        return this.companyName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0].toUpperCase())
            .join("");
    }

    /** A banner-shaped logo is illegible in the collapsed rail. */
    get isWideLogo() {
        return this.state.logoRatio > WIDE_LOGO_RATIO;
    }

    get showInitials() {
        return !this.logoUrl || (this.state.collapsed && this.isWideLogo);
    }

    onLogoLoad(ev) {
        const img = ev.target;
        if (img.naturalHeight) {
            this.state.logoRatio = img.naturalWidth / img.naturalHeight;
        }
    }

    // ------------------------------------------------------------------
    // Pinned menus
    // ------------------------------------------------------------------

    /** Pinned ids resolved against the menus this user may actually see. */
    get pinnedMenus() {
        return this.state.pinnedIds
            .map((id) => this.menuService.getMenu(id))
            .filter((menu) => menu && menu.actionID);
    }

    isPinned(menuId) {
        return this.state.pinnedIds.includes(menuId);
    }

    pinLabel(menuId) {
        return this.isPinned(menuId) ? _t("Unpin") : _t("Pin to the top");
    }

    togglePin(menuId) {
        const pinned = [...this.state.pinnedIds];
        const index = pinned.indexOf(menuId);
        if (index === -1) {
            pinned.push(menuId);
        } else {
            pinned.splice(index, 1);
        }
        // Optimistic: the sidebar reacts at once, the write follows.
        this.state.pinnedIds = pinned;
        this.savePins(pinned);
    }

    async savePins(pinned) {
        const settingsId = this.config.settings_id;
        if (!settingsId) {
            return;
        }
        try {
            await this.orm.call("res.users.settings", "set_res_users_settings", [
                [settingsId],
                { ss_pinned_menus: pinned },
            ]);
        } catch (error) {
            // A failed write must not break the sidebar, but it must not pass
            // unnoticed either: the pin is back to the stored value on reload.
            console.warn("ss_enterprice: could not save the pinned menus", error);
        }
    }

    // ------------------------------------------------------------------
    // Flyout (collapsed rail)
    // ------------------------------------------------------------------

    onAppEnter(app, ev) {
        if (!this.state.collapsed) {
            return;
        }
        browser.clearTimeout(this.flyoutTimer);
        const { top } = ev.currentTarget.getBoundingClientRect();
        // Leave room below so a long menu is not pinned to the bottom edge.
        const maxTop = Math.max(8, browser.innerHeight - 160);
        this.state.flyout = { app, top: Math.round(Math.min(top, maxTop)) };
    }

    scheduleFlyoutClose() {
        browser.clearTimeout(this.flyoutTimer);
        this.flyoutTimer = browser.setTimeout(() => {
            this.state.flyout = null;
        }, FLYOUT_CLOSE_DELAY);
    }

    keepFlyoutOpen() {
        browser.clearTimeout(this.flyoutTimer);
    }

    closeFlyout() {
        browser.clearTimeout(this.flyoutTimer);
        this.state.flyout = null;
    }

    get flyoutSections() {
        const app = this.state.flyout?.app;
        return (app && this.menuService.getMenuAsTree(app.id).childrenTree) || [];
    }

    // ------------------------------------------------------------------
    // Menus
    // ------------------------------------------------------------------

    get currentApp() {
        return this.menuService.getCurrentApp() || null;
    }

    get currentAppSections() {
        const app = this.currentApp;
        return (app && this.menuService.getMenuAsTree(app.id).childrenTree) || [];
    }

    get apps() {
        return this.menuService.getApps();
    }

    get otherApps() {
        const currentId = this.currentApp?.id;
        return this.apps.filter((app) => app.id !== currentId);
    }

    /** Splits the `webIcon` string of an app into something usable in QWeb. */
    appIcon(app) {
        if (app.webIconData) {
            return { type: "image", src: app.webIconData };
        }
        if (app.webIcon) {
            const [iconClass, color] = app.webIcon.split(",");
            return { type: "font", icon: iconClass, color: color || "" };
        }
        return { type: "none" };
    }

    getMenuItemHref(menu) {
        const url = `/odoo/${menu.actionPath || "action-" + menu.actionID}`;
        const mode = this.debugMode.toString();
        return mode ? `${url}?debug=${mode}` : url;
    }

    getCurrentActionPath() {
        const stack = router.current.actionStack;
        const action = stack?.[stack.length - 1]?.action ?? router.current.action;
        return action === undefined || action === null ? "" : String(action);
    }

    isActiveMenu(menu) {
        if (!this.state.activePath) {
            return false;
        }
        const path = menu.actionPath || (menu.actionID ? `action-${menu.actionID}` : null);
        return Boolean(path) && this.state.activePath === path;
    }

    isGroupOpen(menuId) {
        return this.state.openGroups[menuId] === true;
    }

    toggleGroup(menuId) {
        this.state.openGroups[menuId] = !this.isGroupOpen(menuId);
    }

    onMenuClick(menu) {
        this.closeFlyout();
        this.menuService.selectMenu(menu);
    }

    // ------------------------------------------------------------------
    // Storage (private mode / blocked storage must not break the sidebar)
    // ------------------------------------------------------------------

    readStorage(key) {
        try {
            return browser.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    writeStorage(key, value) {
        try {
            browser.localStorage.setItem(key, value);
        } catch {
            // the choice just won't survive a reload
        }
    }
}
