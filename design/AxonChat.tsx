"use client";

/**
 * AxonChat — faithful React recreation of the Axon design handoff.
 *
 * Ported from the `.dc.html` design-comp prototype into a single self-contained
 * component. All colors, spacing, radii, typography, and interactions match the
 * high-fidelity spec in README.md.
 *
 * Notes for wiring into a real app:
 *  - Assistant replies are simulated (~1.1s). Replace `onSend`'s setTimeout with
 *    a real model/backend call.
 *  - `userEmail` / `userInitials` are props — pass real auth data in.
 *  - Font is Inter. In Next.js prefer `next/font/google` over the @import below.
 */

import React, { useState, useCallback, useRef } from "react";

type Mode = "dark" | "light";
type Role = "user" | "assistant";
type Message = { role: Role; text: string };
type Chat = { id: string; title: string; messages: Message[] };
type Project = { id: string; title: string; description?: string };

export interface AxonChatProps {
  accentColor?: string; // one of the 10 curated swatches, default violet
  mode?: Mode;
  userEmail?: string;
  userInitials?: string;
}

// Curated accent swatches from the design spec (violet is default).
export const AXON_ACCENTS = [
  "#7C5CFF", "#3B82F6", "#10B981", "#F59E0B", "#EC4899",
  "#EF4444", "#06B6D4", "#6366F1", "#84CC16", "#14B8A6",
];

function getTheme(mode: Mode) {
  return mode === "light"
    ? {
        bgApp: "oklch(0.985 0.003 264)",
        bgSidebar: "oklch(0.96 0.004 264)",
        bgSurface: "oklch(0.93 0.005 264)",
        border: "oklch(0.85 0.006 264)",
        textPrimary: "oklch(0.2 0.006 264)",
        textSecondary: "oklch(0.42 0.01 264)",
        textMuted: "oklch(0.58 0.01 264)",
      }
    : {
        bgApp: "oklch(0.15 0.006 264)",
        bgSidebar: "oklch(0.125 0.006 264)",
        bgSurface: "oklch(0.19 0.008 264)",
        border: "oklch(0.32 0.01 264 / 0.5)",
        textPrimary: "oklch(0.96 0.003 264)",
        textSecondary: "oklch(0.75 0.006 264)",
        textMuted: "oklch(0.55 0.01 264)",
      };
}

const INITIAL_CHATS: Chat[] = [
  {
    id: "c1",
    title: "What is the traveling salesman problem",
    messages: [
      { role: "user", text: "What is the traveling salesman problem?" },
      {
        role: "assistant",
        text:
          "The traveling salesman problem (TSP) asks for the shortest possible route that visits a set of cities exactly once and returns to the start. It shows up in:\n\n- Logistics: delivery and vehicle routing\n- Operations Research: scheduling and route planning for complex systems\n- Computer Science: testing and benchmarking algorithms",
      },
      { role: "user", text: "How is this model llama-3.1-8b at coding" },
      {
        role: "assistant",
        text:
          "Llama-3.1-8b is a solid general-purpose model for coding tasks.\n\nStrengths: understands and generates code across most popular languages, completes snippets accurately, and can flag common bugs.\n\nWeaknesses: struggles with highly context-dependent or idiomatic code, and its suggestions are not always the most optimal solution for complex problems.",
      },
    ],
  },
  {
    id: "c2",
    title: "Is GeoGuessr only free for the...",
    messages: [
      { role: "user", text: "Is GeoGuessr only free for the first few rounds?" },
      {
        role: "assistant",
        text:
          "Yes — GeoGuessr offers a limited number of free rounds per day for guests and free accounts. A paid subscription (GeoGuessr Pro) removes that cap and unlocks additional maps and modes.",
      },
    ],
  },
];

const INITIAL_PROJECTS: Project[] = [
  { id: "p1", title: "Budget", description: "Track monthly spend, forecast cash flow, and plan upcoming purchases." },
  { id: "p2", title: "Stock Analysis", description: "Research and compare equities, earnings, and market trends." },
];

export default function AxonChat({
  accentColor = "#7C5CFF",
  mode = "dark",
  userEmail = "patrickcampfield@gmail.com",
  userInitials = "PC",
}: AxonChatProps) {
  const t = getTheme(mode);

  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [view, setView] = useState<"chats" | "projects">("chats");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeChatIdRef = useRef<string | null>(null);
  activeChatIdRef.current = activeChatId;

  const onNewChat = useCallback(() => {
    setActiveChatId(null);
    setActiveProjectId(null);
    setDraft("");
    setIsThinking(false);
    setView("chats");
  }, []);

  const onShowChats = useCallback(() => {
    setView("chats");
    setActiveProjectId(null);
  }, []);
  const onShowProjects = useCallback(() => setView("projects"), []);
  const onSelectProject = useCallback((id: string) => {
    setActiveProjectId(id);
    setActiveChatId(null);
  }, []);
  const onSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setActiveProjectId(null);
    setDraft("");
    setIsThinking(false);
  }, []);

  const onCreateProject = useCallback(() => {
    const name = newProjectName.trim();
    if (!name) return;
    setProjects((p) => [...p, { id: "p" + Date.now(), title: name, description: newProjectDesc.trim() || undefined }]);
    setShowNewProjectModal(false);
  }, [newProjectName, newProjectDesc]);

  const onSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    let currentId = activeChatIdRef.current;
    if (!currentId) {
      const id = "c" + Date.now();
      const title = text.length > 42 ? text.slice(0, 42) + "…" : text;
      currentId = id;
      setChats((cs) => [{ id, title, messages: [{ role: "user", text }] }, ...cs]);
      setActiveChatId(id);
    } else {
      const id = currentId;
      setChats((cs) => cs.map((c) => (c.id === id ? { ...c, messages: [...c.messages, { role: "user", text }] } : c)));
    }
    setDraft("");
    setIsThinking(true);
    const replyToId = currentId;
    // TODO: replace this simulated reply with a real model/backend call.
    setTimeout(() => {
      setChats((cs) =>
        cs.map((c) =>
          c.id === replyToId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { role: "assistant", text: "This is a prototype response — connect a model to generate real answers here." },
                ],
              }
            : c
        )
      );
      setIsThinking(false);
    }, 1100);
  }, [draft]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend]
  );

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const isChatsView = view === "chats";
  const isProjectsView = view === "projects";
  const isEmpty = !activeChat && !activeProject;
  const headerTitle = activeChat ? activeChat.title : activeProject ? activeProject.title : "New chat";
  const newPrimaryLabel = isProjectsView ? "New project" : "New chat";
  const onNewPrimary = isProjectsView ? () => setShowNewProjectModal(true) : onNewChat;

  const rootVars = {
    ["--bg-app" as any]: t.bgApp,
    ["--bg-sidebar" as any]: t.bgSidebar,
    ["--bg-surface" as any]: t.bgSurface,
    ["--border" as any]: t.border,
    ["--text-primary" as any]: t.textPrimary,
    ["--text-secondary" as any]: t.textSecondary,
    ["--text-muted" as any]: t.textMuted,
    ["--accent" as any]: accentColor,
  } as React.CSSProperties;

  return (
    <div
      className="axon-root"
      style={{
        ...rootVars,
        display: "flex",
        width: "100%",
        height: "100vh",
        background: "var(--bg-app)",
        color: "var(--text-primary)",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{AXON_CSS}</style>

      {/* ---------------- Sidebar ---------------- */}
      <div
        style={{
          width: 264,
          minWidth: 264,
          height: "100%",
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "18px 14px",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 6px 20px 6px" }}>
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px color-mix(in srgb, var(--accent) 70%, transparent)",
            }}
          />
          <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "0.01em" }}>Axon</div>
        </div>

        {/* Primary button */}
        <div
          className="axon-primary-btn"
          onClick={onNewPrimary}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 12px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "white",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 22,
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
          <span>{newPrimaryLabel}</span>
        </div>

        {/* Chats nav */}
        <div
          className="axon-nav"
          onClick={onShowChats}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 7,
            fontSize: 13,
            color: "var(--text-secondary)",
            cursor: "pointer",
            marginBottom: 4,
            background: isChatsView ? "color-mix(in srgb, var(--accent) 22%, var(--bg-sidebar))" : "transparent",
          }}
        >
          <span
            style={{
              width: 14,
              height: 12,
              borderRadius: "7px 7px 7px 2px",
              border: "1.5px solid var(--text-muted)",
              display: "inline-block",
            }}
          />
          <span>Chats</span>
        </div>

        {/* Projects nav */}
        <div
          className="axon-nav"
          onClick={onShowProjects}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 7,
            fontSize: 13,
            color: "var(--text-secondary)",
            cursor: "pointer",
            marginBottom: 16,
            background: isProjectsView ? "color-mix(in srgb, var(--accent) 22%, var(--bg-sidebar))" : "transparent",
          }}
        >
          <span
            className="axon-folder-icon"
            style={{
              position: "relative",
              width: 14,
              height: 11,
              borderRadius: "0 2px 2px 2px",
              border: "1.5px solid var(--text-muted)",
              display: "inline-block",
              marginTop: 2,
            }}
          />
          <span>Projects</span>
        </div>

        {/* List: chats or projects */}
        {isChatsView && (
          <>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                padding: "0 10px 8px 10px",
              }}
            >
              Chats
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {chats.map((c) => (
                <div
                  key={c.id}
                  className="axon-chat-item"
                  onClick={() => onSelectChat(c.id)}
                  style={{
                    padding: "9px 10px",
                    borderRadius: 7,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background:
                      c.id === activeChatId ? "color-mix(in srgb, var(--accent) 22%, var(--bg-sidebar))" : "transparent",
                  }}
                >
                  {c.title}
                </div>
              ))}
            </div>
          </>
        )}

        {isProjectsView && (
          <>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                padding: "0 10px 8px 10px",
              }}
            >
              Projects
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="axon-chat-item"
                  onClick={() => onSelectProject(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 10px",
                    borderRadius: 7,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span
                    className="axon-folder-icon-sm"
                    style={{
                      position: "relative",
                      width: 13,
                      height: 10,
                      borderRadius: "0 2px 2px 2px",
                      border: "1.5px solid var(--text-muted)",
                      display: "inline-block",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  {p.title}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer: profile row + popover */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12, position: "relative" }}>
          {showProfileMenu && (
            <>
              <div onClick={() => setShowProfileMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 6px)",
                  left: 0,
                  width: "100%",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  padding: 5,
                  zIndex: 41,
                  boxShadow: "0 10px 30px oklch(0.05 0.01 264 / 0.4)",
                }}
              >
                <div
                  className="axon-signout"
                  style={{ padding: "8px 10px", borderRadius: 6, fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}
                >
                  Sign out
                </div>
              </div>
            </>
          )}
          <div
            className="axon-profile-row"
            onClick={() => setShowProfileMenu((s) => !s)}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderRadius: 8, padding: 4 }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Main area ---------------- */}
      <div
        className="axon-main"
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%", position: "relative" }}
      >
        {/* Header */}
        <div
          style={{
            height: 56,
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "70%",
            }}
          >
            {headerTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "oklch(0.55 0.13 145)", fontWeight: 500 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.65 0.15 145)" }} />
            ready
          </div>
        </div>

        {/* Project detail */}
        {activeProject && (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", padding: "40px 24px" }}>
            <div style={{ maxWidth: 640, width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                className="axon-back-link"
                onClick={() => setActiveProjectId(null)}
                style={{ fontSize: 12.5, color: "var(--text-secondary)", cursor: "pointer", width: "fit-content" }}
              >
                ← All projects
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: "var(--text-primary)" }}>{activeProject.title}</div>
              <div style={{ fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{activeProject.description}</div>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  marginTop: 8,
                  paddingTop: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--text-muted)",
                  fontSize: 13.5,
                }}
              >
                No chats in this project yet.
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)" }}>What can I help with?</div>
            <div style={{ width: "100%", maxWidth: 640 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "12px 14px",
                }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Message Axon..."
                  rows={3}
                  style={{
                    flex: 1,
                    resize: "none",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontFamily: "inherit",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    maxHeight: 160,
                  }}
                />
                <div
                  onClick={onSend}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 9,
                    background: draft.trim() ? "var(--accent)" : "var(--border)",
                    color: "white",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Send
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation */}
        {activeChat && (
          <>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  maxWidth: 720,
                  width: "100%",
                  margin: "0 auto",
                  padding: "28px 24px 12px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                {activeChat.messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "11px 15px",
                        borderRadius: 14,
                        background: m.role === "user" ? "color-mix(in srgb, var(--accent) 55%, black)" : "var(--bg-surface)",
                        color: m.role === "user" ? "white" : "var(--text-primary)",
                        fontSize: 14.5,
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ padding: "11px 15px", borderRadius: 14, background: "var(--bg-surface)", display: "flex", gap: 5 }}>
                      <div className="axon-dot" style={{ animationDelay: "0s" }} />
                      <div className="axon-dot" style={{ animationDelay: "0.15s" }} />
                      <div className="axon-dot" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: "14px 24px 22px 24px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: 720,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "11px 14px",
                }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Message Axon..."
                  rows={3}
                  style={{
                    flex: 1,
                    resize: "none",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontFamily: "inherit",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    maxHeight: 160,
                  }}
                />
                <div
                  onClick={onSend}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 9,
                    background: draft.trim() ? "var(--accent)" : "var(--border)",
                    color: "white",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Send
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---------------- New Project modal ---------------- */}
      {showNewProjectModal && (
        <div
          onClick={() => setShowNewProjectModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0.1 0.006 264 / 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              maxWidth: "90vw",
              background: "var(--bg-sidebar)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 20px 60px oklch(0.05 0.01 264 / 0.5)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>New project</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Name</div>
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "9px 11px",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>Description (optional)</div>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                style={{
                  resize: "none",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "9px 11px",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <div
                className="axon-cancel-btn"
                onClick={() => setShowNewProjectModal(false)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}
              >
                Cancel
              </div>
              <div
                onClick={onCreateProject}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: newProjectName.trim() ? "var(--accent)" : "var(--border)",
                  color: "white",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create project
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Scoped CSS: font, scrollbar, hover states, icon pseudo-elements, lattice bg, thinking dots. */
const AXON_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.axon-root ::-webkit-scrollbar { width: 8px; height: 8px; }
.axon-root ::-webkit-scrollbar-thumb { background: oklch(0.3 0.01 264); border-radius: 4px; }

.axon-primary-btn:hover { background: color-mix(in srgb, var(--accent) 85%, white) !important; }
.axon-nav:hover,
.axon-chat-item:hover,
.axon-profile-row:hover,
.axon-cancel-btn:hover { background: var(--bg-surface) !important; }
.axon-signout:hover { background: var(--bg-sidebar) !important; }
.axon-back-link:hover { color: var(--text-primary) !important; }

/* Folder icon tab (::before) */
.axon-folder-icon::before {
  content: ''; position: absolute; left: 0; top: -3px;
  width: 6px; height: 3px; border-radius: 2px 2px 0 0;
  border: 1.5px solid var(--text-muted); border-bottom: none;
}
.axon-folder-icon-sm::before {
  content: ''; position: absolute; left: 0; top: -3px;
  width: 5px; height: 3px; border-radius: 2px 2px 0 0;
  border: 1.5px solid var(--text-muted); border-bottom: none;
}

/* Main content lattice background */
.axon-main::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image:
    repeating-linear-gradient(60deg, var(--border) 0 1px, transparent 2px 40px),
    repeating-linear-gradient(-60deg, var(--border) 0 1px, transparent 2px 40px);
  -webkit-mask-image: radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 85%);
  mask-image: radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 85%);
  filter: blur(5px); opacity: 0.9;
}
/* Keep interactive content above the lattice */
.axon-main > * { position: relative; z-index: 1; }

/* Thinking dots */
.axon-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: axonDotPulse 1.2s infinite; }
@keyframes axonDotPulse { 0%,80%,100% { opacity: 0.25; } 40% { opacity: 1; } }
`;
