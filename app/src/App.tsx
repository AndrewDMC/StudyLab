import { NavLink, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ActiveRecall } from './pages/ActiveRecall';
import { Concetti } from './pages/Concetti';
import { Materiali } from './pages/Materiali';

export function App() {
  return (
    <div className="app">
      <nav className="nav">
        <span className="logo">StudyLab</span>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/materiali">Materiali</NavLink>
        <NavLink to="/active-recall">Active Recall</NavLink>
        <NavLink to="/concetti">Concetti</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materiali" element={<Materiali />} />
          <Route path="/active-recall" element={<ActiveRecall />} />
          <Route path="/concetti" element={<Concetti />} />
        </Routes>
      </main>
    </div>
  );
}
