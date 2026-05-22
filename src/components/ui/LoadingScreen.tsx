import { Activity } from "lucide-react";
import styles from "./LoadingScreen.module.css";

const LoadingScreen = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.spinner}>
          <Activity size={48} className={styles.icon} />
        </div>
        <p className={styles.text}>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
