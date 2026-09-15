import { NavLink, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Ripasso } from './pages/Ripasso';
import { Cura } from './pages/Cura';
import { Concetti } from './pages/Concetti';

export function App() {
  return (
    <div className="app">
      <nav className="nav">
        <span className="logo">StudyLab</span>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/ripasso">Ripasso</NavLink>
        <NavLink to="/cura">Cura</NavLink>
        <NavLink to="/concetti">Concetti</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ripasso" element={<Ripasso />} />
          <Route path="/cura" element={<Cura />} />
          <Route path="/concetti" element={<Concetti />} />
        </Routes>
      </main>
    </div>
  );
}
