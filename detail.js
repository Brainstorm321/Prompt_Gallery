(function () {
  const qs = new URLSearchParams(window.location.search);
  const id = qs.get("id");

  const titleEl = document.getElementById("detailTitle");
  const authorEl = document.getElementById("detailAuthor");
  const metaEl = document.getElementById("detailMeta");
  const tagsEl = document.getElementById("detailTags");
  const promptEl = document.getElementById("detailPrompt");
  const copyBtn = document.getElementById("copyPromptBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const viewOriginalBtn = document.getElementById("viewOriginalBtn");
  const imgEl = document.getElementById("detailImage");
  const toast = document.getElementById("toast");

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  async function copyText(text) {
    const value = (text ?? "").toString();
    if (!value.trim()) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (e) {}
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  function setVisible(el, visible) {
    if (!el) return;
    el.style.display = visible ? "" : "none";
  }

  function setCopyEnabled(enabled) {
    if (!copyBtn) return;
    copyBtn.disabled = !enabled;
    copyBtn.classList.toggle("is-disabled", !enabled);
  }

  // 修改后的按钮逻辑：强制绿色背景
  function updateButtons(promptText, originalUrl) {
    const hasPrompt = !!(promptText && promptText.trim().length && !promptText.includes("TODO"));
    const hasOriginal = !!(originalUrl && originalUrl.trim().length);

    setCopyEnabled(hasPrompt);
    setVisible(viewOriginalBtn, true); // 永远显示

    if (viewOriginalBtn) {
      viewOriginalBtn.style.backgroundColor = "#16a34a"; // 绿色背景
      viewOriginalBtn.style.color = "white";
      viewOriginalBtn.style.border = "none";
      viewOriginalBtn.style.fontWeight = "600";
      
      if (hasOriginal) {
        viewOriginalBtn.href = originalUrl;
        viewOriginalBtn.target = "_blank";
        viewOriginalBtn.style.opacity = "1";
        viewOriginalBtn.style.pointerEvents = "auto";
      } else {
        viewOriginalBtn.style.opacity = "0.5";
        viewOriginalBtn.style.pointerEvents = "none";
      }
    }
  }

  const list = (window.PROMPTS && Array.isArray(window.PROMPTS)) ? window.PROMPTS : [];
  const item = list.find(p => String(p.id) === String(id));

  if (!item) {
    if (titleEl) titleEl.textContent = "Prompt not found";
    updateButtons("", "");
    return;
  }

  const title = item.title || "Untitled";
  const author = item.creator || item.author || "@unknown";
  const type = item.type || "Image";
  const access = item.access || "Free";
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const promptText = (item.prompt || "").toString();
  const originalUrl = (item.originalUrl || "").toString();

  if (titleEl) titleEl.textContent = title;
  if (authorEl) authorEl.textContent = author;
  if (metaEl) metaEl.textContent = `${type} · ${access}`;
  if (tagsEl) tagsEl.innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join("");
  if (imgEl) { imgEl.src = item.image || ""; imgEl.alt = title; }

  // 修改后的文本框显示逻辑
  if (promptEl) {
    const isPromptValid = promptText && promptText.trim().length > 0 && !promptText.includes("TODO");
    promptEl.value = isPromptValid ? promptText : originalUrl;
  }

  updateButtons(promptText, originalUrl);

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const current = promptEl?.value || "";
      if (!current.trim() || current === originalUrl) {
        showToast("No prompt to copy.");
        return;
      }
      const ok = await copyText(current);
      showToast(ok ? "Copied!" : "Copy failed.");
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const src = item.image || (imgEl ? imgEl.src : "");
      if (!src) return;
      const a = document.createElement("a");
      a.href = src;
      a.download = (title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "image") + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
})();