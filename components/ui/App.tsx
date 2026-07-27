"use client";

import { useEffect, useState } from "react";
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
import { ChatMessage } from "./chatTypes";
import { SidebarView } from "./SidebarNav";
import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";
import NewProjectDialog from "./NewProjectDialog";

export default function App() {
  const session = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarView, setSidebarView] = useState<SidebarView>("chats");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeProject = activeConversation
    ? projects.find((p) => p.id === activeConversation.project_id) ?? null
    : null;
  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;
  const filterProjectId = sidebarView === "chats" ? null : selectedProjectId;
  const visibleConversations = conversations.filter((c) => c.project_id === filterProjectId);
  const showingProjectList = sidebarView === "projects" && !selectedProject;
  const sortedProjects = [...projects].sort(
    (a, b) => (b.is_builtin ? 1 : 0) - (a.is_builtin ? 1 : 0)
  );
  const favoriteConversations = conversations.filter((c) => c.is_favorite);

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
    listMessages(activeId).then(({ data }) => {
      setMessages(data.map((m) => ({ role: m.role, content: m.content })));
    });
  }, [activeId]);

  async function refreshConversations(selectId?: string) {
    const { data } = await listConversations();
    setConversations(data);
    if (selectId) setActiveId(selectId);
  }

  function selectChatsView() {
    setSidebarView("chats");
    setSelectedProjectId(null);
  }

  function selectProjectsView() {
    setSidebarView("projects");
    setSelectedProjectId(null);
  }

  async function handleNewChat() {
    const { data } = await createConversation("New chat", filterProjectId);
    if (data) refreshConversations(data.id);
    setMobileSidebarOpen(false);
  }

  async function handleDeleteChat(id: string) {
    await deleteConversation(id);
    if (activeId === id) setActiveId(null);
    refreshConversations();
  }

  async function handleDeleteProject(id: string) {
    await deleteProject(id);
    if (selectedProjectId === id) setSelectedProjectId(null);
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

    let conversationId = activeId;
    let pastContext: string | undefined;
    if (!conversationId) {
      const { data } = await createConversation(text.slice(0, 60), filterProjectId);
      if (!data) return;
      conversationId = data.id;
      await refreshConversations(conversationId);
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
    } catch {
      appendToLast("⚠️ Could not reach the server.");
    } finally {
      setIsStreaming(false);
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
        onSelectProject={setSelectedProjectId}
        onDeleteProject={handleDeleteProject}
        onBackFromProject={() => setSelectedProjectId(null)}
        onSelectConversation={(id) => {
          setActiveId(id);
          setMobileSidebarOpen(false);
        }}
        onDeleteConversation={handleDeleteChat}
        onSignOut={() => signOut()}
      />

      <ChatPanel
        activeConversation={activeConversation}
        activeProject={activeProject}
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

      {showNewProject && (
        <NewProjectDialog
          onClose={() => setShowNewProject(false)}
          onCreated={(project) => {
            setProjects((p) => [project, ...p]);
            setSelectedProjectId(project.id);
            setShowNewProject(false);
            setMobileSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}
