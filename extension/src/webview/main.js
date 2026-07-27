(function () {
  const vscode = acquireVsCodeApi();

  const threadEl = document.getElementById("thread");
  const changelogEl = document.getElementById("changelog");
  const inputEl = document.getElementById("input");
  const sendEl = document.getElementById("send");

  function appendMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "bubble " + role;
    bubble.textContent = text;
    threadEl.appendChild(bubble);
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  function renderDiff(parts) {
    const container = document.createElement("div");
    container.className = "diff";
    parts.forEach((part) => {
      const line = document.createElement("pre");
      line.className = part.added ? "diff-added" : part.removed ? "diff-removed" : "diff-same";
      line.textContent = part.value;
      container.appendChild(line);
    });
    return container;
  }

  function renderChangelog(entries) {
    changelogEl.innerHTML = "";
    if (entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No changes yet.";
      changelogEl.appendChild(empty);
      return;
    }

    entries.forEach((entry) => {
      const item = document.createElement("details");
      item.className = "entry";

      const summary = document.createElement("summary");
      const time = new Date(entry.timestamp).toLocaleTimeString();
      summary.textContent = `${time} — ${entry.request}`;
      item.appendChild(summary);

      entry.files.forEach((file) => {
        const fileBlock = document.createElement("div");
        fileBlock.className = "file-block";

        const header = document.createElement("div");
        header.className = "file-header";
        header.textContent = file.path + (file.applied ? "" : " (not applied)");
        fileBlock.appendChild(header);

        if (file.note) {
          const note = document.createElement("p");
          note.className = "note";
          note.textContent = file.note;
          fileBlock.appendChild(note);
        }

        fileBlock.appendChild(renderDiff(file.diff));
        item.appendChild(fileBlock);
      });

      if (!entry.undone) {
        const undoBtn = document.createElement("button");
        undoBtn.className = "undo";
        undoBtn.textContent = "Undo";
        undoBtn.addEventListener("click", () => {
          vscode.postMessage({ type: "undo", entryId: entry.id });
        });
        item.appendChild(undoBtn);
      } else {
        const undoneLabel = document.createElement("p");
        undoneLabel.className = "undone-label";
        undoneLabel.textContent = "Undone";
        item.appendChild(undoneLabel);
      }

      changelogEl.appendChild(item);
    });
  }

  function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    appendMessage("user", text);
    inputEl.value = "";
    vscode.postMessage({ type: "send", text });
  }

  sendEl.addEventListener("click", send);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type === "reply") {
      appendMessage("assistant", message.reply);
    } else if (message.type === "error") {
      appendMessage("error", message.message);
    } else if (message.type === "changelog") {
      renderChangelog(message.entries);
    }
  });

  renderChangelog([]);
})();
