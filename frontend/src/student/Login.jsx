import { useState } from "react";
import { api } from "../api.js";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const studentData = await api.studentLogin(name, password);
      localStorage.setItem("mosque_student", JSON.stringify(studentData));
      onLogin(studentData);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: "16px" }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%",
        maxWidth: "400px",
        background: "var(--surface)",
        padding: "32px",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border-color)"
      }}>
        <h2 style={{ textAlign: "center", color: "var(--primary)", marginTop: 0, marginBottom: "24px", fontSize: "22px" }}>
          🔑 تسجيل الدخول إلى السوق
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>اسم الطالب</label>
          <input
            placeholder="أدخل اسمك المسجل"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>كلمة المرور</label>
          <input
            placeholder="أدخل كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
          دخول
        </button>

        {error && (
          <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px", borderRadius: "var(--radius-sm)", marginTop: "16px", textAlign: "center", fontSize: "14px" }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}