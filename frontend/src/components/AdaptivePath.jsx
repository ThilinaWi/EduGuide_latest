import React, { useState } from 'react';
import {
    Shuffle,
    ArrowRight,
    Target,
    TrendingUp,
    CheckCircle,
    Lightbulb,
    BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const AdaptivePath = () => {
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchId.trim()) {
            navigate(`/students/${searchId.trim().toUpperCase()}`);
        }
    };

    const suggestedPaths = [
        {
            title: "Science & Technology Acceleration",
            description: "Intensive focus on Mathematics and Science for students aiming for Engineering streams.",
            tags: ["Science", "STEM", "Advanced"],
            progress: 75,
            color: "blue"
        },
        {
            title: "Language & Communications Mastery",
            description: "Pathway designed for excellence in English and Sinhala, suitable for Arts and Management streams.",
            tags: ["Linguistics", "Arts", "Communications"],
            progress: 40,
            color: "emerald"
        },
        {
            title: "Balanced Academic Improvement",
            description: "A generalized path focusing on bridging gaps across all core O/L subjects.",
            tags: ["Balanced", "Foundation", "Core"],
            progress: 90,
            color: "purple"
        }
    ];

    return (
        <Layout
            title="Adaptive Path"
            searchId={searchId}
            setSearchId={setSearchId}
            handleSearch={handleSearch}
        >
            <div className="max-w-6xl mx-auto animate-fadeIn">
                {/* Hero Section */}
                <div className="relative p-10 mb-8 overflow-hidden bg-white shadow-sm card border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="max-w-xl">
                            <h1 className="mb-4 text-3xl font-bold text-slate-800">AI-Driven Adaptive Learning Paths</h1>
                            <p className="mb-6 leading-relaxed text-slate-500">
                                Our adaptive engine creates personalized learning journeys by analyzing individual performance gaps, learning styles, and future career goals.
                            </p>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600">
                                    <Target size={14} />
                                    Performance Based
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 rounded-full bg-blue-50">
                                    <Shuffle size={14} />
                                    Dynamic Realignment
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="flex items-center justify-center w-48 h-48 p-8 rounded-full bg-emerald-50 text-emerald-500 animate-pulse">
                                <Shuffle size={80} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                    {suggestedPaths.map((path, idx) => (
                        <div key={idx} className="p-8 transition-all bg-white shadow-sm cursor-pointer card border-slate-100 hover:border-emerald-200 group">
                            <div className={`w-12 h-12 bg-${path.color}-50 text-${path.color}-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="mb-3 text-lg font-bold text-slate-800">{path.title}</h3>
                            <p className="mb-6 text-sm leading-relaxed text-slate-500">
                                {path.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {path.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-wider">{tag}</span>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                    <span>Path Readiness</span>
                                    <span>{path.progress}%</span>
                                </div>
                                <div className="w-full h-1 overflow-hidden rounded-full bg-slate-100">
                                    <div className={`bg-${path.color}-500 h-full rounded-full`} style={{ width: `${path.progress}%` }}></div>
                                </div>
                                <button className="flex items-center justify-center w-full gap-2 py-3 text-xs font-bold transition-all rounded-full bg-slate-50 text-slate-600 hover:bg-emerald-500 hover:text-white">
                                    Explore Path
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insights Section */}
                <div className="relative p-10 overflow-hidden text-white card bg-slate-900">
                    <div className="absolute top-0 right-0 w-64 h-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold">
                            <Lightbulb className="text-yellow-400" />
                            AI Strategy Highlights
                        </h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="p-6 space-y-4 border bg-white/5 rounded-3xl border-white/10">
                                <h4 className="flex items-center gap-2 font-bold text-emerald-400">
                                    <CheckCircle size={18} />
                                    Automated Skill Gap Closure
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Our engine identifies critical failures early and automatically shifts teaching resources to bridge those gaps before exams.
                                </p>
                            </div>
                            <div className="p-6 space-y-4 border bg-white/5 rounded-3xl border-white/10">
                                <h4 className="flex items-center gap-2 font-bold text-blue-400">
                                    <BookOpen size={18} />
                                    Resource Optimization
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    By prioritizing high-impact lessons first, we increase the efficiency of study hours by up to 40% based on historical data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdaptivePath;
