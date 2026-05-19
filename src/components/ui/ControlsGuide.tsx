import React, { useState } from "react";
import {
  MousePointer2,
  Move,
  Search,
  EqualApproximately,
  Columns,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./ControlsGuide.module.css";

const ControlsGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.guideContainer} ${isOpen ? styles.open : ""}`}>
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.toggleText}>
          <span>Controls Guide</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Camera Controls
          </h3>
          <div className={styles.instructionGrid}>
            <div className={styles.instructionItem}>
              <div className={styles.iconWrapper}>
                <MousePointer2 size={16} />
              </div>
              <div className={styles.textGroup}>
                <span className={styles.label}>Left click</span>
                <span className={styles.description}>Orbit & Rotate</span>
              </div>
            </div>

            <div className={styles.instructionItem}>
              <div className={styles.iconWrapper}>
                <Move size={16} />
              </div>
              <div className={styles.textGroup}>
                <span className={styles.label}>Right click (for 3D)</span>
                <span className={styles.description}>Pan & Drag</span>
              </div>
            </div>

            <div className={styles.instructionItem}>
              <div className={styles.iconWrapper}>
                <Search size={16} />
              </div>
              <div className={styles.textGroup}>
                <span className={styles.label}>Scroll</span>
                <span className={styles.description}>Zoom In / Out</span>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Advanced Modes
          </h3>

          <div className={styles.modeCard}>
            <div className={styles.modeHeader}>
              <EqualApproximately size={18} className={styles.icon} />
              <h4>Butterfly mode</h4>
            </div>
            <p>
              Generates two simultaneous simulations with a very small initial
              difference. Used to observe how small changes can have big
              consequences.
            </p>
          </div>

          <div className={styles.modeCard}>
            <div className={styles.modeHeader}>
              <Columns size={18} className={styles.icon} />
              <h4>Split view</h4>
            </div>
            <p>
              Enables side-by-side comparison. You can test two same systems
              with different parameters.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ControlsGuide;
