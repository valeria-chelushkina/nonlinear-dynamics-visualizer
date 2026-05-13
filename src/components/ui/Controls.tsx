import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import styles from './Controls.module.css';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Controls: React.FC = () => {
  const { params, setParams, isPaused, togglePause, resetSimulation, speed, setSpeed } = useSimulationStore();

  return (
    <div className={styles.sidebar}>
      <h2>Lorenz Attractor</h2>
      
      <div className={styles.controlGroup}>
        <label>
          Sigma (&#963;) <span className={styles.value}>{params.sigma.toFixed(1)}</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="50" 
          step="0.1" 
          value={params.sigma} 
          onChange={(e) => setParams({ sigma: parseFloat(e.target.value) })}
        />
      </div>

      <div className={styles.controlGroup}>
        <label>
          Rho (&#961;) <span className={styles.value}>{params.rho.toFixed(1)}</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="0.1" 
          value={params.rho} 
          onChange={(e) => setParams({ rho: parseFloat(e.target.value) })}
        />
      </div>

      <div className={styles.controlGroup}>
        <label>
          Beta (&#946;) <span className={styles.value}>{params.beta.toFixed(2)}</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="10" 
          step="0.01" 
          value={params.beta} 
          onChange={(e) => setParams({ beta: parseFloat(e.target.value) })}
        />
      </div>

      <div className={styles.controlGroup}>
        <label>
          Simulation speed <span className={styles.value}>{speed.toFixed(1)}x</span>
        </label>
        <input 
          type="range" 
          min="0.1" 
          max="5" 
          step="0.1" 
          value={speed} 
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button 
          className={`${styles.button} ${isPaused ? styles.buttonPrimary : ''}`} 
          onClick={togglePause}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button className={styles.button} onClick={resetSimulation}>
          <RotateCcw size={18} />
          Reset
        </button>
      </div>
    </div>
  );
};

export default Controls;
