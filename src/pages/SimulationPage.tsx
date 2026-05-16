import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SimulationCanvas from '@/components/canvas/SimulationCanvas';
import Controls from '@/components/ui/Controls';
import { SYSTEM_REGISTRY } from '@/core/systems';
import { useSimulationStore } from '@/store/useSimulationStore';
import styles from './SimulationPage.module.css';

const SimulationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const system = SYSTEM_REGISTRY[id || 'lorenz'];
  const { setSystemType, sims } = useSimulationStore();

  useEffect(() => {
    const currentId = id || 'lorenz';
    setSystemType('left', currentId);
    setSystemType('right', currentId);
  }, [id, setSystemType]);

  if (!system) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>System "{id}" not found.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
            <h1>{system.name}</h1>
        </header>
        {/* First part: visualizer and controls */}
        <div className={styles.simPart}>
          <div className={styles.simCard}>
            <div className={styles.canvasWrapper}>
              <SimulationCanvas side="left" />
            </div>
          </div>
          <div className={styles.controlsCard}>
            <Controls side="left" />
          </div>
        </div>

        {/* Second part: information and equations */}
        <div className={styles.infoPart}>
          <section className={styles.infoCard}>
            <h3>About the model</h3>
            <p>{system.description}</p>
          </section>

          <section className={styles.infoCard}>
            <h3>Differential Equations</h3>
            <div className={styles.equationsList}>
              {system.equations.map((eq, i) => (
                <div key={i} className={styles.equation}>
                  <code>{eq}</code>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.infoCard}>
            <h3>Historical significance</h3>
            <p>{system.history}</p>
          </section>

          <section className={styles.infoCard}>
            <h3>Real-World Applications</h3>
            <div className={styles.useList}>
              {system.use.map((use, i) => (
                <div key={i} className={styles.use}>
                  {use}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
