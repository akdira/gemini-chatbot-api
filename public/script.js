const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Riwayat percakapan yang dikirim ke /api/chat agar bot mengingat konteks
const conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  const thinkingMsg = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get response from server.');

    thinkingMsg.textContent = data.result || 'Sorry, no response received.';
    conversation.push({ role: 'model', text: data.result });
  } catch (error) {
    console.error(error);
    thinkingMsg.textContent = 'Failed to get response from server.';
    conversation.pop();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
