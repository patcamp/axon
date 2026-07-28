// Centralized Tailwind class constants. Components reference these
// instead of writing className strings inline, so the visual language
// lives in one place.
//
// Colors reference the `ink`/`content`/`accent` tokens from
// tailwind.config.ts, which are themselves CSS custom properties (see
// app/globals.css + components/ui/theme.tsx) so the whole app can
// flip dark/light and swap the user's accent color at runtime.

export const styles = {
  button: {
    base: "inline-flex items-center justify-center gap-2 rounded-[8px] text-[13.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
    variant: {
      primary: "bg-accent text-white hover:bg-[color-mix(in_srgb,var(--accent)_85%,white)]",
      outline: "border border-ink-border text-content-secondary hover:border-accent hover:text-accent",
      ghost: "text-content-muted hover:text-content-secondary",
    },
    size: {
      none: "",
      sm: "px-3 py-[9px]",
      md: "px-4 py-2.5",
      lg: "px-4 py-3",
    },
    fullWidth: "w-full",
  },

  textField: {
    base: "w-full rounded-[8px] border border-ink-border bg-ink-surface px-[11px] py-[9px] text-sm text-content placeholder:text-content-muted focus:border-accent focus:outline-none",
  },

  sidebar: {
    // Mobile: a fixed off-canvas drawer that slides in/out via transform.
    // sm and up: reverts to a normal static column, always visible, 264px.
    container: (isOpen: boolean) =>
      "fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-ink-border bg-ink-sidebar px-[14px] pt-[max(18px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] transition-transform duration-200 ease-in-out sm:static sm:z-auto sm:translate-x-0 sm:transition-none " +
      (isOpen ? "translate-x-0" : "-translate-x-full"),
    backdrop: "fixed inset-0 z-30 bg-black/50 sm:hidden",
    header: "flex items-center justify-between gap-2 p-[4px_6px_20px_6px]",
    headerLeft: "flex items-center gap-[9px]",
    headerDot:
      "h-[9px] w-[9px] rounded-full bg-accent shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_70%,transparent)]",
    headerTitle: "text-[15px] font-semibold tracking-[0.01em] text-content",
    mobileCloseButton: "text-content-muted hover:text-content-secondary sm:hidden",
    newButtonWrap: "mb-[22px]",
    nav: "mb-4 space-y-1",
    navItem: (active: boolean) =>
      "flex w-full items-center gap-2 rounded-[7px] px-[10px] py-2 text-[13px] text-content-secondary " +
      (active
        ? "bg-[color-mix(in_srgb,var(--accent)_22%,var(--bg-sidebar))]"
        : "hover:bg-ink-surface"),
    listSection: "flex-1 overflow-y-auto",
    sectionLabel: "px-[10px] pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-muted",
    emptyText: "px-[10px] text-xs text-content-muted",
    rowList: "space-y-0.5",
    row: (active: boolean) =>
      "group flex cursor-pointer items-center justify-between rounded-[7px] px-[10px] py-[9px] text-[13px] text-content-secondary " +
      (active
        ? "bg-[color-mix(in_srgb,var(--accent)_22%,var(--bg-sidebar))]"
        : "hover:bg-ink-surface"),
    rowLabel: "truncate",
    rowLabelWithIcon: "flex items-center gap-2 truncate",
    rowDelete: "ml-2 hidden text-content-muted hover:text-red-400 group-hover:inline",
    backButton: "mb-2 flex items-center gap-1 px-[10px] text-xs text-content-secondary hover:text-content",
    footerWrap: "relative mt-3 border-t border-ink-border pt-3",
    footerRow: "flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-left hover:bg-ink-surface",
    avatar:
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white",
    email: "truncate text-[12.5px] text-content-secondary",
  },

  chat: {
    // `axon-lattice` (globals.css) draws the blurred diagonal background.
    main: "safe-top axon-lattice relative flex h-full min-w-0 flex-1 flex-col",
    header: "flex h-14 min-h-14 items-center gap-3 border-b border-ink-border px-6",
    menuButton: "text-content-muted hover:text-content-secondary sm:hidden",
    headerTitle: "max-w-[70%] truncate text-sm font-semibold text-content",
    projectBadge: "rounded-full border border-ink-border px-2 py-0.5 text-[11px] text-content-muted",
    statusWrap: "ml-auto flex shrink-0 items-center gap-1.5 text-[11.5px] font-medium text-[oklch(0.55_0.13_145)]",
    statusDot: "h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.15_145)]",

    scrollArea: "chat-scroll flex-1 overflow-y-auto",
    messagesInner: "mx-auto flex w-full max-w-[720px] flex-col gap-[18px] px-6 pb-3 pt-7",
    emptyState: "mt-24 text-center text-sm text-content-muted",

    rowUser: "flex justify-end",
    rowAssistant: "flex justify-start",
    bubbleUser:
      "max-w-[78%] whitespace-pre-wrap rounded-[14px] bg-[color-mix(in_srgb,var(--accent)_55%,black)] px-[15px] py-[11px] text-[14.5px] leading-[1.55] text-white",
    bubbleAssistant:
      "max-w-[78%] whitespace-pre-wrap rounded-[14px] bg-ink-surface px-[15px] py-[11px] text-[14.5px] leading-[1.55] text-content",
    cursor: "inline-block h-4 w-2 animate-pulse bg-accent",
    thinkingBubble: "flex items-center gap-[5px] rounded-[14px] bg-ink-surface px-[15px] py-[11px]",

    // Empty state: centered heading + composer, no message history.
    emptyWrap: "flex flex-1 flex-col items-center justify-center gap-7 p-6",
    emptyHeading: "text-2xl font-semibold text-content",
    emptyComposerOuter: "w-full max-w-[640px]",
    emptyComposerInner:
      "flex items-end gap-[10px] rounded-[14px] border border-ink-border bg-ink-surface p-[12px_14px]",

    // Conversation composer: pinned to the bottom, centered, 720px cap.
    composerWrap: "flex justify-center px-6 pb-[max(22px,env(safe-area-inset-bottom))] pt-[14px]",
    composerInner:
      "flex w-full max-w-[720px] items-end gap-[10px] rounded-[14px] border border-ink-border bg-ink-surface p-[11px_14px]",

    textarea:
      "max-h-[160px] flex-1 resize-none border-none bg-transparent font-sans text-[14.5px] leading-[1.5] text-content outline-none placeholder:text-content-muted",
    sendBtn: (active: boolean) =>
      "cursor-pointer whitespace-nowrap rounded-[9px] px-4 py-2 text-[13.5px] font-semibold text-white transition-colors " +
      (active ? "bg-accent hover:bg-[color-mix(in_srgb,var(--accent)_85%,white)]" : "bg-ink-border"),

    titleWrap: "relative min-w-0",
    titleButton: "flex max-w-[45vw] items-center gap-1.5 text-sm font-semibold text-content hover:text-content sm:max-w-xs",
    titleInput:
      "max-w-[45vw] rounded-md border border-ink-border bg-ink-surface px-2 py-1 text-sm text-content focus:border-accent focus:outline-none sm:max-w-xs",
  },

  // Project detail view (sidebar → click a project).
  projectDetail: {
    wrap: "flex flex-1 justify-center overflow-y-auto p-[40px_24px]",
    inner: "flex w-full max-w-[640px] flex-col gap-[18px]",
    backLink: "w-fit cursor-pointer text-[12.5px] text-content-secondary hover:text-content",
    title: "text-[26px] font-semibold text-content",
    description: "text-[14.5px] leading-[1.6] text-content-secondary",
    placeholderWrap:
      "mt-2 flex flex-col items-center gap-2.5 border-t border-ink-border pt-6 text-[13.5px] text-content-muted",
  },

  // Shared dropdown-menu look, used by the chat title menu and the
  // account popup — anchor a `relative` wrapper, then position one of
  // panelBelow/panelAbove off it.
  menu: {
    backdrop: "fixed inset-0 z-40",
    panel: "absolute z-50 rounded-[9px] border border-ink-border bg-ink-surface p-[5px] shadow-[0_10px_30px_oklch(0.05_0.01_264_/_0.4)]",
    panelBelow: "left-0 top-full mt-1",
    panelAbove: "left-0 bottom-full mb-1.5",
    header: "truncate px-3 py-2 text-xs text-content-muted",
    divider: "my-1 border-t border-ink-border",
    item: "flex w-full items-center gap-2 rounded-[6px] px-[10px] py-2 text-left text-[13px] text-content hover:bg-ink-sidebar disabled:cursor-not-allowed disabled:opacity-40",
    itemDanger:
      "flex w-full items-center gap-2 rounded-[6px] px-[10px] py-2 text-left text-[13px] text-red-400 hover:bg-ink-sidebar",
    submenu: "ml-2 mt-1 space-y-0.5 border-l border-ink-border pl-2",
  },

  dialog: {
    overlay: "fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.1_0.006_264_/_0.6)] px-5",
    panel: "flex w-[420px] max-w-[90vw] flex-col gap-4 rounded-[14px] border border-ink-border bg-ink-sidebar p-[22px] shadow-[0_20px_60px_oklch(0.05_0.01_264_/_0.5)]",
    title: "text-base font-semibold text-content",
    fieldGroup: "flex flex-col gap-1.5",
    label: "text-xs font-medium text-content-secondary",
    input: "rounded-[8px] border border-ink-border bg-ink-surface px-[11px] py-[9px] font-sans text-sm text-content outline-none focus:border-accent",
    textarea:
      "resize-none rounded-[8px] border border-ink-border bg-ink-surface px-[11px] py-[9px] font-sans text-sm text-content outline-none focus:border-accent",
    error: "text-sm text-red-400",
    actions: "mt-1 flex justify-end gap-2.5",
    cancelBtn: "cursor-pointer rounded-[8px] px-4 py-2 text-[13.5px] font-semibold text-content-secondary hover:bg-ink-surface",
    submitBtn: (active: boolean) =>
      "cursor-pointer rounded-[8px] px-4 py-2 text-[13.5px] font-semibold text-white disabled:cursor-not-allowed " +
      (active ? "bg-accent hover:bg-[color-mix(in_srgb,var(--accent)_85%,white)]" : "bg-ink-border"),
  },

  // Dedicated settings view (theme + accent swatches), reachable from the
  // profile popover.
  settings: {
    page: "mx-auto flex h-full max-w-xl flex-col gap-8 overflow-y-auto px-6 py-10",
    section: "flex flex-col gap-3",
    sectionLabel: "text-xs font-semibold uppercase tracking-[0.06em] text-content-muted",
    modeRow: "flex gap-2",
    modeButton: (active: boolean) =>
      "flex-1 cursor-pointer rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors " +
      (active
        ? "border-accent bg-[color-mix(in_srgb,var(--accent)_16%,var(--bg-surface))] text-content"
        : "border-ink-border text-content-secondary hover:bg-ink-surface"),
    swatchRow: "flex flex-wrap gap-3",
    swatch: (active: boolean) =>
      "h-9 w-9 cursor-pointer rounded-full ring-offset-2 ring-offset-ink-app transition " +
      (active ? "ring-2 ring-content" : "hover:opacity-80"),
  },

  code: {
    page: "mx-auto h-full max-w-2xl overflow-y-auto px-5 py-8 sm:py-12",
    backLink: "mb-6 inline-flex items-center gap-1 text-sm text-content-muted hover:text-content-secondary",
    heading: "mb-1 text-xl font-semibold text-content",
    subheading: "mb-8 text-sm text-content-muted",
    card: "mb-6 rounded-2xl border border-ink-border bg-ink-surface p-6",
    cardTitle: "mb-1 text-sm font-medium text-content-secondary",
    cardBody: "mb-4 text-sm text-content-muted",
    tokenBox:
      "mb-3 flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-ink-surface px-4 py-3 font-mono text-sm text-content",
    tokenValue: "truncate",
    tokenWarning: "text-xs text-accent",
    error: "mt-3 text-sm text-red-400",
    list: "space-y-2",
    listRow:
      "flex items-center justify-between gap-3 rounded-xl border border-ink-border px-4 py-3 text-sm",
    listMeta: "text-xs text-content-muted",
    emptyText: "text-sm text-content-muted",
    stepList: "mb-4 list-decimal space-y-2 pl-5 text-sm text-content-muted",
    originBox:
      "flex items-center justify-between gap-3 rounded-xl border border-ink-border bg-ink-surface px-4 py-3 font-mono text-sm text-content",
  },

  auth: {
    wrap: "flex h-dvh items-center justify-center px-5",
    panel: "w-full max-w-sm rounded-[14px] border border-ink-border bg-ink-surface p-6",
    headerRow: "mb-6 flex items-center gap-[9px]",
    heading: "mb-4 text-lg font-semibold text-content",
    fieldGroup: "space-y-3",
    error: "mt-3 text-sm text-red-400",
    info: "mt-3 text-sm text-accent",
    toggle: "mt-3 w-full text-center text-xs text-content-muted hover:text-content-secondary",
  },
};
