import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}
export default App;