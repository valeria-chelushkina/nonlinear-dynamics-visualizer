import React from 'react';
import SimulationCanvas from '@/components/canvas/SimulationCanvas';
import Controls from '@/components/ui/Controls';
import { useSimulationStore } from '@/store/useSimulationStore';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const comparisonMode = useSimulationStore((state) => state.comparisonMode);

  return (
    <div className={comparisonMode ? styles.splitLayout : styles.singleLayout}>
      <div className={styles.viewPane}>
        <SimulationCanvas side="left" />
        <Controls side="left" />
      </div>

      {comparisonMode && (
        <div className={styles.viewPane} style={{ borderLeft: '1px solid var(--border)' }}>
          <SimulationCanvas side="right" />
          <Controls side="right" />
        </div>
      )}
    </div>
  );
};

export default Home;
