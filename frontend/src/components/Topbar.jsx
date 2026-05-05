import React from 'react';
import { Bell, User } from 'lucide-react';
import { getUser } from '../services/authService';

const Topbar = ({ title }) => {
    const user = getUser();
    const displayName = user?.name || user?.fullName || user?.email || 'Guest';
    const roleLabel = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Guest';
    return (
        <div className="sticky top-0 z-10 flex items-center justify-between h-20 px-8 bg-white border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-slate-200">
                    <button className="relative transition-colors text-slate-400 hover:text-slate-600">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold leading-none text-slate-800">{displayName}</p>
                            <span className="text-[10px] text-slate-400">{roleLabel}</span>
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 border rounded-full bg-slate-100 text-slate-500 border-slate-200">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
