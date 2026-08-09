import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function IntentionIcon({ children, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const INTENTIONS = {
  direct: {
    label: 'Direto ao Ponto',
    color: '#EF4444',
    icon: (
      <IntentionIcon>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </IntentionIcon>
    ),
  },
  party: {
    label: 'Agitação',
    color: '#A855F7',
    icon: (
      <IntentionIcon>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </IntentionIcon>
    ),
  },
  bar: {
    label: 'Barzinho',
    color: '#F59E0B',
    icon: (
      <IntentionIcon>
        <path d="M12 10v11" />
        <path d="M6 3h12l-3 7H9z" />
      </IntentionIcon>
    ),
  },
  trust: {
    label: 'Chat de Confiança',
    color: '#3B82F6',
    icon: (
      <IntentionIcon>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </IntentionIcon>
    ),
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, banned: 0 });
  const [intentions, setIntentions] = useState({ direct: 0, party: 0, bar: 0, trust: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      let total = 0, approved = 0, pending = 0, banned = 0;
      const counts = { direct: 0, party: 0, bar: 0, trust: 0 };

      snap.docs.forEach((doc) => {
        const data = doc.data();
        total++;
        const st = data.status;
        if (st === 'approved' || !st) approved++;
        else if (st === 'pending') pending++;
        else if (st === 'banned') banned++;

        if (data.intention && counts[data.intention] !== undefined) {
          counts[data.intention]++;
        }
      });

      setStats({ total, approved, pending, banned });
      setIntentions(counts);
    });

    return unsub;
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total de Usuários</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#34d399' }}>
          <span className="stat-value">{stats.approved}</span>
          <span className="stat-label">Aprovados</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#fbbf24' }}>
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pendentes</span>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f87171' }}>
          <span className="stat-value">{stats.banned}</span>
          <span className="stat-label">Banidos</span>
        </div>
      </div>

      <h2 style={{ marginTop: 32, marginBottom: 16, color: '#e2e8f0', fontSize: 18, fontWeight: 600 }}>
        Radar de Intenções
      </h2>
      <div className="intentions-grid">
        {Object.entries(INTENTIONS).map(([key, int]) => (
          <div key={key} className="intention-card" style={{ borderLeftColor: int.color }}>
            <span className="intention-emoji" style={{ color: int.color }}>{int.icon}</span>
            <div>
              <span className="intention-count">{intentions[key]}</span>
              <span className="intention-label">{int.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
