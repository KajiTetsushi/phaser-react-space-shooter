import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// TODO: Find out why the Phaser game gradually resizes at launch with the React integration.
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
