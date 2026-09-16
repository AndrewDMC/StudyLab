import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { api } from './lib/api';
import { Dashboard } from './pages/Dashboard';
import { ActiveRecall } from './pages/ActiveRecall';
import { Concetti } from './pages/Concetti';
import { Materiali } from './pages/Materiali';

function dataFormattata(): string {
  return new Date()
    .toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();
}

export function App() {
  const [dovute, setDovute] = useState(0);

  useEffect(() => {
    api
      .stato()
      .then((r) => setDovute(r.materie.reduce((s, m) => s + m.dovute + m.nuove, 0)))
      .catch(() => {});
  }, []);

  return (
    <div className="app">
      <header className="masthead">
        <Link to="/" className="masthead-logo">
          StudyLab
        </Link>
        <nav className="masthead-nav">
          <NavLink to="/materiali">Pipeline</NavLink>
          <NavLink to="/active-recall">Studia</NavLink>
          <NavLink to="/concetti">Concetti</NavLink>
        </nav>
        <div className="masthead-destra">
          <span className="masthead-data">{dataFormattata()}</span>
          {dovute > 0 && (
            <Link to="/active-recall?tab=ripassa" className="masthead-cta">
              {dovute} carte
            </Link>
          )}
        </div>
      </header>
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
