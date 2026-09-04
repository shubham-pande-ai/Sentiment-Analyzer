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
      <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md z-10 relative">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Welcome Back
            </h1>
            <p className="text-slate-400 font-medium mt-2">Sign in to Sentiment Analyzer</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-slate-200 placeholder-slate-500 transition-all duration-300"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-slate-200 placeholder-slate-500 transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>
            
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{loginError}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-indigo-500/30">
      {/* Decorative background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Sentiment Analyzer
            </h1>
            <p className="text-slate-400 font-medium mt-1">AI-Powered Conversation Insights</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
            <label className="flex-1 sm:flex-none cursor-pointer group relative">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full transition-all duration-300">
                <UploadCloud className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-300">
                  {file ? file.name : "Choose File"}
                </span>
              </div>
            </label>
            
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {result && (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* KPI Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard title="CSAT Estimate" value={`${result.csat_estimate}/10`} color="indigo" />
              <KPICard title="Empathy Score" value={`${result.empathy_score}/10`} color="purple" />
              <KPICard title="Resolution" value={result.resolution_status} color="emerald" />
              <KPICard title="Churn Risk" value={result.churn_risk} color="rose" />
            </div>

            {/* Left Column - Summary & Actions */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 p-8 rounded-3xl shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">📝</span>
                  Conversation Summary
                </h2>
                <p className="text-slate-300 leading-relaxed text-lg">{result.summary}</p>
              </div>
              
              <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 p-8 rounded-3xl shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">⚡</span>
                  Action Items
                </h2>
                {result.action_items.length > 0 ? (
                  <ul className="space-y-4">
                    {result.action_items.map((item, i) => (
                      <li key={i} className="flex gap-4 items-start p-4 bg-slate-700/30 rounded-2xl border border-slate-600/50 hover:border-indigo-500/30 transition-colors">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-200 text-lg">{item.task}</p>
                          <p className="text-sm text-indigo-300 font-medium mt-1">Assignee: {item.assignee}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                    <p className="italic">No actionable items detected in this conversation.</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 p-8 rounded-3xl shadow-xl">
                 <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">💬</span>
                  Sentence Breakdown
                </h2>
                 <div className="max-h-[500px] overflow-y-auto space-y-3 pr-4 custom-scrollbar">
                    {result.sentence_breakdown.map((s, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-700/30 hover:bg-slate-800/80 transition-colors">
                            <span 
                                className="font-bold w-20 flex-shrink-0 text-sm tracking-wide uppercase mt-0.5"
                                style={{ color: sentimentColors[s.sentiment] || sentimentColors.Neutral }}
                            >
                                {s.sentiment}
                            </span>
                            <span className="text-slate-300">{s.sentence}</span>
                        </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Right Column - Charts & Emotion */}
            <div className="space-y-8">
              <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 p-8 rounded-3xl shadow-xl flex flex-col items-center">
                <h2 className="text-xl font-bold text-white mb-6 w-full text-left">Overall Sentiment</h2>
                <div className="h-64 w-full">
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
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={sentimentColors.Positive} />
                        <Cell fill={sentimentColors.Neutral} />
                        <Cell fill={sentimentColors.Negative} />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <h2 className="text-lg font-medium text-indigo-100 mb-2 uppercase tracking-wider">Dominant Emotion</h2>
                <p className="text-5xl font-extrabold capitalize tracking-tight">{result.dominant_emotion}</p>
                <p className="mt-4 text-indigo-100/80 text-sm font-medium">Derived from the overall tone and lexical analysis of the transcript.</p>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, color }: { title: string; value: string | number; color: 'indigo' | 'purple' | 'emerald' | 'rose' }) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400',
  };

  return (
    <div className={`bg-gradient-to-b ${colorMap[color].split(' ').slice(0, 2).join(' ')} backdrop-blur-md border ${colorMap[color].split(' ')[2]} p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-4xl font-extrabold text-white">{value}</p>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-50 bg-current ${colorMap[color].split(' ')[3]} group-hover:scale-150 transition-transform duration-500`}></div>
    </div>
  );
}
