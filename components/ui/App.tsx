"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Conversation, Project } from "@/lib/types";
import {
  listConversations,
  createConversation,
  deleteConversation,
  renameConversation,
  setConversationFavorite,
  setConversationProject,
} from "@/components/api/conversations";
import { listMessages, saveMessage, getPastContext } from "@/components/api/messages";
import { listProjects, deleteProject, ensureBudgetProject } from "@/components/api/projects";
import { buildBudgetContext } from "@/components/api/budget";
import { signOut } from "@/components/api/auth";
import { useSession } from "./session";
import { ChatMessage } from "@/components/ui/chat/chatTypes";
import { SidebarView } from "@/components/ui/sidebar/SidebarNav";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import ChatPanel from "@/components/ui/chat/ChatPanel";
import NewProjectDialog from "@/components/ui/projects/NewProjectDialog";
import SettingsView from "@/components/ui/settings/SettingsView";
import { MenuIcon } from "./icons";
import { styles } from "./styles";

export default function App() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();

  const isSettingsView = pathname === "/settings";
  const isProjectsRoute = pathname.startsWith("/projects");
  // Derived from pathname rather than useParams: sendMessage() moves onto a
  // fresh conversation with native history.pushState (see comment there), and
  // usePathname tracks that while useParams does not.
  const activeId = isProjectsRoute
    ? null
    : pathname.startsWith("/c/")
      ? pathname.slice(3)
      : (params.id ?? null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);
  const isStreamingRef = useRef(false);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeProject = activeConversation
    ? projects.find((p) => p.id === activeConversation.project_id) ?? null
    : null;
  // Stay on the "projects" sidebar both when browsing /projects/[id] directly
  // and when inside a chat that belongs to a project, so opening a project's
  // chat doesn't bounce the sidebar back to the unfiled chats list.
  const selectedProjectId = isProjectsRoute
    ? (params.id ?? null)
    : (activeConversation?.project_id ?? null);
  const sidebarView: SidebarView = isProjectsRoute || selectedProjectId ? "projects" : "chats";
  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;
  const filterProjectId = sidebarView === "chats" ? null : selectedProjectId;
  const visibleConversations = conversations.filter(
    (c) => c.project_id === filterProjectId && c.id !== pendingConversationId
  );
  const showingProjectList = sidebarView === "projects" && !selectedProject;
  const sortedProjects = [...projects].sort(
    (a, b) => (b.is_builtin ? 1 : 0) - (a.is_builtin ? 1 : 0)
  );
  const favoriteConversations = conversations.filter(
    (c) => c.is_favorite && c.id !== pendingConversationId
  );

  useEffect(() => {
    refreshConversations();
    listProjects().then(async ({ data }) => {
      setProjects(data);
      const budgetProject = await ensureBudgetProject(data);
      if (budgetProject && !data.some((p) => p.id === budgetProject.id)) {
        setProjects((p) => [...p, budgetProject]);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    if (isStreamingRef.current) return;
    listMessages(activeId).then(({ data }) => {
      setMessages(data.map((m) => ({ role: m.role, content: m.content })));
    });
  }, [activeId]);

  async function refreshConversations() {
    const { data } = await listConversations();
    setConversations(data);
  }

  function selectChatsView() {
    router.push("/");
  }

  function selectProjectsView() {
    router.push("/projects");
  }

  async function handleNewChat() {
    // Project-scoped chats need a row to attach to right away since
    // ProjectDetail has no composer of its own; plain "New chat" just
    // drops the user on the empty home composer — sendMessage() creates
    // the conversation lazily once they actually send something.
    if (filterProjectId) {
      const { data } = await createConversation("New chat", filterProjectId);
      if (data) {
        setPendingConversationId(data.id);
        await refreshConversations();
        router.push(`/c/${data.id}`);
      }
    } else {
      router.push("/");
    }
    setMobileSidebarOpen(false);
  }

  async function handleDeleteChat(id: string) {
    await deleteConversation(id);
    if (activeId === id) router.push("/");
    refreshConversations();
  }

  async function handleDeleteProject(id: string) {
    await deleteProject(id);
    if (selectedProjectId === id) router.push("/projects");
    setProjects((p) => p.filter((proj) => proj.id !== id));
    refreshConversations();
  }

  async function handleRenameConversation(id: string, title: string) {
    await renameConversation(id, title);
    refreshConversations();
  }

  async function handleToggleFavorite(id: string, isFavorite: boolean) {
    await setConversationFavorite(id, !isFavorite);
    refreshConversations();
  }

  async function handleSetConversationProject(id: string, projectId: string | null) {
    await setConversationProject(id, projectId);
    refreshConversations();
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;

    isStreamingRef.current = true;

    let conversationId = activeId;
    let pastContext: string | undefined;
    const isFirstMessage = messages.length === 0;
    if (!conversationId) {
      const { data } = await createConversation(text.slice(0, 60), filterProjectId);
      if (!data) {
        isStreamingRef.current = false;
        return;
      }
      conversationId = data.id;
      setPendingConversationId(conversationId);
      await refreshConversations();
      // Native pushState, NOT router.push: each page renders its own <App/>,
      // so a router navigation would remount App mid-stream and orphan the
      // reply until reload. Next 14 syncs usePathname/useParams with the
      // History API, so this keeps the same instance (and its streaming
      // state) alive while the URL updates.
      window.history.pushState(null, "", `/c/${conversationId}`);
      pastContext = await getPastContext(conversationId);
    }

    const project = activeProject ?? selectedProject;
    let projectInstructions = project?.instructions_md || undefined;
    if (project?.is_builtin) {
      const liveContext = await buildBudgetContext();
      projectInstructions = `${projectInstructions ?? ""}\n\n${liveContext}`;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);
    saveMessage(conversationId, "user", text);

    // Add an empty assistant message we'll fill in as tokens arrive.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: pastContext,
          projectInstructions,
        }),
      });

      if (!res.ok || !res.body) {
        const { error } = await res.json().catch(() => ({ error: "Request failed." }));
        appendToLast(`⚠️ ${error ?? "Something went wrong."}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        appendToLast(chunk);
      }

      await saveMessage(conversationId, "assistant", assistantContent);

      if (isFirstMessage && assistantContent) {
        generateAndSetTitle(conversationId, text, assistantContent);
      }
    } catch {
      appendToLast("⚠️ Could not reach the server.");
    } finally {
      if (isFirstMessage) {
        setPendingConversationId(null);
        refreshConversations();
      }
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }

  async function generateAndSetTitle(
    conversationId: string,
    userMessage: string,
    assistantMessage: string
  ) {
    try {
      const res = await fetch("/api/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage, assistantMessage }),
      });
      if (!res.ok) return;
      const { title } = await res.json();
      if (title) {
        await renameConversation(conversationId, title);
        refreshConversations();
      }
    } catch {
      // Keep the fallback title (first 60 chars of the message) on failure.
    }
  }

  function appendToLast(chunk: string) {
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = {
        role: "assistant",
        content: copy[copy.length - 1].content + chunk,
      };
      return copy;
    });
  }

  return (
    <div className="flex h-full">
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        session={session}
        sidebarView={sidebarView}
        sortedProjects={sortedProjects}
        selectedProject={selectedProject}
        conversations={visibleConversations}
        favoriteConversations={favoriteConversations}
        activeId={activeId}
        showingProjectList={showingProjectList}
        onSelectChatsView={() => {
          selectChatsView();
          setMobileSidebarOpen(false);
        }}
        onSelectProjectsView={selectProjectsView}
        onNewChat={handleNewChat}
        onNewProject={() => setShowNewProject(true)}
        onSelectProject={(id) => router.push(`/projects/${id}`)}
        onDeleteProject={handleDeleteProject}
        onBackFromProject={() => router.push("/projects")}
        onSelectConversation={(id) => {
          router.push(`/c/${id}`);
          setMobileSidebarOpen(false);
        }}
        onDeleteConversation={handleDeleteChat}
        onSignOut={() => signOut()}
      />

      {isSettingsView ? (
        <main className={styles.chat.main}>
          <header className={styles.chat.header}>
            <button onClick={() => setMobileSidebarOpen(true)} className={styles.chat.menuButton}>
              <MenuIcon />
            </button>
            <div className={styles.chat.headerTitle}>Settings</div>
          </header>
          <SettingsView />
        </main>
      ) : (
        <ChatPanel
          activeConversation={activeConversation}
          activeProject={activeProject}
          viewedProject={!activeConversation ? selectedProject : null}
          onBackToProjects={() => router.push("/projects")}
          projects={sortedProjects}
          isStreaming={isStreaming}
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={sendMessage}
          onOpenMenu={() => setMobileSidebarOpen(true)}
          onRenameConversation={handleRenameConversation}
          onToggleFavorite={handleToggleFavorite}
          onSetConversationProject={handleSetConversationProject}
          onDeleteConversation={handleDeleteChat}
        />
      )}

      {showNewProject && (
        <NewProjectDialog
          onClose={() => setShowNewProject(false)}
          onCreated={(project) => {
            setProjects((p) => [project, ...p]);
            router.push(`/projects/${project.id}`);
            setShowNewProject(false);
            setMobileSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}
