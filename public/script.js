const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendBtn = form.querySelector('button[type="submit"]');
const scrollArea = document.querySelector('.main');

// Riwayat percakapan yang dikirim ke /api/chat agar bot mengingat konteks
const conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage || sendBtn.disabled) return;

  document.body.classList.add('chatting');
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';
  sendBtn.disabled = true;

  const thinkingMsg = appendMessage('bot', 'Thinking...');
  thinkingMsg.classList.add('thinking');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get response from server.');

    if (data.result) {
      setContent(thinkingMsg, data.result, true);
      conversation.push({ role: 'model', text: data.result });
    } else {
      setContent(thinkingMsg, 'Sorry, no response received.');
      conversation.pop();
    }
  } catch (error) {
    console.error(error);
    setContent(thinkingMsg, 'Failed to get response from server.');
    thinkingMsg.classList.add('error');
    conversation.pop();
  } finally {
    thinkingMsg.classList.remove('thinking');
    sendBtn.disabled = false;
    input.focus();
    scrollToBottom();
  }
});

// Kartu saran di layar sambutan langsung dikirim sebagai pesan
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    input.value = chip.dataset.prompt;
    form.requestSubmit();
  });
});

document.getElementById('new-chat').addEventListener('click', () => {
  conversation.length = 0;
  chatBox.innerHTML = '';
  document.body.classList.remove('chatting');
  input.focus();
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'bot') {
    msg.innerHTML = '<svg class="avatar" aria-hidden="true"><use href="#sparkle" /></svg><div class="content"></div>';
    setContent(msg, text);
  } else {
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  scrollToBottom();
  return msg;
}

// Balasan Gemini berformat Markdown; dirender jadi HTML yang sudah disanitasi
function setContent(msg, text, asMarkdown = false) {
  const content = msg.querySelector('.content');
  if (asMarkdown && window.marked && window.DOMPurify) {
    content.innerHTML = DOMPurify.sanitize(marked.parse(text));
  } else {
    content.textContent = text;
  }
}

function scrollToBottom() {
  scrollArea.scrollTop = scrollArea.scrollHeight;
}
