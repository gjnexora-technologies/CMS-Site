import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DynamicPage } from './pages/DynamicPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DynamicPage />} />
        <Route path="/:slug" element={<DynamicPage />} />
        <Route path="/preview/:slug" element={<DynamicPage />} />
        <Route path="*" element={<DynamicPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
