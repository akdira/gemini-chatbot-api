const chatEl = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');
const fileInput = document.getElementById('file');
const attachmentsEl = document.getElementById('attachments');
const sendBtn = form.querySelector('button');

// Riwayat percakapan yang dikirim ke server: [{ role, text, files }]
const history = [];
let pendingFiles = [];

function addMessage(role, text, fileNames = []) {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  if (fileNames.length) {
    const files = document.createElement('div');
    files.className = 'files';
    files.textContent = '📎 ' + fileNames.join(', ');
    el.appendChild(files);
  }
  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
  return el;
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

fileInput.addEventListener('change', async () => {
  pendingFiles = await Promise.all(
    [...fileInput.files].map(async (file) => ({
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      data: await readAsBase64(file),
    }))
  );
  attachmentsEl.innerHTML = pendingFiles.map((f) => `<span>📎 ${f.name}</span>`).join('');
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text && pendingFiles.length === 0) return;

  const files = pendingFiles.map(({ mimeType, data }) => ({ mimeType, data }));
  addMessage('user', text, pendingFiles.map((f) => f.name));
  history.push({ role: 'user', text, files });

  input.value = '';
  fileInput.value = '';
  pendingFiles = [];
  attachmentsEl.innerHTML = '';
  sendBtn.disabled = true;
  const thinking = addMessage('model', 'Sedang menganalisis...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Permintaan gagal.');

    thinking.textContent = data.reply;
    history.push({ role: 'model', text: data.reply });
  } catch (err) {
    thinking.remove();
    history.pop();
    addMessage('error', `Gagal: ${err.message}`);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});
