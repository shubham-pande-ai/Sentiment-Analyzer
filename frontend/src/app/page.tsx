"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type ActionItem = {
  task: string;
  assignee: string;
};

type SentenceSentiment = {
  sentence: string;
  sentiment: string;
};

type AnalysisResult = {
  overall_sentiment: string;
  dominant_emotion: string;
  summary: string;
  csat_estimate: number;
  empathy_score: number;
  resolution_status: string;
  churn_risk: string;
  action_items: ActionItem[];
  sentence_breakdown: SentenceSentiment[];
};

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Basic Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "admin" && password.trim() === "password") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Hint: admin / password");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to analyze");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const sentimentColors: Record<string, string> = {
    Positive: "#22c55e",
    Neutral: "#94a3b8",
    Negative: "#ef4444",
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to Sentiment Analyzer</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 bg-white"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 bg-white"
                placeholder="password"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sentiment Analyzer</h1>
            <p className="text-gray-500">AI-Powered Conversation Insights</p>
          </div>
          <div className="flex gap-4">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
              Analyze
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI Cards */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <KPICard title="CSAT Estimate" value={`${result.csat_estimate}/10`} />
              <KPICard title="Empathy Score" value={`${result.empathy_score}/10`} />
              <KPICard title="Resolution" value={result.resolution_status} />
              <KPICard title="Churn Risk" value={result.churn_risk} />
            </div>

            {/* Left Column - Summary & Actions */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Conversation Summary</h2>
                <p className="text-gray-700 leading-relaxed">{result.summary}</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Action Items</h2>
                {result.action_items.length > 0 ? (
                  <ul className="space-y-3">
                    {result.action_items.map((item, i) => (
                      <li key={i} className="flex gap-3 items-start p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{item.task}</p>
                          <p className="text-sm text-gray-500">Assignee: {item.assignee}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No action items detected.</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                 <h2 className="text-xl font-semibold mb-4">Sentence Breakdown</h2>
                 <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                    {result.sentence_breakdown.map((s, i) => (
                        <div key={i} className="flex gap-3 text-sm border-b pb-2">
                            <span 
                                className={`font-semibold w-20 flex-shrink-0`}
                                style={{ color: sentimentColors[s.sentiment] || sentimentColors.Neutral }}
                            >
                                {s.sentiment}
                            </span>
                            <span className="text-gray-700">{s.sentence}</span>
                        </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Right Column - Charts & Emotion */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4 w-full text-left">Overall Sentiment</h2>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Positive', value: result.sentence_breakdown.filter(s => s.sentiment === 'Positive').length },
                          { name: 'Neutral', value: result.sentence_breakdown.filter(s => s.sentiment === 'Neutral').length },
                          { name: 'Negative', value: result.sentence_breakdown.filter(s => s.sentiment === 'Negative').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill={sentimentColors.Positive} />
                        <Cell fill={sentimentColors.Neutral} />
                        <Cell fill={sentimentColors.Negative} />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-sm text-white">
                <h2 className="text-xl font-semibold mb-2">Dominant Emotion</h2>
                <p className="text-4xl font-bold capitalize">{result.dominant_emotion}</p>
                <p className="mt-2 text-indigo-100 text-sm">Derived from the overall tone of the conversation.</p>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
