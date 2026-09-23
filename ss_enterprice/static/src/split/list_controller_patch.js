import { onWillUnmount, proxy } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { CallbackRecorder, useCallbackRecorder } from "@web/search/action_hook";
import { ListController } from "@web/views/list/list_controller";
import { SsSplitForm } from "./split_form";
import { SsSplitToggle } from "./split_toggle";

patch(ListController.prototype, {
    setup() {
        super.setup();
        this.ssSplit = useService("ss_split");
        this.ssSplitNotification = useService("notification");
        this.ssSplitForm = SsSplitForm;
        this.ssSplitToggle = SsSplitToggle;
        this.ssSplitCloseWarning = null;
        // Which record the form pane shows is kept here rather than in the
        // service, so that it resets by itself when the action is left.
        this.ssSplitState = proxy({ resId: false, dragging: false });
        this.ssSplitBeforeLeave = new CallbackRecorder();

        // Leaving the action has to flush the form pane too: the action only
        // collects the callbacks registered by the list itself.
        if (this.env.__beforeLeave__) {
            useCallbackRecorder(this.env.__beforeLeave__, (options) => this.ssSplitLeave(options));
        }
        onWillUnmount(() => this.ssSplitClearWarning());
    },

    /**
     * The split view needs a form view to show, room to show it in, and a list
     * whose rows are not already bound to an action of their own.
     */
    get ssSplitAvailable() {
        if (this.env.inDialog || this.uiService.isSmall) {
            return false;
        }
        if (this.props.display?.mode && this.props.display.mode !== "current") {
            return false;
        }
        if (this.archInfo.openAction) {
            return false;
        }
        return (this.env.config.views || []).some(([, type]) => type === "form");
    },

    get ssSplitActive() {
        return this.ssSplitAvailable && this.ssSplit.enabled();
    },

    get ssSplitWrapperClass() {
        const classes = ["o_ss_split", `o_ss_split_${this.ssSplit.orientation()}`];
        if (this.ssSplitState.dragging) {
            classes.push("o_ss_split_dragging");
        }
        return classes.join(" ");
    },

    get ssSplitPaneStyle() {
        const size = this.ssSplit.size();
        return this.ssSplit.orientation() === "vertical"
            ? `width: ${size}%;`
            : `height: ${size}%;`;
    },

    /**
     * `View` only rebuilds the props it hands to its controller when the arch,
     * the type or the model change, so a new `resId` alone would leave the pane
     * on the record it first loaded. Keying it on the record mounts a fresh
     * view instead; `get_views` is cached, so this costs one `web_read`.
     */
    get ssSplitFormKey() {
        return `${this.props.resModel}_${this.ssSplitState.resId}`;
    },

    get ssSplitToggleProps() {
        return { onBeforeToggle: () => this.ssSplitBeforeToggle() };
    },

    get ssSplitFormProps() {
        return {
            resModel: this.props.resModel,
            resId: this.ssSplitState.resId,
            context: this.props.context,
            beforeLeave: this.ssSplitBeforeLeave,
            onSave: () => this.ssSplitOnRecordSaved(),
        };
    },

    /**
     * Runs the `beforeLeave` the form pane registered, which saves it when it
     * is dirty. Returns false when the save failed and the record must stay.
     *
     * `forceLeave` has to be passed on: `clearUncommittedChanges` refuses the
     * navigation as soon as one callback returns false, so swallowing it here
     * would make even the forced paths — the error dialog's own "discard and
     * leave" among them — unable to get past the pane.
     */
    async ssSplitFlush(options = {}) {
        for (const callback of this.ssSplitBeforeLeave.callbacks) {
            if ((await callback(options)) === false) {
                return false;
            }
        }
        return true;
    },

    /**
     * The pane can hold a record that refuses to save while the user is looking
     * at the list, so a silent refusal reads as a frozen menu. Say what is in
     * the way and offer the way out.
     */
    async ssSplitLeave(options = {}) {
        const flushed = await this.ssSplitFlush(options);
        if (flushed) {
            this.ssSplitClearWarning();
        } else {
            this.ssSplitWarnBlocked();
        }
        return flushed;
    },

    ssSplitClearWarning() {
        this.ssSplitCloseWarning?.();
        this.ssSplitCloseWarning = null;
    },

    ssSplitWarnBlocked() {
        this.ssSplitClearWarning();
        this.ssSplitCloseWarning = this.ssSplitNotification.add(
            // One literal: the extractor cannot read a string built with `+`,
            // and the message would silently never be translated.
            _t("The record open next to the list has changes that cannot be saved, so you are being kept here. Fix them, or discard them to move on."),
            {
                type: "warning",
                sticky: true,
                buttons: [
                    {
                        name: _t("Discard changes"),
                        primary: true,
                        onClick: () => this.ssSplitForceCloseRecord(),
                    },
                ],
            }
        );
    },

    /** Close button: save what is in the pane, then empty it. */
    async ssSplitCloseRecord() {
        if (await this.ssSplitFlush()) {
            this.ssSplitClearWarning();
            this.ssSplitState.resId = false;
        } else {
            this.ssSplitWarnBlocked();
        }
    },

    /** Way out of a record that will not save: drop it, changes and all. */
    ssSplitForceCloseRecord() {
        this.ssSplitClearWarning();
        this.ssSplitState.resId = false;
    },

    /**
     * Turning the split off unmounts the pane, which would throw away whatever
     * is unsaved in it without a word.
     */
    async ssSplitBeforeToggle() {
        if (!this.ssSplitActive || !this.ssSplitState.resId) {
            return true;
        }
        if (!(await this.ssSplitFlush())) {
            this.ssSplitWarnBlocked();
            return false;
        }
        this.ssSplitState.resId = false;
        return true;
    },

    async ssSplitOnRecordSaved() {
        await this.model.root.load();
    },

    /** Opening a record fills the form pane instead of replacing the list. */
    async openRecord(record, options = {}) {
        if (!this.ssSplitActive || options.newWindow) {
            return super.openRecord(record, options);
        }
        if (await record.isDirty()) {
            await record.save();
        }
        if (!(await this.ssSplitFlush())) {
            return;
        }
        this.ssSplitState.resId = record.resId;
    },

    ssOnGutterPointerDown(ev) {
        if (ev.button !== 0) {
            return;
        }
        const wrapperEl = ev.currentTarget.parentElement;
        const paneEl = wrapperEl?.querySelector(".o_ss_split_pane");
        if (!paneEl) {
            return;
        }
        ev.preventDefault();

        const vertical = this.ssSplit.orientation() === "vertical";
        const wrapperRect = wrapperEl.getBoundingClientRect();
        const paneRect = paneEl.getBoundingClientRect();
        const total = vertical ? wrapperRect.width : wrapperRect.height;
        if (!total) {
            return;
        }
        // In RTL the pane sits before the list, so dragging towards the start
        // has to grow it rather than shrink it.
        const paneIsLast = vertical
            ? paneRect.left > wrapperRect.left
            : paneRect.top > wrapperRect.top;
        const direction = paneIsLast ? -1 : 1;
        const startPos = vertical ? ev.clientX : ev.clientY;
        const startSize = this.ssSplit.size();

        this.ssSplitState.dragging = true;

        const onMove = (moveEv) => {
            const pos = vertical ? moveEv.clientX : moveEv.clientY;
            const delta = ((pos - startPos) / total) * 100 * direction;
            this.ssSplit.setSize(startSize + delta, { persist: false });
        };
        const onUp = () => {
            this.ssSplitState.dragging = false;
            this.ssSplit.setSize(this.ssSplit.size());
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    },

    ssOnGutterDoubleClick() {
        this.ssSplit.resetSize();
    },
});
