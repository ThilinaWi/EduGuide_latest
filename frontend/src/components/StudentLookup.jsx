import React, { useState, useEffect } from 'react';
import { Search, User, Brain, Clock, Users, BookOpen, Target, ChevronRight, AlertCircle, Loader2, GraduationCap, TrendingUp, Calendar, Award, ArrowLeft, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Layout from './Layout';

const StudentLookup = () => {
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAll, setLoadingAll] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAllStudents = async () => {
        try {
            const response = await client.get('/api/adaptive/students/mongodb/all/list');
            setAllStudents(response.data.students || []);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setError('Failed to load students from MongoDB');
        } finally {
            setLoadingAll(false);
        }
    };

    // Load all students from MongoDB on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchAllStudents();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const handleViewStudent = async (studentId) => {
        setLoading(true);
        setError('');
        try {
            const response = await client.get(`/api/adaptive/students/mongodb/${studentId}`);
            setSelectedStudent(response.data);
        } catch (err) {
            console.error('Error fetching student:', err);
            setError(err.response?.data?.detail || 'Student not found in MongoDB');
            setSelectedStudent(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchStudent = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            handleViewStudent(searchQuery.trim().toUpperCase());
        }
    };

    const handleSearchNav = (e) => {
        if (e) e.preventDefault();
        if (searchId.trim()) {
            navigate(`/students/${searchId.trim().toUpperCase()}`);
        }
    };

    // Filter students for search
    const filteredStudents = allStudents.filter(s => 
        s.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getScoreColor = (score) => {
        if (score >= 75) return 'text-emerald-600 bg-emerald-50';
        if (score >= 50) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <Layout
            title="Student Records"
            searchId={searchId}
            setSearchId={setSearchId}
            handleSearch={handleSearchNav}
        >
            <div className="animate-fadeIn max-w-6xl mx-auto">
                {/* If a student is selected, show their profile */}
                {selectedStudent ? (
                    <div className="space-y-6">
                        {/* Back Button */}
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back to Student List
                        </button>

                        {/* Student Info Header */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="text-white">
                                        <h2 className="text-3xl font-bold">{selectedStudent.name || selectedStudent.student_id}</h2>
                                        <p className="text-white/70 text-sm mt-1">ID: {selectedStudent.student_id}</p>
                                        <div className="flex gap-4 mt-3">
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                                                Grade {selectedStudent.current_grade}
                                            </span>
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                                                {selectedStudent.interested_stream} Stream
                                            </span>
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                                                Age {selectedStudent.age}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="p-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Brain className="w-5 h-5 text-violet-600" />
                                            <span className="text-xs font-bold text-violet-600 uppercase">IQ Level</span>
                                        </div>
                                        <p className="text-3xl font-black text-violet-800">{selectedStudent.current_performance?.iq_level || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            <span className="text-xs font-bold text-blue-600 uppercase">Study Hours</span>
                                        </div>
                                        <p className="text-3xl font-black text-blue-800">{selectedStudent.current_performance?.study_hours || 'N/A'} <span className="text-sm font-medium text-blue-500">hrs/wk</span></p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-5 h-5 text-emerald-600" />
                                            <span className="text-xs font-bold text-emerald-600 uppercase">Attendance</span>
                                        </div>
                                        <p className="text-3xl font-black text-emerald-800">{selectedStudent.current_performance?.attendance_rate || 'N/A'}%</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-amber-600" />
                                            <span className="text-xs font-bold text-amber-600 uppercase">Overall Avg</span>
                                        </div>
                                        <p className="text-3xl font-black text-amber-800">{selectedStudent.current_performance?.overall_avg?.toFixed(1) || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weaknesses */}
                        {selectedStudent.weaknesses && selectedStudent.weaknesses.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5">
                                    <div className="flex items-center gap-3 text-white">
                                        <AlertCircle className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">Weak Subjects</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-3">
                                        {selectedStudent.weaknesses.map((w, i) => (
                                            <span key={i} className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weekly Schedule */}
                        {selectedStudent.weekly_schedule && selectedStudent.weekly_schedule.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-5">
                                    <div className="flex items-center gap-3 text-white">
                                        <Calendar className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">Weekly Schedule</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedStudent.weekly_schedule.map((day, i) => (
                                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                                                <h4 className="font-bold text-slate-800 text-sm mb-2">{day.day}</h4>
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {day.subjects.map((subj, j) => (
                                                        <span key={j} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                                            {subj}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-400">{day.duration}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Online Resources */}
                        {selectedStudent.online_resources && selectedStudent.online_resources.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5">
                                    <div className="flex items-center gap-3 text-white">
                                        <BookOpen className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">Personalized Resources</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedStudent.online_resources.map((resource, i) => (
                                            <a
                                                key={i}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:shadow-lg hover:border-violet-300 transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-1">
                                                            {resource.subject} • {resource.platform}
                                                        </p>
                                                        <h4 className="font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
                                                            {resource.title}
                                                        </h4>
                                                    </div>
                                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-500">
                                                        {resource.level}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3">{resource.topics}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                    <span className="px-2 py-1 rounded-full bg-white border border-slate-200">{resource.type}</span>
                                                    <span className="px-2 py-1 rounded-full bg-white border border-slate-200">{resource.duration}</span>
                                                    <span className="px-2 py-1 rounded-full bg-white border border-slate-200">Rating {resource.rating}</span>
                                                    {String(resource.platform || '').toLowerCase().includes('youtube') && (
                                                        <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 font-bold">YouTube</span>
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* A/L Path */}
                        {selectedStudent.al_path && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5">
                                    <div className="flex items-center gap-3 text-white">
                                        <GraduationCap className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">A/L Path Recommendation</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <p className="text-emerald-800 font-bold text-lg">{selectedStudent.al_path.stream}</p>
                                        <p className="text-emerald-600 text-sm mt-1">Target Z-Score: {selectedStudent.al_path.target_z_score}</p>
                                    </div>
                                    
                                    {selectedStudent.al_path.career_paths && (
                                        <div>
                                            <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                                <Award size={16} /> Career Paths
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStudent.al_path.career_paths.map((c, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedStudent.al_path.study_tips && (
                                        <div>
                                            <h4 className="font-semibold text-slate-700 mb-2">Study Tips</h4>
                                            <ul className="space-y-2">
                                                {selectedStudent.al_path.study_tips.map((tip, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <ChevronRight size={14} className="mt-1 text-emerald-500 flex-shrink-0" />
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Registered Date */}
                        {selectedStudent.created_at && (
                            <div className="text-center text-xs text-slate-400 pb-4">
                                Registered: {new Date(selectedStudent.created_at).toLocaleString()}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Student List View */
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                        <Database className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-white flex-1">
                                        <h3 className="text-xl font-bold">Student Records — MongoDB</h3>
                                        <p className="text-white/70 text-sm">Search and view individual student data from database</p>
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-full text-white text-sm font-medium">
                                        {allStudents.length} Students
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSearchStudent} className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by Student ID or Name..."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm font-medium"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                    >
                                        <Search size={18} />
                                        Search
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center gap-4 shadow-lg shadow-red-100">
                                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-red-800">Error</p>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Loading */}
                        {loadingAll ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">Loading students from MongoDB...</p>
                                </div>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">Fetching student data...</p>
                                </div>
                            </div>
                        ) : (
                            /* Student Cards */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredStudents.length === 0 ? (
                                    <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-lg">
                                        <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium text-lg">No students found</p>
                                        <p className="text-slate-400 text-sm mt-1">Add students to the database to view them here</p>
                                    </div>
                                ) : (
                                    filteredStudents.map((student, index) => {
                                        const avgScore = student.subject_scores 
                                            ? Object.values(student.subject_scores).reduce((a, b) => a + b, 0) / Object.values(student.subject_scores).length 
                                            : 0;
                                        return (
                                            <div
                                                key={student.student_id || index}
                                                onClick={() => handleViewStudent(student.student_id)}
                                                className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
                                            >
                                                {/* Card top gradient */}
                                                <div className={`h-2 bg-gradient-to-r ${avgScore >= 75 ? 'from-emerald-400 to-emerald-600' : avgScore >= 50 ? 'from-amber-400 to-amber-600' : 'from-red-400 to-red-600'}`} />
                                                
                                                <div className="p-5">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                                                                {student.student_id}
                                                            </h4>
                                                            <p className="text-slate-400 text-xs mt-0.5">
                                                                {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${getScoreColor(avgScore)}`}>
                                                            {avgScore.toFixed(0)}%
                                                        </div>
                                                    </div>

                                                    {/* Quick Stats */}
                                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                                        <div className="bg-violet-50 rounded-lg p-2 text-center">
                                                            <p className="text-[10px] text-violet-500 font-bold uppercase">IQ</p>
                                                            <p className="text-sm font-bold text-violet-800">{student.iq_level || 'N/A'}</p>
                                                        </div>
                                                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                                                            <p className="text-[10px] text-blue-500 font-bold uppercase">Study</p>
                                                            <p className="text-sm font-bold text-blue-800">{student.study_hours_per_week || 'N/A'}h</p>
                                                        </div>
                                                        <div className="bg-emerald-50 rounded-lg p-2 text-center">
                                                            <p className="text-[10px] text-emerald-500 font-bold uppercase">Attend</p>
                                                            <p className="text-sm font-bold text-emerald-800">{student.attendance_rate || 'N/A'}%</p>
                                                        </div>
                                                    </div>

                                                    {/* View Details Button */}
                                                    <button className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-600">
                                                        View Details
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentLookup;
