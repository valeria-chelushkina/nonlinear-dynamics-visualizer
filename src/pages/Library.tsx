import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import { ArrowLeft, Clock, User } from 'lucide-react';
import styles from './Library.module.css';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { loadPreset, comparisonMode } = useSimulationStore();
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetSide, setTargetSide] = useState<Side>('left');

  useEffect(() => {
    fetch('http://localhost:3000/api/presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPresets(data);
        }
      })
      .catch((err) => console.error('Failed to fetch presets:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (preset: any) => {
    loadPreset(targetSide, preset.parameters);
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to simulation
        </button>
        <div className={styles.titleGroup}>
          <h1>Preset library</h1>
        </div>
        
        {comparisonMode && (
          <div className={styles.sideSelector}>
            <span>Load into:</span>
            <button 
              className={`${styles.sideButton} ${targetSide === 'left' ? styles.active : ''}`}
              onClick={() => setTargetSide('left')}
            >
              Left view
            </button>
            <button 
              className={`${styles.sideButton} ${targetSide === 'right' ? styles.active : ''}`}
              onClick={() => setTargetSide('right')}
            >
              Right view
            </button>
          </div>
        )}
      </header>

      <main className={styles.content}>
        {loading ? (
          <div className={styles.message}>Loading your collection...</div>
        ) : presets.length === 0 ? (
          <div className={styles.message}>
            No presets found.
          </div>
        ) : (
          <div className={styles.grid}>
            {presets.map((preset) => (
              <div 
                key={preset.id} 
                className={styles.card}
                onClick={() => handleSelect(preset)}
              >
                <div className={styles.cardHeader}>
                  <h3>{preset.name}</h3>
                  <span className={styles.badge}>{preset.systemType}</span>
                </div>
                
                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <User size={14} />
                    <span>TestUser</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Clock size={14} />
                    <span>{new Date(preset.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.paramsPreview}>
                  {Object.entries(preset.parameters).map(([key, val]: any) => (
                    <div key={key} className={styles.paramTag}>
                      {key}: {val.toFixed(1)}
                    </div>
                  ))}
                </div>

                <button className={styles.loadButton}>
                  Load into {targetSide.toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Library;
