(function () {
  const vscode = acquireVsCodeApi();
  const sessionsEl = document.getElementById("sessions");
  const newSessionEl = document.getElementById("newSession");

  function relativeTime(timestamp) {
    const diffMs = Date.now() - timestamp;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  function render(sessions) {
    sessionsEl.innerHTML = "";
    if (sessions.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No sessions yet.";
      sessionsEl.appendChild(empty);
      return;
    }

    sessions.forEach((session) => {
      const row = document.createElement("div");
      row.className = "session-row";
      row.addEventListener("click", () => {
        vscode.postMessage({ type: "openSession", id: session.id });
      });

      const title = document.createElement("span");
      title.className = "session-title";
      title.textContent = session.title;
      row.appendChild(title);

      const time = document.createElement("span");
      time.className = "session-time";
      time.textContent = relativeTime(session.updatedAt);
      row.appendChild(time);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "session-delete";
      deleteBtn.textContent = "✕";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        vscode.postMessage({ type: "deleteSession", id: session.id });
      });
      row.appendChild(deleteBtn);

      sessionsEl.appendChild(row);
    });
  }

  newSessionEl.addEventListener("click", () => {
    vscode.postMessage({ type: "newSession" });
  });

  window.addEventListener("message", (event) => {
    if (event.data.type === "sessions") {
      render(event.data.sessions);
    }
  });

  render([]);
})();
