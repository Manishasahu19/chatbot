import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function ChatScreen({ apiKey, userName }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const isChatEmpty = messages.length === 0 && !loading;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithRetry = async (url, options, retries = 3) => {
    const response = await fetch(url, options);

    if (response.status === 429 && retries > 0) {
      console.log("Rate limit hit. Retrying in 3 seconds...");
      await sleep(3000);
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  };

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const context = updatedMessages
      .slice(-5)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    try {
      await sleep(2000); // ✅ 2 second delay

      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: context }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const botMessage =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response received.";

      setMessages((prev) => [...prev, { sender: 'bot', text: botMessage }]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Error: " + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === 'user';
    const avatarUrl = isUser
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&rounded=true&size=40`
      : `${process.env.PUBLIC_URL}/robot-logo.jpg`;

    const nameLabel = isUser ? userName : 'AI Bot';
    const html = DOMPurify.sanitize(marked(msg.text));

    return (
      <div key={index} className={`chat-message-row ${isUser ? 'user' : 'bot'}`}>
        <img src={avatarUrl} alt="avatar" className="message-avatar" />
        <div className="message-content">
          <div className="message-sender">{nameLabel}</div>
          <div
            className="message-bubble bot-text"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-container ${isChatEmpty ? 'centered-input' : ''}`}>
      <div className="messages-area">
        <div className="chat-messages">
          {messages.map((msg, i) => renderMessage(msg, i))}

          {loading && (
            <div className="chat-message-row bot">
              <img src="/robot-logo.jpg" alt="avatar" className="message-avatar" />
              <div className="message-content">
                <div className="message-sender">AI Bot</div>
                <div className="message-bubble bot-bubble">Typing...</div>
              </div>
            </div>
          )}
        </div>

        <div className={`input-area ${isChatEmpty ? 'input-centered' : 'sticky-input'}`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <button onClick={sendPrompt} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
