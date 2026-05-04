import React, { useState, useEffect } from 'react';
import { Save, UserPlus, Info, Activity, Target, Sparkles, Brain, Clock, Users, CheckCircle2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import Layout from './Layout';

const AddStudent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [activeSection, setActiveSection] = useState(1);
    const [iqFromTest, setIqFromTest] = useState(false);

    const [formData, setFormData] = useState({
        student_id: '',
        iq_level: '',
        study_hours_per_week: '',
        attendance_rate: '',
        student_type: 'balanced',
        subject_scores: {
            Sinhala: '',
            Mathematics: '',
            Science: '',
            English: '',
            History: '',
            Buddhism: '',
            Geography: '',
            ICT: ''
        }
    });
    const [submitting, setSubmitting] = useState(false);

    // Auto-fill IQ score from URL params (when coming from IQ test)
    useEffect(() => {
        const iqScore = searchParams.get('iq_score');
        if (iqScore) {
            const parsedIQ = parseFloat(iqScore);
            if (!isNaN(parsedIQ) && parsedIQ >= 0 && parsedIQ <= 200) {
                setFormData(prev => ({
                    ...prev,
                    iq_level: String(parsedIQ)
                }));
                setIqFromTest(true);
            }
        }
    }, [searchParams]);

    const handleSubjectChange = (subject, value) => {
        let newValue = value;
        if (value.length > 3) {
            newValue = value.slice(0, 3);
        }
        if (parseInt(newValue) > 100) {
            newValue = '100';
        }
        if (parseInt(newValue) < 0) {
            newValue = '0';
        }
        
        setFormData(prev => ({
            ...prev,
            subject_scores: {
                ...prev.subject_scores,
                [subject]: newValue
            }
        }));
    };

    const validateForm = () => {
        // Require IQ score from the IQ test
        if (!iqFromTest) {
            setError('You must complete the IQ Assessment Test before submitting. Please take the test first.');
            return false;
        }

        const iq = parseFloat(formData.iq_level);
        if (isNaN(iq) || iq < 0 || iq > 200) {
            setError('IQ Level must be between 0 and 200');
            return false;
        }

        const studyHours = parseFloat(formData.study_hours_per_week);
        if (isNaN(studyHours) || studyHours < 0 || studyHours > 168) {
            setError('Study hours must be between 0 and 168');
            return false;
        }

        const attendance = parseFloat(formData.attendance_rate);
        if (isNaN(attendance) || attendance < 0 || attendance > 100) {
            setError('Attendance rate must be between 0 and 100');
            return false;
        }

        for (const [subject, score] of Object.entries(formData.subject_scores)) {
            const scoreValue = parseFloat(score);
            if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
                setError(`${subject} score must be between 0 and 100`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess(false);

        if (!validateForm()) {
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                student_id: formData.student_id.trim().toUpperCase(),
                iq_level: parseFloat(formData.iq_level),
                study_hours_per_week: parseFloat(formData.study_hours_per_week),
                attendance_rate: parseFloat(formData.attendance_rate),
                student_type: formData.student_type,
                subject_scores: Object.keys(formData.subject_scores).reduce((acc, key) => {
                    acc[key] = parseFloat(formData.subject_scores[key]);
                    return acc;
                }, {})
            };

            console.log('Submitting student data:', payload);

            const response = await client.post('/api/adaptive/students/add', payload);
            console.log('Student added successfully:', response.data);

            setSuccess(true);
            
            const savedStudentId = response.data.student_id;

            setFormData({
                student_id: '',
                iq_level: '',
                study_hours_per_week: '',
                attendance_rate: '',
                student_type: 'balanced',
                subject_scores: {
                    Sinhala: '',
                    Mathematics: '',
                    Science: '',
                    English: '',
                    History: '',
                    Buddhism: '',
                    Geography: '',
                    ICT: ''
                }
            });
            setIqFromTest(false);

            setTimeout(() => {
                navigate(`/students/${savedStudentId}`);
            }, 2000);

        } catch (err) {
            console.error('Error adding student:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to add student. Please try again.';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchId.trim()) {
            navigate(`/students/${searchId.trim().toUpperCase()}`);
        }
    };

    // Check if section is complete
    const isMetricsComplete = formData.iq_level && formData.study_hours_per_week && formData.attendance_rate;
    const isScoresComplete = Object.values(formData.subject_scores).every(score => score !== '');

    // Subject icons mapping
    const subjectIcons = {
        Sinhala: '📚',
        Mathematics: '🔢',
        Science: '🔬',
        English: '🌍',
        History: '📜',
        Buddhism: '☸️',
        Geography: '🗺️',
        ICT: '💻'
    };

    // Subject colors
    const subjectColors = {
        Sinhala: 'from-amber-400 to-orange-500',
        Mathematics: 'from-blue-400 to-indigo-500',
        Science: 'from-green-400 to-emerald-500',
        English: 'from-purple-400 to-violet-500',
        History: 'from-rose-400 to-pink-500',
        Buddhism: 'from-yellow-400 to-amber-500',
        Geography: 'from-cyan-400 to-teal-500',
        ICT: 'from-slate-400 to-slate-600'
    };

    return (
        <Layout
            title=" "
            searchId={searchId}
            setSearchId={setSearchId}
            handleSearch={handleSearch}
        >
            <div className="animate-fadeIn max-w-5xl mx-auto">
                {/* IQ Auto-fill Banner */}
                {iqFromTest && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center gap-4 animate-fadeIn shadow-lg shadow-blue-100">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-800">IQ Score Auto-Filled from Assessment!</p>
                            <p className="text-blue-600 text-sm">Your IQ score of <span className="font-bold">{formData.iq_level}</span> has been automatically applied from the IQ test.</p>
                        </div>
                        <div className="ml-auto">
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                )}

                {/* Status Messages */}
                {success && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center gap-4 animate-fadeIn shadow-lg shadow-emerald-100">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-emerald-800">Registration Successful!</p>
                            <p className="text-emerald-600 text-sm">Student has been added. Redirecting to profile...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center gap-4 animate-fadeIn shadow-lg shadow-red-100">
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-red-800">Error Occurred</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Learning Metrics */}
                    <div className={`transition-all duration-500 ${activeSection === 1 ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.98]'}`}>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                            {/* Section Header */}
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                        <Activity className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-white">
                                        <h3 className="text-xl font-bold">Learning Metrics</h3>
                                        <p className="text-white/70 text-sm">Enter the student's cognitive and behavioral data</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* IQ Level Card */}
                                    <div className="group">
                                        <div className={`bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 ${iqFromTest ? 'border-blue-400 ring-2 ring-blue-200' : 'border-amber-300 ring-2 ring-amber-100'}`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${iqFromTest ? 'from-violet-500 to-purple-600 shadow-purple-500/30' : 'from-amber-400 to-orange-500 shadow-amber-500/30'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                    <Brain className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-purple-600 uppercase tracking-wider">IQ Level</label>
                                                    <p className="text-[10px] text-slate-400">
                                                        {iqFromTest ? '✅ From IQ Test' : '⚠️ IQ Test Required'}
                                                    </p>
                                                </div>
                                            </div>
                                            {iqFromTest ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        required
                                                        readOnly
                                                        className="w-full px-4 py-4 text-2xl font-bold text-center bg-blue-50 border-2 border-blue-400 rounded-xl text-blue-700 cursor-not-allowed outline-none"
                                                        value={formData.iq_level}
                                                    />
                                                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                                                        <span>Score from IQ Test</span>
                                                        <span className="text-blue-600 font-medium">✅ Verified</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-full px-4 py-4 text-center bg-amber-50 border-2 border-amber-300 border-dashed rounded-xl">
                                                        <p className="text-amber-700 font-semibold text-sm mb-2">IQ Test Not Completed</p>
                                                        <Link
                                                            to="/iq-test"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                                        >
                                                            <Brain className="w-4 h-4" />
                                                            Take IQ Test Now
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                    <div className="mt-3 text-xs text-amber-600 text-center font-medium">
                                                        You must complete the IQ test to proceed
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Study Hours Card */}
                                    <div className="group">
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-transparent hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                                    <Clock className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Study Hours</label>
                                                    <p className="text-[10px] text-slate-400">Weekly dedication</p>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                className="w-full px-4 py-4 text-2xl font-bold text-center bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                                value={formData.study_hours_per_week}
                                                onChange={(e) => setFormData({ ...formData, study_hours_per_week: e.target.value })}
                                                placeholder="hrs/week"
                                                disabled={submitting}
                                            />
                                            <div className="mt-3 flex justify-between text-xs text-slate-400">
                                                <span>Min: 0</span>
                                                <span>Max: 168</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Card */}
                                    <div className="group">
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-transparent hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                                    <Users className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Attendance</label>
                                                    <p className="text-[10px] text-slate-400">Presence percentage</p>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                className="w-full px-4 py-4 text-2xl font-bold text-center bg-white border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                                value={formData.attendance_rate}
                                                onChange={(e) => setFormData({ ...formData, attendance_rate: e.target.value })}
                                                placeholder="0-100%"
                                                disabled={submitting}
                                            />
                                            <div className="mt-3 flex justify-between text-xs text-slate-400">
                                                <span>Min: 0%</span>
                                                <span>Max: 100%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                {/* Removed the 'Continue to Subjects' button */}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Subject Scores */}
                    <div className={`transition-all duration-500 ${activeSection === 2 ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.98]'}`}>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                            {/* Section Header */}
                            <div className="bg-gradient-to-r from-orange-500 to-rose-600 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                        <Target className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-white">
                                        <h3 className="text-xl font-bold">Subject Performance</h3>
                                        <p className="text-white/70 text-sm">Enter scores for each subject (0-100)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                    {Object.keys(formData.subject_scores).map((subject, index) => (
                                        <div 
                                            key={subject} 
                                            className="group animate-fadeIn"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className={`relative bg-gradient-to-br ${subjectColors[subject]} p-0.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                                                <div className="bg-white rounded-[14px] p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-2xl">{subjectIcons[subject]}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{subject}</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="w-full px-3 py-3 text-xl font-bold text-center bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-slate-400 focus:bg-white transition-all outline-none"
                                                        value={formData.subject_scores[subject]}
                                                        onChange={(e) => handleSubjectChange(subject, e.target.value)}
                                                        placeholder="Score"
                                                        min="0"
                                                        max="100"
                                                        maxLength="3"
                                                        onKeyDown={(e) => {
                                                            const value = e.target.value;
                                                            if (value.length >= 3 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        disabled={submitting}
                                                    />
                                                    {/* Score indicator */}
                                                    {formData.subject_scores[subject] && (
                                                        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full bg-gradient-to-r ${subjectColors[subject]} transition-all duration-500`}
                                                                style={{ width: `${Math.min(formData.subject_scores[subject], 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* IQ Test Required Warning */}
                    {!iqFromTest && (
                        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex items-center gap-4 animate-fadeIn">
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-amber-800">IQ Assessment Required</p>
                                <p className="text-amber-600 text-sm">You must complete the IQ Assessment Test before registering a student. The IQ score cannot be entered manually.</p>
                            </div>
                            <Link
                                to="/iq-test"
                                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                <Brain className="w-4 h-4" />
                                Take IQ Test
                            </Link>
                        </div>
                    )}

                    {/* Submit Section */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Info className="w-5 h-5" />
                            <span className="text-sm">
                                {iqFromTest 
                                    ? 'All fields are required. Student ID will be auto-generated.'
                                    : '⚠️ Complete the IQ Test first to enable form submission.'
                                }
                            </span>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !iqFromTest}
                            title={!iqFromTest ? 'Please complete the IQ Assessment Test first' : 'Submit student registration'}
                            className={`group relative px-10 py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-3 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden ${
                                iqFromTest 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1'
                                    : 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
                            }`}
                        >
                            {/* Button shine effect */}
                            {iqFromTest && (
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            )}
                            
                            {submitting ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Registering Student...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Add Student Details</span>
                                    {iqFromTest && <Sparkles className="w-4 h-4 opacity-70" />}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default AddStudent;
