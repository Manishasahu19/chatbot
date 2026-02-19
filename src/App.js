import React, { useState } from 'react';
import NamePopup from './components/NamePopup';
import Header from './components/Header';
import ChatScreen from './components/ChatScreen';
import { ThemeProvider } from './components/ThemeContext';

function App() {
  const [userName, setUserName] = useState('');

  return (
    <ThemeProvider>
      <div className="app-root">
        {!userName ? (
          <NamePopup onSubmit={setUserName} />
        ) : (
          <>
            <Header userName={userName} />
            {/* <ChatScreen apiKey={"API_KEY"} userName={userName} /> */}
 <ChatScreen apiKey={"AIzaSyDOa-OnFc39w1zJ-Sngv0oK1c2G8vyoRnA"} userName={userName} />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
