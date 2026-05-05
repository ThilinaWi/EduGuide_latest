import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Mail } from 'lucide-react';

const C = {
    navy: '#0d034c',
    white: '#FFFFFF',
    mintLight: '#E3F6F5',
    mint: '#BAE8E8',
};

const PublicFooter = () => (
    <footer className="px-8 py-12" style={{ background: '#000000', borderTop: `2px solid ${C.mint}44` }}>
        <div className="grid max-w-6xl grid-cols-1 gap-10 mx-auto md:grid-cols-3">
            <div className="flex flex-col gap-3">
                <Link to="/" className="flex items-center gap-2">
                    <div
                        className="flex items-center justify-center rounded-lg w-7 h-7"
                        style={{ background: C.mint }}
                    >
                        <BookOpen size={13} style={{ color: C.navy }} />
                    </div>
                    <span className="text-base font-bold" style={{ color: C.white }}>EduGuide</span>
                </Link>
                <p className="text-xs leading-relaxed" style={{ color: `${C.mintLight}99` }}>
                    AI-powered education support system built for Sri Lanka's students and educators.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <p className="mb-1 text-xs font-semibold tracking-widest uppercase" style={{ color: C.mint }}>Quick Links</p>
                {[
                    { label: 'Features', href: '#features' },
                    { label: 'How it Works', href: '#how-it-works' },
                    { label: 'About', href: '#' },
                    { label: 'Privacy Policy', href: '#' },
                ].map(l => (
                    <a
                        key={l.label}
                        href={l.href}
                        className="text-sm transition-opacity hover:opacity-70 w-fit"
                        style={{ color: C.mintLight }}
                    >
                        {l.label}
                    </a>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <p className="mb-1 text-xs font-semibold tracking-widest uppercase" style={{ color: C.mint }}>Contact</p>
                <a
                    href="mailto:support@eduguide.lk"
                    className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70 w-fit"
                    style={{ color: C.mintLight }}
                >
                    <Mail size={13} /> support@eduguide.lk
                </a>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70 w-fit"
                    style={{ color: C.mintLight }}
                >
                    <Github size={13} /> GitHub Repository
                </a>
                <p className="mt-2 text-xs" style={{ color: `${C.mint}99` }}>
                    Copyright 2026 EduGuide. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
);

export default PublicFooter;
