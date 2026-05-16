import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import { Clock, User, Trash2 } from 'lucide-react';
import styles from './Library.module.css';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { loadPreset, comparisonMode, user, token } = useSimulationStore();
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
    loadPreset(targetSide, preset.systemType, preset.parameters);
    navigate(`/sim/${preset.systemType}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Don't trigger handleSelect
    
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/presets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setPresets(presets.filter(p => p.id !== id));
      } else {
        const errData = await response.json();
        alert(errData.error || 'Failed to delete preset');
      }
    } catch (err) {
      console.error('Failed to delete preset:', err);
      alert('Failed to delete preset');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
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
                  <div className={styles.cardActions}>
                    <span className={styles.badge}>{preset.systemType}</span>
                    {user && user.id === preset.userId && (
                      <button 
                        className={styles.deleteButton}
                        onClick={(e) => handleDelete(e, preset.id)}
                        title="Delete preset"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <User size={14} />
                    <span>{preset.user?.username || 'Unknown'}</span>
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
