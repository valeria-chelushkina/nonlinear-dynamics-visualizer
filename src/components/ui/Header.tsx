import React from 'react';
import { Link } from 'react-router-dom';
import { useSimulationStore } from '@/store/useSimulationStore';
import { BookOpen, LogOut, User as UserIcon, Activity } from 'lucide-react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useSimulationStore();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Activity color="#00ffcc" size={24} />
          <span>Nonlinear Dynamics Visualizer</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/library" className={styles.navLink}>
            <BookOpen size={18} />
            <span>Library</span>
          </Link>

          <div className={styles.divider} />

          {user ? (
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <UserIcon size={18} />
                <span>{user.username}</span>
              </div>
              <button onClick={logout} className={styles.logoutButton}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginLink}>Login</Link>
              <Link to="/register" className={styles.registerButton}>Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
