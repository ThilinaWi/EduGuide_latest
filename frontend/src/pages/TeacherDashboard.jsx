import React, { useState } from 'react';
import Layout from '../components/Layout';
import StudentList from '../components/StudentList';
import UserManagement from '../components/UserManagement';

const TeacherDashboard = () => {
    const [tab, setTab] = useState('students');

    return (
        <Layout title="Teacher Dashboard">
            <div className="mb-6 flex gap-3">
                <button
                    onClick={() => setTab('students')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'students' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                >
                    Students
                </button>
                <button
                    onClick={() => setTab('users')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'users' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                >
                    User Management
                </button>
            </div>

            {tab === 'students' ? <StudentList embedded /> : <UserManagement embedded />}
        </Layout>
    );
};

export default TeacherDashboard;
