import React, { useState } from 'react';

function NamePopup({ onSubmit }) {
  const [name, setName] = useState('');

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Welcome!</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <br /><br />
        <button onClick={() => name && onSubmit(name)}>Continue</button>
      </div>
    </div>
  );
}

export default NamePopup;
