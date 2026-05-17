import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SYSTEM_REGISTRY } from '@/core/systems';
import styles from './Sidebar.module.css';
import { ChevronRight } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const systems = Object.values(SYSTEM_REGISTRY);

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Strange Attractors</h2>
      <div className={styles.list}>
        {systems.map((system) => (
          <button
            key={system.id}
            className={styles.item}
            onClick={() => navigate(`/sim/${system.id}`)}
          >
            <span>{system.name}</span>
            <ChevronRight size={16} className={styles.icon} />
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
