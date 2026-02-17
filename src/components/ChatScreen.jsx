import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { GoogleGenerativeAI } from "@google/generative-ai";

function ChatScreen({ apiKey, userName }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isChatEmpty = messages.length === 0 && !loading;

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Prepare history (format required by SDK)
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      const botText = response.text();

      setMessages((prev) => [...prev, { sender: 'bot', text: botText }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [...prev, { sender: 'bot', text: "Sorry, limited connection or API error. Please check your key." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === 'user';
    const avatarUrl = isUser
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&rounded=true`
      : `${process.env.PUBLIC_URL}/robot-logo.jpg`;

    const html = DOMPurify.sanitize(marked.parse(msg.text));

    return (
      <div key={index} className={`chat-message-row ${isUser ? 'user' : 'bot'}`}>
        <img src={avatarUrl} alt="avatar" className="message-avatar" />
        <div className="message-content">
          <div className="message-sender">{isUser ? userName : 'AI Bot'}</div>
          <div 
            className="message-bubble" 
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-container ${isChatEmpty ? 'centered-view' : ''}`}>
      <div className="messages-area">
        <div className="chat-messages">
          {messages.map((msg, i) => renderMessage(msg, i))}
          {loading && (
            <div className="chat-message-row bot">
              <div className="typing-indicator">AI is thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-wrapper">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
            placeholder="Puchiye jo aap chahte hain..."
          />
          <button onClick={sendPrompt} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
