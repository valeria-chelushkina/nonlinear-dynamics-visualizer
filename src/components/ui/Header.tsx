import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/store/useSimulationStore';
import { BookOpen, LogOut, User as UserIcon, Activity, ChevronDown } from 'lucide-react';
import { SYSTEM_REGISTRY } from '@/core/systems';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useSimulationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const systems = Object.values(SYSTEM_REGISTRY);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>
            <Activity color="#00ffcc" size={24} />
            <span>Nonlinear Dynamics Visualizer</span>
          </Link>

          <div className={styles.divider} />

          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button 
              className={`${styles.dropdownButton} ${dropdownOpen ? styles.active : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>Strange attractors</span>
              <ChevronDown size={16} />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                {systems.map((system) => (
                  <button
                    key={system.id}
                    className={styles.dropdownItem}
                    onClick={() => {
                      navigate(`/sim/${system.id}`);
                      setDropdownOpen(false);
                    }}
                  >
                    {system.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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
