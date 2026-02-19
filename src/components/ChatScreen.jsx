import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function ChatScreen({ apiKey, userName }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const isChatEmpty = messages.length === 0 && !loading;

  const sendPrompt = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { sender: 'user', text: input }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const context = updatedMessages.slice(-5).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: context }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API Error');
      }

      const botMessage =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: botMessage }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error: ' + error.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === 'user';

    const avatarUrl = isUser
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
          userName
        )}&background=4f46e5&color=fff&rounded=true&size=40`
      : `${process.env.PUBLIC_URL}/robot-logo.jpg`;

    const nameLabel = isUser ? userName : 'AI Bot';
    const html = DOMPurify.sanitize(marked(msg.text));

    return (
      <div
        key={index}
        className={`chat-message-row ${isUser ? 'user' : 'bot'}`}
      >
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
    <div
      className={`chat-container ${
        isChatEmpty ? 'centered-input' : ''
      }`}
    >
      <div className="messages-area">
        <div className="chat-messages">
          {messages.map((msg, i) => renderMessage(msg, i))}

          {loading && (
            <div className="chat-message-row bot">
              <img
                src="/robot-logo.jpg"
                alt="avatar"
                className="message-avatar"
              />
              <div className="message-content">
                <div className="message-sender">AI Bot</div>
                <div className="message-bubble bot-bubble">
                  Typing...
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`input-area ${
            isChatEmpty ? 'input-centered' : 'sticky-input'
          }`}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
            placeholder="Ask me anything..."
          />
          <button onClick={sendPrompt}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
