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
 <ChatScreen apiKey={"AIzaSyCsTMEo9-jmuMo0I_0xinR4URsmXyq7wWs"} userName={userName} />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
