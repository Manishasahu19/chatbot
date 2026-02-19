import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function ChatScreen({ apiKey, userName }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    // 🔥 Only current message (No old context)
    const context = [
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: context,
            generationConfig: {
              temperature: 0.9,
              topP: 1,
              maxOutputTokens: 2048
            }
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API Error');
      }

      const botMessage =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from model.";

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: botMessage }
      ]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Error: " + error.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === 'user';
    const html = DOMPurify.sanitize(marked.parse(msg.text));

    return (
      <div key={index} className={`chat-message-row ${isUser ? 'user' : 'bot'}`}>
        <div className="message-content">
          <div className="message-sender">
            {isUser ? userName : 'AI Bot'}
          </div>
          <div
            className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="top-bar">
        <button onClick={clearChat}>New Chat</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => renderMessage(msg, i))}

        {loading && (
          <div className="message-bubble bot-bubble">
            Typing...
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
          placeholder="Ask me anything..."
        />
        <button onClick={sendPrompt} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatScreen;
