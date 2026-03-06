import React, { useState, useEffect, useCallback } from 'react';
import { getInteractionsAdmin } from '../../api';

const SuperAdminInteractions = () => {
    const [interactions, setInteractions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Filter state
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [impactFilter, setImpactFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Filter options (from backend)
    const [filterOptions, setFilterOptions] = useState({ entities: [], impactLevels: [], categories: [] });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const filters = {};
            if (search) filters.search = search;
            if (entityFilter) filters.entity = entityFilter;
            if (impactFilter) filters.impactLevel = impactFilter;
            if (categoryFilter) filters.empCategory = categoryFilter;

            const result = await getInteractionsAdmin(filters);
            setInteractions(result.data || []);
            setTotal(result.total || 0);
            if (result.filterOptions) setFilterOptions(result.filterOptions);
        } catch (e) {
            setError(e.message || 'Failed to load interactions');
        }
        setLoading(false);
    }, [search, entityFilter, impactFilter, categoryFilter]);

    useEffect(() => {
        const t = setTimeout(fetchData, 400); // debounce search
        return () => clearTimeout(t);
    }, [fetchData]);

    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">User Interactions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} Q&amp;A conversations</p>
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

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative lg:col-span-1">
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

                    {/* Entity */}
                    <select
                        value={entityFilter}
                        onChange={e => setEntityFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                        <option value="">All Entities</option>
                        {filterOptions.entities.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>

                    {/* Impact Level */}
                    <select
                        value={impactFilter}
                        onChange={e => setImpactFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                        <option value="">All Impact Levels</option>
                        {filterOptions.impactLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    {/* Category */}
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                        <option value="">All Categories</option>
                        {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
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
                ) : interactions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-semibold">No interactions found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting the filters or search query</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Entity</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Level</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Category</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Question</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">AI Response (preview)</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                {interactions.map((item) => {
                                    const isExpanded = expandedId === item._id;
                                    return (
                                        <React.Fragment key={item._id}>
                                            <tr
                                                className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                                                onClick={() => setExpandedId(isExpanded ? null : item._id)}
                                            >
                                                {/* User */}
                                                <td className="px-5 py-4 min-w-[160px]">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-zuari-navy flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                            {item.userName?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white leading-tight">{item.userName}</div>
                                                            <div className="text-xs text-gray-400">{item.userMail}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Entity */}
                                                <td className="px-5 py-4">
                                                    {item.userEntity ? (
                                                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold whitespace-nowrap">{item.userEntity}</span>
                                                    ) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                                                </td>
                                                {/* Impact Level */}
                                                <td className="px-5 py-4">
                                                    {item.userImpactLevel ? (
                                                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-semibold whitespace-nowrap">{item.userImpactLevel}</span>
                                                    ) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                                                </td>
                                                {/* Category */}
                                                <td className="px-5 py-4">
                                                    {item.userCategory ? (
                                                        <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-semibold whitespace-nowrap">{item.userCategory}</span>
                                                    ) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                                                </td>
                                                {/* Question */}
                                                <td className="px-5 py-4 max-w-[220px]">
                                                    <p className="text-gray-800 dark:text-gray-200 truncate font-medium">{item.userQuestion}</p>
                                                </td>
                                                {/* AI Response preview */}
                                                <td className="px-5 py-4 max-w-[260px]">
                                                    {item.aiResponse ? (
                                                        <p className="text-gray-500 dark:text-gray-400 truncate text-xs">{stripHtml(item.aiResponse).slice(0, 120)}…</p>
                                                    ) : (
                                                        <span className="text-xs text-gray-300 italic">No response</span>
                                                    )}
                                                </td>
                                                {/* Date */}
                                                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    <br />
                                                    {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>

                                            {/* Expanded Row */}
                                            {isExpanded && (
                                                <tr className="bg-blue-50/40 dark:bg-slate-700/20">
                                                    <td colSpan={7} className="px-6 py-5">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {/* Question */}
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="w-5 h-5 rounded-md bg-zuari-navy flex items-center justify-center shrink-0">
                                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">User Question</span>
                                                                </div>
                                                                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                                                    {item.userQuestion}
                                                                </div>
                                                            </div>

                                                            {/* AI Response */}
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
                                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                        </svg>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">AI Response</span>
                                                                </div>
                                                                {item.aiResponse ? (
                                                                    <div
                                                                        className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200 max-h-52 overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert"
                                                                        dangerouslySetInnerHTML={{ __html: item.aiResponse }}
                                                                    />
                                                                ) : (
                                                                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 text-sm text-gray-400 italic">
                                                                        No AI response recorded
                                                                    </div>
                                                                )}
                                                            </div>
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

            <p className="text-xs text-gray-400 text-center">
                Showing {interactions.length} of {total} interactions · Click any row to expand the full Q&amp;A
            </p>
        </div>
    );
};

export default SuperAdminInteractions;
