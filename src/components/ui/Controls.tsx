import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import styles from './Controls.module.css';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Controls: React.FC = () => {
  const { params, setParams, isPaused, togglePause, resetSimulation, speed, setSpeed } = useSimulationStore();

  const [presetName, setPresetName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);


  // Save surrent parameters of the model to a DB
  const handleSave = async() => {
    if(!presetName) return alert("Enter a name for your preset.");

    setIsSaving(true);
    try{
      const response = await fetch('http://localhost:3000/api/presets', 
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: presetName,
            systemType: 'lorenz', // for now - only Lorenz Attractor
            parameters: params, // current parameters for Lorenz Attractor
            userId: 'e2871844-c00c-4abb-b7d3-eead718680c7' // id for a test user (got from '/api/seed-user' in server)
          }),
        });

        if(response.ok) {
          alert('Preset saved successfully.');
          setPresetName(''); // clear input
        }
    } catch(error) {
      alert('Failed to save a preset.');
    } finally {
      setIsSaving(false);
    }
  };


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

      <div className={styles.controlGroup} style={{marginTop: '20px', borderTop: '1px solid gray',  paddingTop: '10px'}}>
          <label style={{marginBottom: '10px'}}>Save it</label>
          <input
          type="text"
          placeholder='Enter preset name'
          className={styles.textInput}
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          />
          <button
            className={styles.buttonPrimary}
            style={{width: '100%', marginTop: '10px'}}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

    </div>
  );
};

export default Controls;
