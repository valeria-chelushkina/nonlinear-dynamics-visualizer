import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import { SYSTEM_REGISTRY, SYSTEM_LIST } from '@/core/systems';
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
  const user = useSimulationStore((state) => state.user);
  const token = useSimulationStore((state) => state.token);
  const { 
    setSystemType,
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

  const { systemType, params, isPaused, speed } = sim;
  const bothPaused = useSimulationStore(state => state.sims.left.isPaused && state.sims.right.isPaused);

  const [presetName, setPresetName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const otherSide = side === 'left' ? 'right' : 'left';
  const currentSystem = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY['lorenz'];

  const handleSave = async () => {
    if (!presetName) return alert("Enter a name for your preset.");

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({
          name: presetName,
          systemType: systemType,
          parameters: params,
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
          <button className={styles.iconButton} onClick={() => triggerScreenshot(side)} title="Capture screenshot"><Camera size={20} /></button>
          {side === 'left' && (
            <>
              <button className={`${styles.iconButton} ${comparisonMode ? styles.active : ''}`} onClick={toggleComparison} title="Toggle split view"><Columns size={20} /></button>
              {comparisonMode && <button className={`${styles.iconButton} ${syncCameras ? styles.active : ''}`} onClick={toggleSyncCameras} title="Sync cameras">{syncCameras ? <Link size={20} /> : <Link2Off size={20} />}</button>}
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
              {bothPaused ? 'Resume both' : 'Pause both'}
            </button>
            <button className={styles.button} onClick={syncAll}>
              <RotateCcw size={16} /> Reset both
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.section}>
        <div className={styles.controlGroup}>
          <label>SYSTEM TYPE</label>
          <select 
            className={styles.selectInput}
            value={systemType}
            onChange={(e) => setSystemType(side, e.target.value)}
          >
            {SYSTEM_LIST.map(sys => (
              <option key={sys.id} value={sys.id}>{sys.name}</option>
            ))}
          </select>
        </div>

        {/* Sliders from registry */}
        {currentSystem.sliders.map(slider => (
          <div key={slider.key} className={styles.controlGroup}>
            <label>
              {slider.label} <span className={styles.value}>{(params[slider.key] || 0).toFixed(slider.step < 0.1 ? 2 : 1)}</span>
            </label>
            <div className={styles.inputRow}>
              <input 
                type="range" min={slider.min} max={slider.max} step={slider.step} 
                value={params[slider.key] || 0} 
                onChange={(e) => setParams(side, { [slider.key]: parseFloat(e.target.value) })} 
              />
              {comparisonMode && (
                <button 
                  className={styles.copyButton} 
                  onClick={() => copyParam(side, otherSide, slider.key)} 
                  title="Copy to other side"
                >
                  <ArrowRightLeft size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        <div className={styles.controlGroup}>
          <label>Simulation speed <span className={styles.value}>{speed.toFixed(1)}x</span></label>
          <div className={styles.inputRow}>
            <input type="range" min="0.1" max="5" step="0.1" value={speed} onChange={(e) => setSpeed(side, parseFloat(e.target.value))} />
            {comparisonMode && <button className={styles.copyButton} onClick={() => copySpeed(side, otherSide)} title="Copy speed"><ArrowRightLeft size={14} /></button>}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={`${styles.button} ${isPaused ? styles.buttonPrimary : ''}`} onClick={() => togglePause(side)}>
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className={styles.button} onClick={() => resetSimulation(side)}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>

      <div className={styles.section} style={{borderTop: '1px solid #333', marginTop: '20px', paddingTop: '20px'}}>
        <label style={{marginBottom: '10px', display: 'block', fontSize: '0.8rem', color: '#00ffcc'}}>SAVE PRESET</label>
        <input
          type="text" placeholder='Enter preset name...' className={styles.textInput}
          value={presetName} onChange={(e) => setPresetName(e.target.value)}
        />
        {user ? (
<button className={styles.buttonPrimary} style={{width: '100%', marginTop: '10px'}} onClick={handleSave} disabled={isSaving}>
          Save to gallery
        </button>
        ) : (<p>Login to save</p>)}
        
      </div>

      <div className={styles.section} style={{marginTop: '20px'}}>
        <button 
          className={styles.button} style={{width: '100%', background: '#1a1a1a', border: '1px solid #333'}}
          onClick={() => navigate('/library')}
        >
          Open preset library
        </button>
      </div>
    </div>
  );
};

export default Controls;
