import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

const API_URL = "https://ds-backend-iota.vercel.app/predict";

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

export default function App() {
  const [weeklySelfStudyHours, setWeeklySelfStudyHours] = useState("");
  const [attendancePercentage, setAttendancePercentage] = useState("");
  const [classParticipation, setClassParticipation] = useState("");

  const [result, setResult] = useState(null); // RAW output from API
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const rawScore = result === null ? null : Number(result);
  const clampedScore = rawScore === null ? null : clamp(rawScore, 0, 100);

  const outOfRange = rawScore !== null && (rawScore < 0 || rawScore > 100);

  const chartData = useMemo(() => {
    if (clampedScore === null) return [];
    return [
      { name: "Predicted (0–100)", value: Number(clampedScore.toFixed(2)) },
      { name: "Remaining", value: Number((100 - clampedScore).toFixed(2)) },
    ];
  }, [clampedScore]);

  async function handlePredict(e) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekly_self_study_hours: Number(weeklySelfStudyHours),
          attendance_percentage: Number(attendancePercentage),
          class_participation: Number(classParticipation),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error (${res.status}): ${text}`);
      }

      const data = await res.json();
      setResult(data.predicted_total_score);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "44px 16px",
      background:
        "radial-gradient(1000px 500px at 20% 0%, #eef2ff 0%, transparent 60%), radial-gradient(900px 450px at 80% 10%, #ecfeff 0%, transparent 55%), #ffffff",
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      color: "#0f172a",
    },
    container: { maxWidth: 920, margin: "0 auto", display: "grid", gap: 16 },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    title: { margin: 0, fontSize: 34, letterSpacing: -0.5 },
    subtitle: { margin: "8px 0 0", color: "#475569", lineHeight: 1.5 },
    card: {
      background: "rgba(255,255,255,0.92)",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      padding: 16,
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1.1fr 0.9fr",
      gap: 16,
      alignItems: "start",
    },
    row3: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 12,
    },
    label: { display: "grid", gap: 8, fontWeight: 700 },
    hint: { fontSize: 12, color: "#64748b", fontWeight: 600 },
    input: {
      width: "100%",
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid #cbd5e1",
      outline: "none",
      fontSize: 15,
      background: "#ffffff",
    },
    button: {
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid #0f172a",
      background: "#0f172a",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
      fontSize: 15,
    },
    error: {
      marginTop: 12,
      border: "1px solid #fecaca",
      background: "#fff1f2",
      color: "#9f1239",
      borderRadius: 12,
      padding: 12,
      lineHeight: 1.4,
    },
    warn: {
      marginTop: 12,
      border: "1px solid #fed7aa",
      background: "#fff7ed",
      color: "#9a3412",
      borderRadius: 12,
      padding: 12,
      lineHeight: 1.4,
    },
    scoreBig: { fontSize: 44, fontWeight: 900, letterSpacing: -1 },
    small: { color: "#64748b", fontSize: 13, lineHeight: 1.5 },
    pill: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid #e2e8f0",
      background: "#ffffff",
      fontWeight: 800,
      fontSize: 13,
      color: "#334155",
    },
    meterWrap: {
      height: 12,
      borderRadius: 999,
      background: "#e2e8f0",
      overflow: "hidden",
      marginTop: 10,
    },
    meterFill: (pct) => ({
      height: "100%",
      width: `${pct}%`,
      borderRadius: 999,
      background: "linear-gradient(90deg, #22c55e, #06b6d4, #6366f1)",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Student Score Predictor</h1>
            <p style={styles.subtitle}>
              Linear Regression can output values outside 0–100. We show the raw
              result and also a clamped 0–100 view for the chart.
            </p>
          </div>
          <div style={{ ...styles.card, padding: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 14 }}>Model</div>
            <div style={{ color: "#475569", marginTop: 6, fontSize: 13 }}>
              LinearRegression (unbounded)
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 20,
          }}
        >
          {/* Inputs */}
          <div style={styles.card}>
            <form onSubmit={handlePredict} style={{ display: "grid", gap: 14 }}>
              <div style={styles.row3}>
                <label style={styles.label}>
                  Weekly Self-Study Hours
                  <span style={styles.hint}>0–40</span>
                  <input
                    value={weeklySelfStudyHours}
                    onChange={(e) => setWeeklySelfStudyHours(e.target.value)}
                    type="number"
                    min="0"
                    max="40"
                    step="0.1"
                    required
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </label>

                <label style={styles.label}>
                  Attendance Percentage
                  <span style={styles.hint}>0–100</span>
                  <input
                    value={attendancePercentage}
                    onChange={(e) => setAttendancePercentage(e.target.value)}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                   style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </label>

                <label style={styles.label}>
                  Class Participation
                  <span style={styles.hint}>0–10</span>
                  <input
                    value={classParticipation}
                    onChange={(e) => setClassParticipation(e.target.value)}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </label>
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Predicting..." : "Predict Score"}
              </button>

              {err && (
                <div style={styles.error}>
                  <strong>Error:</strong> {err}
                </div>
              )}
            </form>
          </div>

          {/* Output */}
          <div style={styles.card}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900 }}>Prediction</div>
                {rawScore !== null && (
                  <span style={styles.pill}>Displayed range: 0–100</span>
                )}
              </div>

              <div style={styles.small}>
                Raw model output (can be &gt; 100):
              </div>

              <div style={styles.scoreBig}>
                {rawScore === null ? "—" : rawScore.toFixed(2)}
              </div>

              {rawScore !== null && (
                <>
                  <div style={styles.small}>
                    Clamped for UI (0–100):{" "}
                    <strong>{clampedScore.toFixed(2)}</strong>
                  </div>

                  <div style={styles.meterWrap}>
                    <div style={styles.meterFill(clampedScore)} />
                  </div>
                </>
              )}

              {outOfRange && (
                <div style={styles.warn}>
                  <strong>Out of range:</strong> This is normal for Linear
                  Regression. Clamp in the API if you want to guarantee 0–100.
                </div>
              )}

              <div style={{ marginTop: 10, height: 240 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  Score Chart (0–100 view)
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      <LabelList dataKey="value" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, color: "#475569", fontSize: 13 }}>
          <strong>Fix the root cause:</strong> Put clamping + input validation
          in FastAPI (recommended), or train with a bounded target transform if
          you want predictions naturally 0–100.
        </div>
      </div>
    </div>
  );
}
