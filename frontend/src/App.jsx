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

function toNumberOrNaN(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export default function App() {
  const [weeklySelfStudyHours, setWeeklySelfStudyHours] = useState("");
  const [attendancePercentage, setAttendancePercentage] = useState("");
  const [classParticipation, setClassParticipation] = useState("");

  const [result, setResult] = useState(null); // raw model output
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputs = useMemo(() => {
    const w = toNumberOrNaN(weeklySelfStudyHours);
    const a = toNumberOrNaN(attendancePercentage);
    const c = toNumberOrNaN(classParticipation);

    return {
      weekly: w,
      attendance: a,
      participation: c,
      allValid:
        Number.isFinite(w) &&
        Number.isFinite(a) &&
        Number.isFinite(c) &&
        w >= 0 &&
        w <= 40 &&
        a >= 0 &&
        a <= 100 &&
        c >= 0 &&
        c <= 10,
    };
  }, [weeklySelfStudyHours, attendancePercentage, classParticipation]);

  const rawScore = result;
  const clampedScore =
    rawScore === null ? null : clamp(Number(rawScore), 0, 100);

  const outOfRange =
    rawScore !== null && (Number(rawScore) < 0 || Number(rawScore) > 100);

  const chartData = useMemo(() => {
    if (clampedScore === null) return [];
    return [
      { name: "Predicted", value: Number(clampedScore.toFixed(2)) },
      { name: "Remaining", value: Number((100 - clampedScore).toFixed(2)) },
    ];
  }, [clampedScore]);

  const scoreLabel = useMemo(() => {
    if (clampedScore === null) return null;
    if (clampedScore >= 85) return { text: "Excellent", emoji: "🏆" };
    if (clampedScore >= 70) return { text: "Good", emoji: "✅" };
    if (clampedScore >= 50) return { text: "Average", emoji: "📘" };
    return { text: "Needs work", emoji: "🧠" };
  }, [clampedScore]);

  async function handlePredict(e) {
    e.preventDefault();
    setErr(null);
    setResult(null);

    // Frontend guard (backend should also validate!)
    if (!inputs.allValid) {
      setErr(
        "Please enter valid ranges: hours 0–40, attendance 0–100, participation 0–10."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekly_self_study_hours: Number(inputs.weekly),
          attendance_percentage: Number(inputs.attendance),
          class_participation: Number(inputs.participation),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error (${res.status}): ${text}`);
      }

      const data = await res.json();
      setResult(data.predicted_total_score);
    } catch (e) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "48px 16px",
      background:
        "radial-gradient(1000px 500px at 20% 0%, #eef2ff 0%, transparent 60%), radial-gradient(900px 450px at 80% 10%, #ecfeff 0%, transparent 55%), #ffffff",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      color: "#0f172a",
    },
    container: {
      maxWidth: 920,
      margin: "0 auto",
      display: "grid",
      gap: 16,
    },
    header: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
    },
    title: { margin: 0, fontSize: 34, letterSpacing: -0.5 },
    subtitle: { margin: "8px 0 0", color: "#475569", lineHeight: 1.5 },
    card: {
      background: "rgba(255,255,255,0.9)",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      padding: 16,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 16,
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1.1fr 0.9fr",
      gap: 16,
      alignItems: "start",
    },
    label: { display: "grid", gap: 8, fontWeight: 600 },
    hint: { fontSize: 12, color: "#64748b", fontWeight: 500 },
    input: {
      width: "100%",
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid #cbd5e1",
      outline: "none",
      fontSize: 15,
      background: "#ffffff",
    },
    row3: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 12,
    },
    button: {
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid #0f172a",
      background: "#0f172a",
      color: "white",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: 15,
    },
    buttonDisabled: {
      opacity: 0.65,
      cursor: "not-allowed",
    },
    error: {
      border: "1px solid #fecaca",
      background: "#fff1f2",
      color: "#9f1239",
      borderRadius: 12,
      padding: 12,
      lineHeight: 1.4,
    },
    warn: {
      border: "1px solid #fed7aa",
      background: "#fff7ed",
      color: "#9a3412",
      borderRadius: 12,
      padding: 12,
      lineHeight: 1.4,
    },
    scoreBox: {
      display: "grid",
      gap: 10,
      padding: 16,
      borderRadius: 16,
      border: "1px solid #e2e8f0",
      background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    },
    scoreTop: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 10,
    },
    scoreBig: { fontSize: 44, fontWeight: 800, letterSpacing: -1 },
    badge: {
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid #e2e8f0",
      background: "#ffffff",
      fontWeight: 700,
      color: "#334155",
      fontSize: 13,
    },
    meterWrap: {
      height: 12,
      borderRadius: 999,
      background: "#e2e8f0",
      overflow: "hidden",
    },
    meterFill: (pct) => ({
      height: "100%",
      width: `${pct}%`,
      borderRadius: 999,
      background: "linear-gradient(90deg, #22c55e, #06b6d4, #6366f1)",
    }),
    small: { color: "#64748b", fontSize: 13, lineHeight: 1.5 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Student Score Predictor</h1>
            <p style={styles.subtitle}>
              Enter study hours, attendance, and participation to predict a total
              score. (UI displays 0–100)
            </p>
          </div>
          <div style={{ ...styles.card, padding: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Model</div>
            <div style={{ color: "#475569", marginTop: 6, fontSize: 13 }}>
              Linear Regression (unbounded)
            </div>
          </div>
        </div>

        <div style={styles.twoCol}>
          {/* Left: Inputs */}
          <div style={styles.card}>
            <form onSubmit={handlePredict} style={{ display: "grid", gap: 14 }}>
              <div style={styles.row3}>
                <label style={styles.label}>
                  Weekly Self-Study Hours
                  <span style={styles.hint}>0–40 hours</span>
                  <input
                    value={weeklySelfStudyHours}
                    onChange={(e) => setWeeklySelfStudyHours(e.target.value)}
                    type="number"
                    min="0"
                    max="40"
                    step="0.1"
                    required
                    style={styles.input}
                    placeholder="e.g. 12.5"
                  />
                </label>

                <label style={styles.label}>
                  Attendance %
                  <span style={styles.hint}>0–100%</span>
                  <input
                    value={attendancePercentage}
                    onChange={(e) => setAttendancePercentage(e.target.value)}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    style={styles.input}
                    placeholder="e.g. 92"
                  />
                </label>

                <label style={styles.label}>
                  Participation
                  <span style={styles.hint}>0–10</span>
                  <input
                    value={classParticipation}
                    onChange={(e) => setClassParticipation(e.target.value)}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                    style={styles.input}
                    placeholder="e.g. 7"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : null),
                }}
              >
                {loading ? "Predicting..." : "Predict Score"}
              </button>

              {!inputs.allValid && (
                <div style={styles.warn}>
                  Inputs must be within: hours 0–40, attendance 0–100,
                  participation 0–10.
                </div>
              )}

              {err && (
                <div style={styles.error}>
                  <strong>Error:</strong> {err}
                </div>
              )}
            </form>
          </div>

          {/* Right: Output */}
          <div style={styles.card}>
            <div style={styles.scoreBox}>
              <div style={styles.scoreTop}>
                <div>
                  <div style={{ fontWeight: 800, color: "#334155" }}>
                    Predicted Total Score
                  </div>
                  <div style={styles.small}>Displayed on a 0–100 scale</div>
                </div>

                {clampedScore !== null && scoreLabel && (
                  <div style={styles.badge}>
                    {scoreLabel.emoji} {scoreLabel.text}
                  </div>
                )}
              </div>

              <div style={styles.scoreBig}>
                {clampedScore === null ? "—" : clampedScore.toFixed(2)}
              </div>

              <div style={styles.meterWrap}>
                <div
                  style={styles.meterFill(
                    clampedScore === null ? 0 : clamp(clampedScore, 0, 100)
                  )}
                />
              </div>

              {rawScore !== null && (
                <div style={styles.small}>
                  Raw model output: <strong>{Number(rawScore).toFixed(2)}</strong>
                  {outOfRange ? (
                    <>
                      {" "}
                      — out of range, so UI clamps it to 0–100.
                    </>
                  ) : null}
                </div>
              )}

              {outOfRange && (
                <div style={styles.warn}>
                  <strong>Why this happens:</strong> Linear Regression isn’t
                  bounded, so it can predict values above 100 or below 0.
                  Consider clamping in the API or training with a bounded target
                  transform.
                </div>
              )}
            </div>

            {/* Chart */}
            <div style={{ marginTop: 16, height: 260 }}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>
                Score Breakdown
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {clampedScore === null && (
                <div style={{ marginTop: 10, ...styles.small }}>
                  Make a prediction to see the chart.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, ...styles.small }}>
          <strong>Tip (recommended):</strong> Add server-side validation and
          clamping in your FastAPI endpoint so your UI and API always agree on
          the 0–100 range.
        </div>
      </div>
    </div>
  );
}
