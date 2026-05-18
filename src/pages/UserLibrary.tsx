import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import { SYSTEM_REGISTRY } from "@/core/systems";
import styles from "./Library.module.css";
import { User, Calendar, Book } from "lucide-react";

const PRESETS_PER_PAGE = 18;

interface Preset {
  id: number;
  name: string;
  systemType: string;
  parameters: any;
  cameraConfig: any;
  visuals?: any;
  isPublic: boolean;
  createdAt: string;
  user: {
    username: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  createdAt: string;
}

const UserLibrary: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering, Sorting & Pagination state
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(PRESETS_PER_PAGE);

  const { loadPreset } = useSimulationStore();
  const { setVisuals } = useVisualsStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [targetSide, setTargetSide] = useState<Side>("left");

  const systemTypes = useMemo(() => Object.keys(SYSTEM_REGISTRY), []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, presetsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/users/${userId}`),
          fetch(`http://localhost:3000/api/users/${userId}/presets`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        if (profileRes.ok) setProfile(await profileRes.json());
        if (presetsRes.ok) setPresets(await presetsRes.json());
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

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

  const toggleSystemFilter = (type: string) => {
    setSelectedSystems(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
    setVisibleCount(PRESETS_PER_PAGE);
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

  if (isLoading)
    return (
      <div className={styles.page}>
        <div className={styles.header}>Loading...</div>
      </div>
    );
  if (!profile)
    return (
      <div className={styles.page}>
        <div className={styles.header}>User not found.</div>
      </div>
    );

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <div className={styles.header} style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "10px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#eb6bff",
                padding: "15px",
                borderRadius: "50%",
                color: "black",
              }}
            >
              <User size={40} />
            </div>
            <div style={{ textAlign: "left" }}>
              <h1 style={{ margin: 0, fontSize: "32px" }}>
                {profile.username}'s Collection
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  color: "#666",
                  marginTop: "5px",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <Calendar size={14} /> Joined{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <Book size={14} /> {presets.length} presets
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "30px",
            justifyContent: "center",
          }}
        >
          <button
            className={`${styles.sideButton} ${targetSide === "left" ? styles.active : ""}`}
            onClick={() => setTargetSide("left")}
          >
            Load into LEFT
          </button>
          <button
            className={`${styles.sideButton} ${targetSide === "right" ? styles.active : ""}`}
            onClick={() => setTargetSide("right")}
          >
            Load into RIGHT
          </button>
        </div>

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

        {processedPresets.length === 0 ? (
          <div className={styles.loginMessage}>
            No presets found for selected filters.
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {visiblePresets.map((preset) => (
                <div key={preset.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{preset.name}</h3>
                    <span className={styles.systemTag}>{preset.systemType}</span>
                  </div>

                  <div className={styles.paramsPreview}>
                    {Object.entries(preset.parameters)
                      .slice(0, 3)
                      .map(([k, v]) => (
                        <div key={k} className={styles.paramItem}>
                          <span className={styles.paramKey}>{k}:</span>
                          <span className={styles.paramVal}>
                            {(v as number).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    {Object.keys(preset.parameters).length > 3 && (
                      <span>...</span>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.presetMeta}>
                      {!preset.isPublic && (
                        <span className={styles.privateBadge}>Private</span>
                      )}
                      <span>
                        {new Date(preset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleLoad(preset)}
                      className={styles.loadButton}
                    >
                      Load Preset
                    </button>
                  </div>
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

export default UserLibrary;
