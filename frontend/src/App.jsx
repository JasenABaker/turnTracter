import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GmDashboard from './components/GmDashboard';
import PlayerDisplay from './components/PlayerDisplay';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/gm" element={<GmDashboard />} />
        <Route path="/player" element={<PlayerDisplay />} />
        <Route path="*" element={<Navigate to="/gm" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
