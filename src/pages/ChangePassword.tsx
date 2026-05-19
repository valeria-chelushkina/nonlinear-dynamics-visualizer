import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import styles from "./Auth.module.css";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Change Password</h1>
        <p>Update your account password.</p>

        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="**********"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="**********"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="**********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className={styles.footer}>
          <button onClick={() => navigate(-1)} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
