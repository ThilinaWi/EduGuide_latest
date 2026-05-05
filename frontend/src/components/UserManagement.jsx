import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminUpdateRole } from '../api/authApi';
import Layout from './Layout';

const ROLES = ['student', 'teacher'];

const UserManagement = ({ embedded = false }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminGetUsers();
            setUsers(data.users || []);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (email, role) => {
        try {
            await adminUpdateRole(email, role);
            await loadUsers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update role');
        }
    };

    const content = (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                <button
                    onClick={loadUsers}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:opacity-90"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
                    {error}
                </div>
            )}

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-10 text-slate-500 text-center">Loading users...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.email} className="hover:bg-slate-50/60">
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{user.name || 'User'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.email, e.target.value)}
                                            className="text-sm rounded-lg border border-slate-200 px-2 py-1.5"
                                        >
                                            {ROLES.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{user.last_login || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    if (embedded) return content;

    return (
        <Layout title="User Management">
            {content}
        </Layout>
    );
};

export default UserManagement;
