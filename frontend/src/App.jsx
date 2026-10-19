import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashPage from './components/SplashPage';
import AppLayout from './components/AppLayout';
import GmDashboard from './components/GmDashboard';
import PlayerDisplay from './components/PlayerDisplay';
import CompanionsDashboard from './components/CompanionsDashboard';
import CompanionTracker from './components/CompanionTracker';
import GmStatCards from './components/GmStatCards';
import MonsterRoster from './components/MonsterRoster';
import MonsterNpcCreator from './components/MonsterNpcCreator';
import EncounterSelect from './components/EncounterSelect';
import NewEncounter from './components/NewEncounter';
import NewPlayer from './components/NewPlayer';
import InitiativeSetting from './components/InitiativeSetting';
import MonsterCompendium from './components/MonsterCompendium';
import PlayerCompendium from './components/PlayerCompendium';
import DiceRollerDrawer from './components/DiceRollerDrawer';

export default function App() {
  return (
    <BrowserRouter>
      <DiceRollerDrawer />
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route element={<AppLayout />}>
          <Route path="/gm" element={<GmDashboard />} />
          <Route path="/player" element={<PlayerDisplay />} />
          <Route path="/companions" element={<CompanionsDashboard />} />
          <Route path="/companion-tracker" element={<CompanionTracker />} />
          <Route path="/stat-cards" element={<GmStatCards />} />
          <Route path="/monster-roster" element={<MonsterRoster />} />
          <Route path="/monster-creator" element={<MonsterNpcCreator />} />
          <Route path="/encounters" element={<EncounterSelect />} />
          <Route path="/encounters/new" element={<NewEncounter />} />
          <Route path="/encounters/:id/build" element={<NewEncounter />} />
          <Route path="/encounters/:id/initiative" element={<InitiativeSetting />} />
          <Route path="/players/new" element={<NewPlayer />} />
          <Route path="/compendium" element={<MonsterCompendium />} />
          <Route path="/players" element={<PlayerCompendium />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
