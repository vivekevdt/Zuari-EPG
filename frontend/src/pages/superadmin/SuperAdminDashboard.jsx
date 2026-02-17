import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDashboardStats, getEntities, createEntity, deleteEntity, getLogs } from '../../api';

import ConfirmationModal from '../../components/ConfirmationModal';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalEntities: 0,
        totalInteractions: 0,
        activePolicies: 0
    });
    const [entities, setEntities] = useState([]);
    const [newEntityName, setNewEntityName] = useState('');
    const [loading, setLoading] = useState(true);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entityToDelete, setEntityToDelete] = useState(null);

    // Logs State
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logFilters, setLogFilters] = useState({
        employeeName: '',
        startDate: '',
        endDate: '',
        entity: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, entitiesData] = await Promise.all([
                    getDashboardStats(),
                    getEntities()
                ]);
                setStats(statsData);
                setEntities(entitiesData);
                fetchLogs(); // Initial log fetch
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const data = await getLogs(logFilters);
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleAddEntity = async () => {
        if (!newEntityName.trim()) return;
        try {
            await createEntity(newEntityName);
            setNewEntityName('');
            // Refresh entities
            const updatedEntities = await getEntities();
            setEntities(updatedEntities);
            // Refresh stats to update entity count
            const updatedStats = await getDashboardStats();
            setStats(updatedStats);
        } catch (error) {
            console.error("Error creating entity:", error);
            toast.error("Failed to create entity");
        }
    };

    const confirmDeleteEntity = (id) => {
        setEntityToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteEntity = async () => {
        if (!entityToDelete) return;
        try {
            await deleteEntity(entityToDelete);
            toast.success("Entity deleted successfully");
            // Refresh entities
            const updatedEntities = await getEntities();
            setEntities(updatedEntities);
            // Refresh stats
            const updatedStats = await getDashboardStats();
            setStats(updatedStats);
        } catch (error) {
            console.error("Error deleting entity:", error);
            toast.error("Failed to delete entity");
        }
    };

    const handleFilterChange = (e) => {
        setLogFilters({ ...logFilters, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full text-gray-400">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-up">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEntity}
                title="Delete Entity"
                message="Are you sure you want to delete this entity? This action cannot be undone."
                confirmText="Delete Entity"
                isDanger={true}
            />
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">Super Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back to the Super Admin panel.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Total Employess', value: stats.totalEmployees, color: 'from-blue-500 to-blue-600', icon: (
                            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        )
                    },
                    {
                        label: 'Total Entities', value: stats.totalEntities, color: 'from-sky-500 to-sky-600', icon: (
                            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        )
                    },
                    {
                        label: 'Total Interactions', value: stats.totalInteractions, color: 'from-indigo-500 to-indigo-600', icon: (
                            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        )
                    },
                    {
                        label: 'Active Policies', value: stats.activePolicies, color: 'from-cyan-500 to-cyan-600', icon: (
                            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        )
                    },
                ].map((stat, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-[24px] bg-linear-to-br ${stat.color} p-6 shadow-xl shadow-gray-200 dark:shadow-none group`}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    {stat.icon}
                                </div>
                                <span className="text-sm font-bold text-white/90 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <div className="text-5xl font-black text-white tracking-tight">{stat.value}</div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-8">
                {/* User Activity Logs Table */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">User Activity Logs</h3>
                            <p className="text-sm text-gray-500">Track user actions and system events</p>
                        </div>
                        <button
                            onClick={fetchLogs}
                            className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                            Refresh Logs
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <input
                            type="text"
                            name="employeeName"
                            placeholder="Filter by Name"
                            value={logFilters.employeeName}
                            onChange={handleFilterChange}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <select
                            name="entity"
                            value={logFilters.entity}
                            onChange={handleFilterChange}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Entities</option>
                            {entities.map(ent => (
                                <option key={ent._id} value={ent.name}>{ent.name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="startDate"
                            value={logFilters.startDate}
                            onChange={handleFilterChange}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={logFilters.endDate}
                            onChange={handleFilterChange}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            onClick={fetchLogs}
                            className="md:col-span-4 bg-zuari-navy text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-[#122856] transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <tr className="border-b border-gray-100 dark:border-slate-700">
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">S.No.</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Log Description</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Entity</th>
                                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {logs.map((log, index) => (
                                    <tr key={log._id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs" title={log.logDescription}>
                                                {log.logDescription}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 font-bold">{log.name}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.role === 'admin' ? 'bg-purple-50 text-purple-600' : log.role === 'superAdmin' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {log.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">{log.entity}</td>
                                        <td className="py-3 px-4 text-right text-xs text-gray-400 font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && !logsLoading && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-400">No activity logs found matching criteria.</td>
                                    </tr>
                                )}
                                {logsLoading && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-400">Loading logs...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SuperAdminDashboard;
