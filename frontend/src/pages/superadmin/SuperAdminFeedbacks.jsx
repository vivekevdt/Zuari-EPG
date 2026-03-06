import React, { useState, useEffect, useCallback } from 'react';
import { getFeedbacksAdmin } from '../../api';

const THUMB_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'up', label: '👍 Positive' },
    { value: 'down', label: '👎 Negative' },
];

const SuperAdminFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // filters
    const [search, setSearch] = useState('');
    const [thumbFilter, setThumbFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [impactFilter, setImpactFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // unique option lists derived from data
    const [entities, setEntities] = useState([]);
    const [impactLevels, setImpactLevels] = useState([]);
    const [categories, setCategories] = useState([]);

    // expanded row for description
    const [expandedId, setExpandedId] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const filters = {};
            if (thumbFilter) filters.thumbs = thumbFilter;
            const result = await getFeedbacksAdmin(filters);
            const data = result.data || [];
            setFeedbacks(data);
            setTotal(result.total || data.length);

            // Build unique filter options from returned data
            setEntities([...new Set(data.map(f => f.userEntity).filter(Boolean))]);
            setImpactLevels([...new Set(data.map(f => f.userImpactLevel).filter(Boolean))]);
            setCategories([...new Set(data.map(f => f.userCategory).filter(Boolean))]);
        } catch (e) {
            setError(e.message || 'Failed to load feedbacks');
        }
        setLoading(false);
    }, [thumbFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Client-side filter for search, entity, impact, category
    const filtered = feedbacks.filter(f => {
        const q = search.toLowerCase();
        if (search && !f.userName?.toLowerCase().includes(q) && !f.userMail?.toLowerCase().includes(q)) return false;
        if (entityFilter && f.userEntity !== entityFilter) return false;
        if (impactFilter && f.userImpactLevel !== impactFilter) return false;
        if (categoryFilter && f.userCategory !== categoryFilter) return false;
        return true;
    });

    const thumbStats = {
        up: feedbacks.filter(f => f.thumbs === 'up').length,
        down: feedbacks.filter(f => f.thumbs === 'down').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">User Feedback</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {total} total responses
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zuari-navy hover:bg-[#122856] text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{total}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-green-100 dark:border-green-900/30 p-5 shadow-sm">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">👍 Positive</p>
                    <p className="text-3xl font-black text-green-600">{thumbStats.up}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 p-5 shadow-sm">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">👎 Negative</p>
                    <p className="text-3xl font-black text-red-600">{thumbStats.down}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="relative lg:col-span-2">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Thumbs filter */}
                    <select
                        value={thumbFilter}
                        onChange={e => setThumbFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                        {THUMB_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {/* Entity filter */}
                    <select
                        value={entityFilter}
                        onChange={e => setEntityFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                        <option value="">All Entities</option>
                        {entities.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>

                    {/* Impact Level filter */}
                    <select
                        value={impactFilter}
                        onChange={e => setImpactFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                        <option value="">All Impact Levels</option>
                        {impactLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    {/* Category filter */}
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-semibold">No feedback found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Entity</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Impact Level</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Category</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Question</th>
                                    <th className="text-center px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Rating</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                {filtered.map((fb) => {
                                    const isExpanded = expandedId === fb._id;
                                    return (
                                        <React.Fragment key={fb._id}>
                                            <tr
                                                className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                                                onClick={() => setExpandedId(isExpanded ? null : fb._id)}
                                            >
                                                {/* User */}
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{fb.userName}</div>
                                                    <div className="text-xs text-gray-400">{fb.userMail}</div>
                                                </td>
                                                {/* Entity */}
                                                <td className="px-5 py-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                                                        {fb.userEntity || '—'}
                                                    </span>
                                                </td>
                                                {/* Impact Level */}
                                                <td className="px-5 py-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                                                        {fb.userImpactLevel || '—'}
                                                    </span>
                                                </td>
                                                {/* Category */}
                                                <td className="px-5 py-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                                                        {fb.userCategory || '—'}
                                                    </span>
                                                </td>
                                                {/* Question */}
                                                <td className="px-5 py-4 max-w-[260px]">
                                                    <p className="text-gray-700 dark:text-gray-300 truncate">{fb.userQuestion}</p>
                                                </td>
                                                {/* Rating */}
                                                <td className="px-5 py-4 text-center">
                                                    {fb.thumbs === 'up' ? (
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-base">👍</span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 text-base">👎</span>
                                                    )}
                                                </td>
                                                {/* Date */}
                                                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    <br />
                                                    <span>{new Date(fb.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                            </tr>

                                            {/* Expanded detail row */}
                                            {isExpanded && (
                                                <tr className="bg-blue-50/50 dark:bg-slate-700/20">
                                                    <td colSpan={7} className="px-5 py-5">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">User Question</p>
                                                                <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">{fb.userQuestion}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">AI Response</p>
                                                                <div
                                                                    className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 max-h-40 overflow-y-auto prose prose-sm"
                                                                    dangerouslySetInnerHTML={{ __html: fb.aiResponse }}
                                                                />
                                                            </div>
                                                            {fb.description && (
                                                                <div className="md:col-span-2">
                                                                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">User Feedback Comment</p>
                                                                    <p className="text-sm text-gray-800 dark:text-gray-200 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 p-3 rounded-xl">{fb.description}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-400 text-center">Showing {filtered.length} of {total} records · Click a row to expand details</p>
        </div>
    );
};

export default SuperAdminFeedbacks;
