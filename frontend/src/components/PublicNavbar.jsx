// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ArrowRight } from 'lucide-react';
// import { getUser, isAuthenticated } from '../services/authService';

// const C = {
//     navy: '#0d034c',
//     white: '#FFFFFF',
//     mintLight: '#E3F6F5',
//     mint: '#BAE8E8',
// };

// const PublicNavbar = ({ showLinks = true }) => {
//     const navigate = useNavigate();
//     const user = isAuthenticated() ? getUser() : null;
//     const [scrolled, setScrolled] = useState(false);

//     useEffect(() => {
//         const handleScroll = () => {
//             setScrolled(window.scrollY > 50);
//         };
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     const handleDashboard = () => {
//         if (!user) return navigate('/login');
//         navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/add-student');
//     };

//     return (
//         <nav
//             className="fixed inset-x-0 top-0 z-50 flex items-center justify-end gap-10 px-8 py-1 transition-all duration-300"
//             style={{
//                 background: scrolled
//                     ? `${C.navy}ee`
//                     : 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
//                 backdropFilter: scrolled ? 'blur(10px)' : 'none',
//                 borderBottom: scrolled ? `1px solid ${C.mint}33` : 'none',
//             }}
//         >
//             <Link to="/" className="flex items-center gap-2.5 mr-auto">
//                 <img
//                     src="/src/assets/images/EduGuidelogo11.png"
//                     alt="EduGuide Logo"
//                     className="w-auto h-20 transition-all hover:opacity-90"
//                     style={{ filter: scrolled ? 'none' : 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))' }}
//                 />
//             </Link>

//             {showLinks && (
//                 <div className="items-center hidden text-sm md:flex gap-7">
//                     {['Features', 'How it Works', 'Benefits'].map(s => (
//                         <a
//                             key={s}
//                             href={`#${s.toLowerCase().replace(/ /g, '-')}`}
//                             className="font-medium transition-colors hover:opacity-80"
//                             style={{ color: C.white, textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}
//                         >
//                             {s}
//                         </a>
//                     ))}
//                 </div>
//             )}

//             <div className="flex items-center gap-3">
//                 {user ? (
//                     <button
//                         onClick={handleDashboard}
//                         className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-xl hover:opacity-90"
//                         style={{ background: C.mint, color: C.navy, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
//                     >
//                         Dashboard <ArrowRight size={14} />
//                     </button>
//                 ) : (
//                     <>
//                         <Link
//                             to="/login"
//                             className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
//                             style={{ color: C.white, textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}
//                         >
//                             Sign In
//                         </Link>
//                         <Link
//                             to="/register"
//                             className="px-4 py-2 text-sm font-semibold transition-all rounded-xl hover:opacity-90"
//                             style={{ background: C.mint, color: C.navy, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
//                         >
//                             Get Started
//                         </Link>
//                     </>
//                 )}
//             </div>
//         </nav>
//     );
// };

// export default PublicNavbar;




import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getUser, isAuthenticated } from '../services/authService';

const C = {
    navy: '#0F7A55',
    navyDark: '#085c3f',
    white: '#FFFFFF',
    mintLight: '#EAF7F2',
    mint: '#1E9E72',
    accent: '#2ECC9A',
};

const PublicNavbar = ({ showLinks = true }) => {
    const navigate = useNavigate();
    const user = isAuthenticated() ? getUser() : null;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDashboard = () => {
        if (!user) return navigate('/login');
        navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/add-student');
    };

    return (
        <nav
            className="fixed inset-x-0 top-0 z-50 flex items-center justify-end gap-10 px-8 py-1 transition-all duration-300"
            style={{
                background: scrolled
                    ? `${C.white}f5`
                    : 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? `1px solid ${C.mint}44` : 'none',
            }}
        >
            <Link to="/" className="flex items-center gap-2.5 mr-auto">
                <img
                    src="/src/assets/images/EduGuidelogo11.png"
                    alt="EduGuide Logo"
                    className="w-auto h-20 transition-all hover:opacity-90"
                    style={{ filter: scrolled ? 'none' : 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))' }}
                />
            </Link>

            {showLinks && (
                <div className="items-center hidden text-sm md:flex gap-7">
                    {['Features', 'How it Works', 'Benefits'].map(s => (
                        <a
                            key={s}
                            href={`#${s.toLowerCase().replace(/ /g, '-')}`}
                            className="font-medium transition-colors hover:opacity-80"
                            style={{ color: scrolled ? C.navy : C.white, textShadow: scrolled ? 'none' : '0 1px 5px rgba(0,0,0,0.5)' }}
                        >
                            {s}
                        </a>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3">
                {user ? (
                    <button
                        onClick={handleDashboard}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-xl hover:opacity-90"
                        style={{ background: C.mint, color: C.navy, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    >
                        Dashboard <ArrowRight size={14} />
                    </button>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                            style={{ color: scrolled ? C.navy : C.white, textShadow: scrolled ? 'none' : '0 1px 5px rgba(0,0,0,0.5)' }}
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 text-sm font-semibold transition-all rounded-xl hover:opacity-90"
                            style={{ background: C.mint, color: C.white, boxShadow: `0 4px 15px ${C.mint}44` }}
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default PublicNavbar;