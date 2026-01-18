import { useState } from "react";

export default function App() {
  const [weeklySelfStudyHours, setWeeklySelfStudyHours] = useState("");
  const [attendancePercentage, setAttendancePercentage] = useState("");
  const [classParticipation, setClassParticipation] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handlePredict(e) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/predict", {
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

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Student Score Predictor</h1>
      <p>Enter the student factors and get a predicted total score (0–100).</p>

      <form onSubmit={handlePredict} style={{ display: "grid", gap: 12 }}>
        <label>
          Weekly Self-Study Hours (0–40)
          <input
            value={weeklySelfStudyHours}
            onChange={(e) => setWeeklySelfStudyHours(e.target.value)}
            type="number"
            min="0"
            max="40"
            step="0.1"
            required
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <label>
          Attendance Percentage (0–100)
          <input
            value={attendancePercentage}
            onChange={(e) => setAttendancePercentage(e.target.value)}
            type="number"
            min="0"
            max="100"
            step="0.1"
            required
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <label>
          Class Participation (0–10)
          <input
            value={classParticipation}
            onChange={(e) => setClassParticipation(e.target.value)}
            type="number"
            min="0"
            max="10"
            step="0.1"
            required
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, cursor: "pointer" }}
        >
          {loading ? "Predicting..." : "Predict Score"}
        </button>
      </form>

      {err && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      {result !== null && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
          <h2>Predicted Total Score</h2>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {result.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
