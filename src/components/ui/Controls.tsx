import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import styles from './Controls.module.css';
import { Play, Pause, RotateCcw, Columns, ArrowRightLeft, Link, Link2Off, Camera } from 'lucide-react';

interface ControlsProps {
  side?: Side;
}

const Controls: React.FC<ControlsProps> = ({ side = 'left' }) => {
  const navigate = useNavigate();
  const sim = useSimulationStore((state) => state.sims[side]);
  const comparisonMode = useSimulationStore((state) => state.comparisonMode);
  const syncCameras = useSimulationStore((state) => state.syncCameras);

  const { 
    setParams, 
    togglePause, 
    resetSimulation, 
    setSpeed,
    toggleComparison,
    toggleSyncCameras,
    toggleAllPause,
    triggerScreenshot,
    copyParam,
    copySpeed,
    syncAll
  } = useSimulationStore();


  const { params, isPaused, speed } = sim;
  const bothPaused = useSimulationStore(state => state.sims.left.isPaused && state.sims.right.isPaused);

  const [presetName, setPresetName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const otherSide = side === 'left' ? 'right' : 'left';

  const handleSave = async () => {
    if (!presetName) return alert("Enter a name for your preset.");

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName,
          systemType: 'lorenz',
          parameters: params,
          userId: 'e2871844-c00c-4abb-b7d3-eead718680c7'
        }),
      });

      if (response.ok) {
        alert('Preset saved successfully.');
        setPresetName('');
      }
    } catch (error) {
      alert('Failed to save a preset.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${styles.sidebar} ${side === 'right' ? styles.sidebarRight : ''}`}>
      <div className={styles.headerRow}>
        <h2>{side.toUpperCase()} View</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.iconButton}
            onClick={() => triggerScreenshot(side)}
            title="Capture Screenshot"
          >
            <Camera size={20} />
          </button>
          {side === 'left' && (
            <>
              <button 
                className={`${styles.iconButton} ${comparisonMode ? styles.active : ''}`}
                onClick={toggleComparison}
                title={comparisonMode ? "Disable Split View" : "Enable Split View"}
              >
                <Columns size={20} />
              </button>
              {comparisonMode && (
                <button 
                  className={`${styles.iconButton} ${syncCameras ? styles.active : ''}`}
                  onClick={toggleSyncCameras}
                  title={syncCameras ? "Unsync Cameras" : "Sync Cameras"}
                >
                  {syncCameras ? <Link size={20} /> : <Link2Off size={20} />}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {comparisonMode && side === 'left' && (
        <div className={styles.masterControls}>
          <label className={styles.masterLabel}>MASTER CONTROLS</label>
          <div className={styles.buttonGroup}>
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={toggleAllPause}>
              {bothPaused ? <Play size={16} /> : <Pause size={16} />}
              {bothPaused ? 'Resume Both' : 'Pause Both'}
            </button>
            <button className={styles.button} onClick={syncAll}>
              <RotateCcw size={16} /> Reset Both
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.section}>
        {/* Sigma */}
        <div className={styles.controlGroup}>
          <label>
            Sigma (&#963;) <span className={styles.value}>{params.sigma.toFixed(1)}</span>
          </label>
          <div className={styles.inputRow}>
            <input 
              type="range" min="0" max="50" step="0.1" 
              value={params.sigma} 
              onChange={(e) => setParams(side, { sigma: parseFloat(e.target.value) })}
            />
            {comparisonMode && (
              <button 
                className={styles.copyButton}
                onClick={() => copyParam(side, otherSide, 'sigma')}
                title={`Copy to ${otherSide}`}
              >
                <ArrowRightLeft size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Rho */}
        <div className={styles.controlGroup}>
          <label>
            Rho (&#961;) <span className={styles.value}>{params.rho.toFixed(1)}</span>
          </label>
          <div className={styles.inputRow}>
            <input 
              type="range" min="0" max="100" step="0.1" 
              value={params.rho} 
              onChange={(e) => setParams(side, { rho: parseFloat(e.target.value) })}
            />
            {comparisonMode && (
              <button 
                className={styles.copyButton}
                onClick={() => copyParam(side, otherSide, 'rho')}
                title={`Copy to ${otherSide}`}
              >
                <ArrowRightLeft size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Beta */}
        <div className={styles.controlGroup}>
          <label>
            Beta (&#946;) <span className={styles.value}>{params.beta.toFixed(2)}</span>
          </label>
          <div className={styles.inputRow}>
            <input 
              type="range" min="0" max="10" step="0.01" 
              value={params.beta} 
              onChange={(e) => setParams(side, { beta: parseFloat(e.target.value) })}
            />
            {comparisonMode && (
              <button 
                className={styles.copyButton}
                onClick={() => copyParam(side, otherSide, 'beta')}
                title={`Copy to ${otherSide}`}
              >
                <ArrowRightLeft size={14} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label>
            Simulation speed <span className={styles.value}>{speed.toFixed(1)}x</span>
          </label>
          <div className={styles.inputRow}>
            <input 
              type="range" min="0.1" max="5" step="0.1" 
              value={speed} 
              onChange={(e) => setSpeed(side, parseFloat(e.target.value))}
            />
            {comparisonMode && (
              <button 
                className={styles.copyButton}
                onClick={() => copySpeed(side, otherSide)}
                title={`Copy speed to ${otherSide}`}
              >
                <ArrowRightLeft size={14} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.button} ${isPaused ? styles.buttonPrimary : ''}`} 
            onClick={() => togglePause(side)}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className={styles.button} onClick={() => resetSimulation(side)}>
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
      </div>

      <div className={styles.section} style={{borderTop: '1px solid #333', marginTop: '20px', paddingTop: '20px'}}>
        <label style={{marginBottom: '10px', display: 'block', fontSize: '0.8rem', color: '#00ffcc'}}>SAVE PRESET</label>
        <input
          type="text"
          placeholder='Enter preset name...'
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
          {isSaving ? 'Saving...' : 'Save to Gallery'}
        </button>
      </div>

      <div className={styles.section} style={{marginTop: '20px'}}>
        <button 
          className={styles.button} 
          style={{width: '100%', background: '#1a1a1a', border: '1px solid #333'}}
          onClick={() => navigate('/library')}
        >
          Open Preset Library
        </button>
      </div>
    </div>
  );
};

export default Controls;
