// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import PublicNavbar from '../components/PublicNavbar';
// import PublicFooter from '../components/PublicFooter';
// import {
//     Activity,
//     Brain,
//     BarChart2,
//     Shield,
//     ChevronRight,
//     Sparkles,
//     GraduationCap,
//     TrendingUp,
//     Users,
//     Star,
//     ArrowRight,
//     Lock,
//     Zap,
// } from 'lucide-react';

// const C = {
//     navy: '#0d034c',
//     white: '#FFFFFF',
//     mintLight: '#E3F6F5',
//     mint: '#BAE8E8',
// };

// const Hero = () => {
//     const navigate = useNavigate();
//     const [currentSlide, setCurrentSlide] = useState(0);

//     const heroImages = [
//         '/src/assets/images/picture1.png',
//         '/src/assets/images/picture2.png',
//     ];

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentSlide((prev) => (prev + 1) % heroImages.length);
//         }, 5000);
//         return () => clearInterval(interval);
//     }, []);

//     return (
//         <section className="relative flex items-center justify-center h-screen px-6 pt-16 pb-8 overflow-hidden">
//             <div className="absolute inset-0 z-0">
//                 {heroImages.map((img, index) => (
//                     <div
//                         key={index}
//                         className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
//                         style={{
//                             opacity: currentSlide === index ? 1 : 0,
//                             backgroundImage: `url(${img})`,
//                             backgroundSize: 'cover',
//                             backgroundPosition: 'center',
//                             backgroundRepeat: 'no-repeat',
//                         }}
//                     />
//                 ))}
//                 <div
//                     className="absolute inset-0"
//                     style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.5), rgba(0,0,0,0.75))' }}
//                 />
//             </div>

//             <div className="absolute z-20 flex gap-2 transform -translate-x-1/2 bottom-8 left-1/2">
//                 {heroImages.map((_, index) => (
//                     <button
//                         key={index}
//                         onClick={() => setCurrentSlide(index)}
//                         className="w-2 h-2 transition-all duration-300 rounded-full"
//                         style={{
//                             background: currentSlide === index ? C.mint : `${C.mint}40`,
//                             width: currentSlide === index ? '32px' : '8px',
//                         }}
//                         aria-label={`Go to slide ${index + 1}`}
//                     />
//                 ))}
//             </div>

//             <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
//                 <div
//                     className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-xs font-semibold border rounded-full"
//                     style={{ background: `${C.mint}15`, borderColor: `${C.mint}50`, color: C.mint }}
//                 >
//                     <Sparkles size={12} />
//                     AI-Powered Education Platform for Sri Lanka
//                 </div>

//                 <h1
//                     className="px-4 mb-5 text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
//                     style={{ color: C.white, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
//                 >
//                     EMPOWERING{' '}
//                     <span style={{ color: C.mint }}>O/L STUDENTS</span>
//                     <br />
//                     WITH AI
//                 </h1>

//                 <p
//                     className="max-w-3xl px-4 mx-auto mb-8 text-base leading-relaxed sm:text-lg"
//                     style={{ color: C.mintLight, textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
//                 >
//                     Advanced AI-driven platform for academic risk prediction, attendance analysis,
//                     personalized learning paths, and student stress monitoring
//                 </p>

//                 <div className="flex flex-wrap justify-center gap-4 mb-16">
//                     <button
//                         onClick={() => navigate('/register')}
//                         className="flex items-center gap-2 px-8 py-4 text-lg font-bold transition-all rounded-2xl hover:-translate-y-1 hover:shadow-2xl"
//                         style={{ background: C.mint, color: C.navy, boxShadow: `0 10px 40px ${C.mint}66` }}
//                     >
//                         <Sparkles size={20} /> Get Started Free
//                     </button>
//                     <button
//                         onClick={() => navigate('/login')}
//                         className="flex items-center gap-2 px-8 py-4 text-lg font-bold transition-all border-2 rounded-2xl hover:bg-white/10"
//                         style={{ borderColor: C.mint, color: C.white }}
//                     >
//                         Student Login <ChevronRight size={20} />
//                     </button>
//                 </div>

//                 <div className="flex flex-wrap justify-center gap-12 lg:gap-16">
//                     {[
//                         { label: 'Students Supported', value: '10,000+', icon: <Users size={22} /> },
//                         { label: 'AI Accuracy Rate', value: '94.7%', icon: <Star size={22} /> },
//                         { label: 'Successful Interventions', value: '2,800+', icon: <TrendingUp size={22} /> },
//                     ].map(s => (
//                         <div key={s.label} className="text-center">
//                             <div
//                                 className="flex items-center justify-center gap-2 mb-2 text-3xl font-black sm:text-4xl"
//                                 style={{ color: C.mint, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
//                             >
//                                 {s.icon} {s.value}
//                             </div>
//                             <p
//                                 className="text-sm font-medium"
//                                 style={{ color: C.mintLight, textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}
//                             >
//                                 {s.label}
//                             </p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// const FEATURES = [
//     {
//         icon: <Activity size={28} />,
//         title: 'Attendance Trend Analysis',
//         desc: 'AI-powered ARIMA forecasting detects slipping attendance early. Weather, distance, and event-aware, built for the Sri Lankan school calendar.',
//         accent: '#BAE8E8',
//     },
//     {
//         icon: <Shield size={28} />,
//         title: 'Academic Risk Prediction',
//         desc: 'Gradient Boosting models trained on thousands of students identify at-risk learners before their grades decline, enabling timely intervention.',
//         accent: '#96d4d4',
//     },
//     {
//         icon: <Brain size={28} />,
//         title: 'Adaptive Learning Paths',
//         desc: 'Personalized curriculum recommendations adapt in real time to each student\'s weak areas, learning style, and performance trajectory.',
//         accent: '#BAE8E8',
//     },
//     {
//         icon: <BarChart2 size={28} />,
//         title: 'Student Stress Monitoring',
//         desc: 'ML-based stress level predictor analyzes academic load, attendance patterns, and performance signals to flag burnout before it impacts results.',
//         accent: '#96d4d4',
//     },
// ];

// const Features = () => (
//     <section id="features" className="px-6 py-24" style={{ background: C.mintLight }}>
//         <div className="max-w-6xl mx-auto">
//             <div className="mb-16 text-center">
//                 <p className="mb-3 text-sm font-semibold tracking-widest uppercase" style={{ color: C.navy }}>Capabilities</p>
//                 <h2 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: C.navy }}>
//                     Everything a student needs to succeed
//                 </h2>
//                 <p className="max-w-2xl mx-auto text-lg" style={{ color: '#4a6572' }}>
//                     Four AI engines working in harmony to give teachers and students an unfair advantage.
//                 </p>
//             </div>

//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//                 {FEATURES.map((f, i) => (
//                     <div
//                         key={i}
//                         className="p-6 transition-all duration-300 border-2 group rounded-2xl hover:-translate-y-1 hover:shadow-xl"
//                         style={{ background: C.white, borderColor: C.mint }}
//                     >
//                         <div
//                             className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl"
//                             style={{ background: C.mint, color: C.navy }}
//                         >
//                             {f.icon}
//                         </div>
//                         <h3 className="mb-2 text-base font-bold" style={{ color: C.navy }}>{f.title}</h3>
//                         <p className="text-sm leading-relaxed" style={{ color: '#4a6572' }}>{f.desc}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     </section>
// );

// const STEPS = [
//     { n: '01', icon: <GraduationCap size={22} />, title: 'Student Data Analysis', desc: 'Attendance records, grades, stress indicators, and contextual factors are securely collected and normalized.' },
//     { n: '02', icon: <Brain size={22} />, title: 'AI Predicts Learning Insights', desc: 'Multiple ML models run in parallel, ARIMA for trends, Gradient Boosting for risk, NLP for learning style.' },
//     { n: '03', icon: <Sparkles size={22} />, title: 'Personalized Recommendations', desc: 'Each student receives a unique action plan, targeted resources, schedule adjustments, and teacher alerts.' },
// ];

// const HowItWorks = () => (
//     <section id="how-it-works" className="px-6 py-24" style={{ background: C.white }}>
//         <div className="max-w-5xl mx-auto">
//             <div className="mb-16 text-center">
//                 <p className="mb-3 text-sm font-semibold tracking-widest uppercase" style={{ color: C.mint.replace('BA', '80') }}>Process</p>
//                 <h2 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: C.navy }}>How EduGuide works</h2>
//                 <p className="text-lg" style={{ color: '#4a6572' }}>Three steps from raw data to personalized outcomes.</p>
//             </div>

//             <div className="relative">
//                 <div
//                     className="hidden md:block absolute top-12 left-[calc(16.5%+24px)] right-[calc(16.5%+24px)] h-0.5"
//                     style={{ background: `linear-gradient(to right, ${C.mint}, ${C.navy})` }}
//                 />
//                 <div className="grid gap-8 md:grid-cols-3">
//                     {STEPS.map((s, i) => (
//                         <div key={i} className="flex flex-col items-center text-center">
//                             <div className="relative mb-6">
//                                 <div
//                                     className="relative z-10 flex items-center justify-center shadow-lg w-14 h-14 rounded-2xl"
//                                     style={{ background: C.mint, color: C.navy }}
//                                 >
//                                     {s.icon}
//                                 </div>
//                                 <span
//                                     className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center"
//                                     style={{ background: C.navy, color: C.mint, border: `2px solid ${C.mint}` }}
//                                 >
//                                     {s.n}
//                                 </span>
//                             </div>
//                             <h3 className="mb-2 text-base font-bold" style={{ color: C.navy }}>{s.title}</h3>
//                             <p className="text-sm leading-relaxed" style={{ color: '#4a6572' }}>{s.desc}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     </section>
// );

// const BENEFITS = [
//     { icon: <TrendingUp size={20} />, title: 'Improve Pass Rates', desc: 'Schools using EduGuide report up to 23% improvement in O/L pass rates within two terms.' },
//     { icon: <Zap size={20} />, title: 'Early Intervention', desc: 'Identify struggling students weeks before exams, not days, giving teachers time to act.' },
//     { icon: <Lock size={20} />, title: 'Privacy First', desc: 'All student data is encrypted, role-gated, and never shared with third parties.' },
//     { icon: <Brain size={20} />, title: 'Contextual AI', desc: 'Our models account for Sri Lankan school calendar, weather patterns, and distance to school.' },
//     { icon: <Users size={20} />, title: 'For Everyone', desc: 'Works equally well for a single student analyzing their own trends or a principal monitoring the whole school.' },
//     { icon: <BarChart2 size={20} />, title: 'Real-Time Analytics', desc: 'Dashboards update automatically as new attendance and assessment data flows in.' },
// ];

// const Benefits = () => (
//     <section id="benefits" className="px-6 py-24" style={{ background: C.mint }}>
//         <div className="max-w-6xl mx-auto">
//             <div className="text-center mb-14">
//                 <p className="mb-3 text-sm font-semibold tracking-widest uppercase" style={{ color: C.navy }}>Why EduGuide</p>
//                 <h2 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: C.navy }}>Built for Sri Lankan students</h2>
//                 <p className="max-w-2xl mx-auto text-lg" style={{ color: '#2a4a55' }}>
//                     Every feature is designed around the realities of GCE O/L preparation.
//                 </p>
//             </div>
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                 {BENEFITS.map((b, i) => (
//                     <div
//                         key={i}
//                         className="flex gap-4 p-5 transition-all border-2 rounded-2xl hover:shadow-lg"
//                         style={{ background: C.white, borderColor: `${C.navy}22` }}
//                     >
//                         <div
//                             className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
//                             style={{ background: `${C.navy}15`, color: C.navy }}
//                         >
//                             {b.icon}
//                         </div>
//                         <div>
//                             <h4 className="mb-1 text-sm font-semibold" style={{ color: C.navy }}>{b.title}</h4>
//                             <p className="text-xs leading-relaxed" style={{ color: '#4a6572' }}>{b.desc}</p>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     </section>
// );

// const CTABanner = () => {
//     const navigate = useNavigate();
//     return (
//         <section className="px-6 py-20" style={{ background: C.navy }}>
//             <div className="max-w-3xl mx-auto text-center">
//                 <h2 className="mb-6 text-4xl font-black md:text-5xl" style={{ color: C.white }}>
//                     Ready to unlock your{' '}
//                     <span style={{ color: C.mint }}>potential?</span>
//                 </h2>
//                 <p className="mb-10 text-lg" style={{ color: C.mintLight }}>
//                     Join thousands of O/L students already using EduGuide to study smarter.
//                 </p>
//                 <div className="flex flex-wrap justify-center gap-4">
//                     <button
//                         onClick={() => navigate('/register')}
//                         className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5 hover:opacity-90"
//                         style={{ background: C.mint, color: C.navy, boxShadow: `0 8px 28px ${C.mint}55` }}
//                     >
//                         Sign Up Free <ArrowRight size={18} />
//                     </button>
//                     <button
//                         onClick={() => navigate('/login')}
//                         className="flex items-center gap-2 px-8 py-4 text-base font-bold transition-all border-2 rounded-2xl hover:opacity-80"
//                         style={{ borderColor: C.mint, color: C.mintLight }}
//                     >
//                         Student Login
//                     </button>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default function HomePage() {
//     return (
//         <div className="min-h-screen" style={{ background: C.navy }}>
//             <PublicNavbar />
//             <Hero />
//             <Features />
//             <HowItWorks />
//             <Benefits />
//             <CTABanner />
//             <PublicFooter />
//         </div>
//     );
// }



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import {
    Activity,
    Brain,
    BarChart2,
    Shield,
    ChevronRight,
    Sparkles,
    GraduationCap,
    TrendingUp,
    Users,
    Star,
    ArrowRight,
    Lock,
    Zap,
} from 'lucide-react';

const C = {
    navy: '#0F7A55',
    navyDark: '#085c3f',
    white: '#FFFFFF',
    mintLight: '#EAF7F2',
    mint: '#1E9E72',
    accent: '#2ECC9A',
};

const Hero = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroImages = [
        '/src/assets/images/picture1.png',
        '/src/assets/images/picture2.png',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative flex items-center justify-center h-screen px-6 pt-16 pb-8 overflow-hidden">
            <div className="absolute inset-0 z-0">
                {heroImages.map((img, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                        style={{
                            opacity: currentSlide === index ? 1 : 0,
                            backgroundImage: `url(${img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                ))}
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.5), rgba(0,0,0,0.75))' }}
                />
            </div>

            <div className="absolute z-20 flex gap-2 transform -translate-x-1/2 bottom-8 left-1/2">
                {heroImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className="w-2 h-2 transition-all duration-300 rounded-full"
                        style={{
                            background: currentSlide === index ? C.mint : `${C.mint}40`,
                            width: currentSlide === index ? '32px' : '8px',
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-xs font-semibold border rounded-full"
                    style={{ background: `${C.mint}15`, borderColor: `${C.mint}50`, color: C.mint }}
                >
                    <Sparkles size={12} />
                    AI-Powered Education Platform for Sri Lanka
                </div>

                <h1
                    className="px-4 mb-5 text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
                    style={{ color: C.white, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                    EMPOWERING{' '}
                    <span style={{ color: C.mint }}>O/L STUDENTS</span>
                    <br />
                    WITH AI
                </h1>

                <p
                    className="max-w-3xl px-4 mx-auto mb-8 text-base leading-relaxed sm:text-lg"
                    style={{ color: C.mintLight, textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
                >
                    Advanced AI-driven platform for academic risk prediction, attendance analysis,
                    personalized learning paths, and student stress monitoring
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    <button
                        onClick={() => navigate('/register')}
                        className="flex items-center gap-2 px-8 py-4 text-lg font-bold transition-all rounded-2xl hover:-translate-y-1 hover:shadow-2xl"
                        style={{ background: C.mint, color: C.white, boxShadow: `0 10px 40px ${C.mint}66` }}
                    >
                        <Sparkles size={20} /> Get Started Free
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 px-8 py-4 text-lg font-bold transition-all border-2 rounded-2xl hover:bg-white/10"
                        style={{ borderColor: C.mint, color: C.white }}
                    >
                        Student Login <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-12 lg:gap-16">
                    {[
                        { label: 'Students Supported', value: '10,000+', icon: <Users size={22} /> },
                        { label: 'AI Accuracy Rate', value: '94.7%', icon: <Star size={22} /> },
                        { label: 'Successful Interventions', value: '2,800+', icon: <TrendingUp size={22} /> },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <div
                                className="flex items-center justify-center gap-2 mb-2 text-3xl font-black sm:text-4xl"
                                style={{ color: C.mint, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                            >
                                {s.icon} {s.value}
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: C.mintLight, textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}
                            >
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FEATURES = [
    {
        icon: <Activity size={28} />,
        title: 'Attendance Trend Analysis',
        desc: 'AI-powered ARIMA forecasting detects slipping attendance early. Weather, distance, and event-aware, built for the Sri Lankan school calendar.',
        accent: '#1E9E72',
    },
    {
        icon: <Shield size={28} />,
        title: 'Academic Risk Prediction',
        desc: 'Gradient Boosting models trained on thousands of students identify at-risk learners before their grades decline, enabling timely intervention.',
        accent: '#0F7A55',
    },
    {
        icon: <Brain size={28} />,
        title: 'Adaptive Learning Paths',
        desc: 'Personalized curriculum recommendations adapt in real time to each student\'s weak areas, learning style, and performance trajectory.',
        accent: '#1E9E72',
    },
    {
        icon: <BarChart2 size={28} />,
        title: 'Student Stress Monitoring',
        desc: 'ML-based stress level predictor analyzes academic load, attendance patterns, and performance signals to flag burnout before it impacts results.',
        accent: '#0F7A55',
    },
];

const Features = () => (
    <section id="features" className="px-6 py-24" style={{ background: C.mintLight }}>
        <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
                <p className="mb-3 text-sm font-semibold tracking-widest uppercase" style={{ color: C.navy }}>Capabilities</p>
                <h2 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: C.navy }}>
                    Everything a student needs to succeed
                </h2>
                <p className="max-w-2xl mx-auto text-lg" style={{ color: '#4a6572' }}>
                    Four AI engines working in harmony to give teachers and students an unfair advantage.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {FEATURES.map((f, i) => (
                    <div
                        key={i}
                        className="p-6 transition-all duration-300 border-2 group rounded-2xl hover:-translate-y-1 hover:shadow-xl"
                        style={{ background: C.white, borderColor: C.mint }}
                    >
                        <div
                            className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl"
                            style={{ background: C.mint, color: C.white }}
                        >
                            {f.icon}
                        </div>
                        <h3 className="mb-2 text-base font-bold" style={{ color: C.navy }}>{f.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: '#4a6572' }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const STEPS = [
    { n: '01', icon: <GraduationCap size={22} />, title: 'Student Data Analysis', desc: 'Attendance records, grades, stress indicators, and contextual factors are securely collected and normalized.' },
    { n: '02', icon: <Brain size={22} />, title: 'AI Predicts Learning Insights', desc: 'Multiple ML models run in parallel, ARIMA for trends, Gradient Boosting for risk, NLP for learning style.' },
    { n: '03', icon: <Sparkles size={22} />, title: 'Personalized Recommendations', desc: 'Each student receives a unique action plan, targeted resources, schedule adjustments, and teacher alerts.' },
];

const HowItWorks = () => (
    <section id="how-it-works" className="px-6 py-24" style={{ background: C.white }}>
        <div className="max-w-5xl mx-auto">
            <div className="mb-16 text-center">
                <p className="mb-3 text-sm font-semibold tracking-widest uppercase" style={{ color: C.mint }}>Process</p>
                <h2 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: C.navy }}>How EduGuide works</h2>
                <p className="text-lg" style={{ color: '#4a6572' }}>Three steps from raw data to personalized outcomes.</p>
            </div>

            <div className="relative">
                <div
                    className="hidden md:block absolute top-12 left-[calc(16.5%+24px)] right-[calc(16.5%+24px)] h-0.5"
                    style={{ background: `linear-gradient(to right, ${C.mint}, ${C.navy})` }}
                />
                <div className="grid gap-8 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div
                                    className="relative z-10 flex items-center justify-center shadow-lg w-14 h-14 rounded-2xl"
                                    style={{ background: C.mint, color: C.white }}
                                >
                                    {s.icon}
                                </div>
                                <span
                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center"
                                    style={{ background: C.navyDark, color: C.white, border: `2px solid ${C.accent}` }}
                                >
                                    {s.n}
                                </span>
                            </div>
                            <h3 className="mb-2 text-base font-bold" style={{ color: C.navy }}>{s.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#4a6572' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

const BENEFITS = [
    { icon: <TrendingUp size={20} />, title: 'Improve Pass Rates', desc: 'Schools using EduGuide report up to 23% improvement in O/L pass rates within two terms.' },
    { icon: <Zap size={20} />, title: 'Early Intervention', desc: 'Identify struggling students weeks before exams, not days, giving teachers time to act.' },
    { icon: <Lock size={20} />, title: 'Privacy First', desc: 'All student data is encrypted, role-gated, and never shared with third parties.' },
    { icon: <Brain size={20} />, title: 'Contextual AI', desc: 'Our models account for Sri Lankan school calendar, weather patterns, and distance to school.' },
    { icon: <Users size={20} />, title: 'For Everyone', desc: 'Works equally well for a single student analyzing their own trends or a principal monitoring the whole school.' },
    { icon: <BarChart2 size={20} />, title: 'Real-Time Analytics', desc: 'Dashboards update automatically as new attendance and assessment data flows in.' },
];

const Benefits = () => (
    <section id="benefits" className="px-6 py-24" style={{ background: C.mintLight }}>
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
                <p className="mb-3 text-sm font-semibold tracking-widest uppercase" style={{ color: C.navy }}>Why EduGuide</p>
                <h2 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: C.navy }}>Built for Sri Lankan students</h2>
                <p className="max-w-2xl mx-auto text-lg" style={{ color: '#2a4a55' }}>
                    Every feature is designed around the realities of GCE O/L preparation.
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {BENEFITS.map((b, i) => (
                    <div
                        key={i}
                        className="flex gap-4 p-5 transition-all border-2 rounded-2xl hover:shadow-lg"
                        style={{ background: C.white, borderColor: `${C.navy}22` }}
                    >
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                            style={{ background: `${C.navy}15`, color: C.navy }}
                        >
                            {b.icon}
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-semibold" style={{ color: C.navy }}>{b.title}</h4>
                            <p className="text-xs leading-relaxed" style={{ color: '#4a6572' }}>{b.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const CTABanner = () => {
    const navigate = useNavigate();
    return (
        <section className="px-6 py-20" style={{ background: C.navyDark }}>
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="mb-6 text-4xl font-black md:text-5xl" style={{ color: C.white }}>
                    Ready to unlock your{' '}
                    <span style={{ color: C.mint }}>potential?</span>
                </h2>
                <p className="mb-10 text-lg" style={{ color: C.mintLight }}>
                    Join thousands of O/L students already using EduGuide to study smarter.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button
                        onClick={() => navigate('/register')}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5 hover:opacity-90"
                        style={{ background: C.accent, color: C.white, boxShadow: `0 8px 28px ${C.accent}55` }}
                    >
                        Sign Up Free <ArrowRight size={18} />
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 px-8 py-4 text-base font-bold transition-all border-2 rounded-2xl hover:opacity-80"
                        style={{ borderColor: C.mint, color: C.mintLight }}
                    >
                        Student Login
                    </button>
                </div>
            </div>
        </section>
    );
};

export default function HomePage() {
    return (
        <div className="min-h-screen" style={{ background: C.white }}>
            <PublicNavbar />
            <Hero />
            <Features />
            <HowItWorks />
            <Benefits />
            <CTABanner />
            <PublicFooter />
        </div>
    );
}