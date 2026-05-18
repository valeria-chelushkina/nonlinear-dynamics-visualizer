import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import { Clock, User, Trash2 } from "lucide-react";
import { SYSTEM_REGISTRY } from "@/core/systems";
import styles from "./Library.module.css";

const PRESETS_PER_PAGE = 18;

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { loadPreset, comparisonMode } = useSimulationStore();
  const { user, token } = useAuthStore();
  const { setVisuals } = useVisualsStore();
  
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetSide, setTargetSide] = useState<Side>("left");
  
  // Filtering state
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  // Sorting state
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(PRESETS_PER_PAGE);

  const systemTypes = useMemo(() => Object.keys(SYSTEM_REGISTRY), []);

  useEffect(() => {
    fetch("http://localhost:3000/api/presets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPresets(data);
        }
      })
      .catch((err) => console.error("Failed to fetch presets:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLoad = (preset: any) => {
    if (preset.visuals) {
      setVisuals(targetSide, preset.visuals);
    }

    loadPreset(
      targetSide,
      preset.systemType,
      preset.parameters,
      preset.cameraConfig,
      preset.visuals,
    );
    navigate(`/sim/${preset.systemType}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this preset?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/presets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPresets(presets.filter((p) => p.id !== id));
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to delete preset");
      }
    } catch (err) {
      console.error("Failed to delete preset:", err);
      alert("Failed to delete preset");
    }
  };

  const toggleSystemFilter = (type: string) => {
    setSelectedSystems(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
    setVisibleCount(PRESETS_PER_PAGE); // reset pagination on filter change
  };

  const processedPresets = useMemo(() => {
    // Filter
    let filtered = selectedSystems.length === 0 
      ? presets 
      : presets.filter(p => selectedSystems.includes(p.systemType));
    
    // Sort
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [presets, selectedSystems, sortOrder]);

  const visiblePresets = useMemo(() => {
    return processedPresets.slice(0, visibleCount);
  }, [processedPresets, visibleCount]);

  const hasMore = visibleCount < processedPresets.length;

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
              className={`${styles.sideButton} ${targetSide === "left" ? styles.active : ""}`}
              onClick={() => setTargetSide("left")}
            >
              Left view
            </button>
            <button
              className={`${styles.sideButton} ${targetSide === "right" ? styles.active : ""}`}
              onClick={() => setTargetSide("right")}
            >
              Right view
            </button>
          </div>
        )}
      </header>

      <div className={styles.controlsRow}>
        <div className={styles.filterBar} style={{ margin: 0, padding: 0 }}>
          {systemTypes.map(type => (
            <button
              key={type}
              className={`${styles.filterButton} ${selectedSystems.includes(type) ? styles.active : ""}`}
              onClick={() => toggleSystemFilter(type)}
            >
              {type.replace('-', ' ')}
            </button>
          ))}
          {selectedSystems.length > 0 && (
            <button 
              className={styles.filterButton} 
              onClick={() => setSelectedSystems([])}
              style={{ opacity: 0.6 }}
            >
              Clear All
            </button>
          )}
        </div>

        <div className={styles.sortControl}>
          <label>Sort By:</label>
          <select 
            className={styles.sortSelect}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <main className={styles.content}>
        {loading ? (
          <div className={styles.message}>Loading your collection...</div>
        ) : processedPresets.length === 0 ? (
          <div className={styles.message}>No presets found for selected filters.</div>
        ) : (
          <>
            <div className={styles.grid}>
              {visiblePresets.map((preset) => (
                <div
                  key={preset.id}
                  className={styles.card}
                  onClick={() => handleLoad(preset)}
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
                      <Link
                        to={`/user/${preset.userId}`}
                        className={styles.userLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {preset.user?.username || "Unknown"}
                      </Link>
                    </div>
                    <div className={styles.detailItem}>
                      <Clock size={14} />
                      <span>
                        {new Date(preset.createdAt).toLocaleDateString()}
                      </span>
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

            {hasMore && (
              <div className={styles.pagination}>
                <button 
                  className={styles.loadMoreButton}
                  onClick={() => setVisibleCount(prev => prev + PRESETS_PER_PAGE)}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Library;
