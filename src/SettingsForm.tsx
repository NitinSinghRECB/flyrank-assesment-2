import React, { useState } from 'react';
import './SettingsForm.css';

export default function SettingsForm() {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="setting-item">
        <label>Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="setting-item">
        <label>
          <input 
            type="checkbox" 
            checked={notifications} 
            onChange={(e) => setNotifications(e.target.checked)} 
          />
          Enable Notifications
        </label>
      </div>
      <button className="save-btn" onClick={() => alert('Saved!')}>Save Settings</button>
    </div>
  );
}
