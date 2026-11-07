import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../app/globals.css';
import Home from '../../app/[[...slug]]/page';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
);
