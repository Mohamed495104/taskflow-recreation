import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import './App.css';   // Custom app styles
import App from './App.jsx';
import { RecreationStatsProvider } from './contexts/RecreationStatsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecreationStatsProvider>
      <App />
    </RecreationStatsProvider>
  </React.StrictMode>
);