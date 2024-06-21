import { useState, FormEvent } from "react";
import axios from "axios";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const metrics = [
  "육체적 힘듦",
  "정신적 노력",
  "시간 투자",
  "기술적 복잡성",
  "사회적 도전",
  "재정적 부담",
  "위험도",
  "지속성 요구",
  "창의성 요구",
  "희소성",
];

interface Result {
  experience: string;
  level: string;
  total_difficulty: number;
  similarity: number;
  difficulty_scores: number[];
  error?: string;
}

function App() {
  const [experience, setExperience] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post<Result>(
        "http://localhost:5000/api/estimate",
        {
          experience,
        },
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "난이도 측정 중 오류가 발생했습니다." } as Result);
    }
    setLoading(false);
  };

  const chartData = result
    ? {
        labels: metrics,
        datasets: [
          {
            label: "난이도 점수",
            data: result.difficulty_scores,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="App">
      <h1>경험 난이도 측정기</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="경험을 입력하세요"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "측정 중..." : "난이도 측정"}
        </button>
      </form>
      {result && !result.error && (
        <div className="result">
          <h2>결과</h2>
          <p>경험: {result.experience}</p>
          <p>난이도 레벨: {result.level}</p>
          <p>총 난이도: {result.total_difficulty.toFixed(2)}</p>
          {result.similarity > 0 && (
            <p>
              유사한 경험과의 유사도: {(result.similarity * 100).toFixed(2)}%
            </p>
          )}
          <div className="chart-container">
            {chartData && <Radar data={chartData} options={chartOptions} />}
          </div>
          <h3>세부 난이도 점수:</h3>
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>점수</th>
              </tr>
            </thead>
            <tbody>
              {result.difficulty_scores.map((score, index) => (
                <tr key={index}>
                  <td>{metrics[index]}</td>
                  <td>{score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result && result.error && <p className="error">{result.error}</p>}
    </div>
  );
}

export default App;
