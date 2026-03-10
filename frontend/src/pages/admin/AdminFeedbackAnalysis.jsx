import React, { useState, useEffect } from 'react';
import { getInsightsFeedbackAnalysis, exportInsightsFeedbackAnalysisCSV } from '../../api';

const AdminFeedbackAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [entityFilter, setEntityFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');

    // Metadata for options
    const [availableEntities, setAvailableEntities] = useState([]);
    const [availableLevels, setAvailableLevels] = useState([]);

    const fetchData = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const result = await getInsightsFeedbackAnalysis({
                entity: entityFilter,
                level: levelFilter,
                search: searchQuery
            });
            setData(result);
            if (result.filters) {
                setAvailableEntities(result.filters.entities || []);
                // Only update availableLevels if entityFilter is 'all' or if the entityFilter matches the current entity
                // This ensures that when an entity is selected, we get levels specific to that entity.
                // When entityFilter is 'all', we get all levels.
                if (entityFilter === 'all' || result.filters.entities.includes(entityFilter)) {
                    setAvailableLevels(result.filters.levels || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch feedback analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchData(true);
    }, []);

    // When entity changes, we MUST fetch to get new levels
    useEffect(() => {
        // Reset level filter whenever entity filter changes
        setLevelFilter('all');
        // Fetch data to get new levels for the selected entity
        // Debounce this fetch slightly to avoid rapid calls if user is quickly changing entities
        const timer = setTimeout(() => {
            fetchData();
        }, 100); // Small debounce for entity changes

        return () => clearTimeout(timer);
    }, [entityFilter]); // Only re-run when entityFilter changes

    const handleReset = () => {
        setSearchQuery('');
        setEntityFilter('all');
        setLevelFilter('all');
        // fetchData will be triggered by entityFilter change to 'all'
    };

    const handleQuery = () => {
        // Debounce search slightly to avoid excessive API calls
        const timer = setTimeout(() => {
            fetchData();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportInsightsFeedbackAnalysisCSV({
                entity: entityFilter,
                level: levelFilter,
                search: searchQuery
            });
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed: " + error.message);
        } finally {
            setExporting(false);
        }
    };

    const getEmojiIcon = (rating) => {
        const r = parseFloat(rating);
        if (r >= 4.5) return '😍';
        if (r >= 3.5) return '😊';
        if (r >= 2.5) return '😐';
        if (r >= 1.5) return '😕';
        return '😡';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const { rating, ratingDelta, hotspots, suggestions, filters } = data || {
        rating: '0.0',
        ratingDelta: '+0.0',
        hotspots: [],
        suggestions: [],
        filters: { entities: [], levels: [] }
    };

    const activeEmojiIndex = Math.round(parseFloat(rating)) - 1;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Feedback Analysis</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        AUTOMATED INTELLIGENCE LAYER • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none disabled:opacity-50"
                    >
                        {exporting ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        )}
                        Export CSV
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">Analytics Live</span>
                    </div>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                {/* Overall Experience */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-[340px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20"></div>

                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 text-center w-full">Overall Experience</label>
                    <div className="flex justify-center gap-4 w-full mb-10">
                        {['😡', '😕', '😐', '😊', '😍'].map((emoji, i) => (
                            <span key={i} className={`text-4xl transition-all duration-300 ${i === activeEmojiIndex ? 'grayscale-0 scale-125 saturate-150 drop-shadow-md' : 'grayscale opacity-25'}`}>
                                {emoji}
                            </span>
                        ))}
                    </div>
                    <div className="text-center">
                        <div className="text-6xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
                            {rating} <span className="text-3xl text-slate-300 font-medium ml-1">/ 5.0</span>
                        </div>
                        <div className={`text-sm font-bold flex items-center justify-center gap-1 ${parseFloat(ratingDelta) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {parseFloat(ratingDelta) >= 0 ? '' : ''}{ratingDelta} <span className="text-slate-400 font-medium">from last month</span>
                        </div>
                    </div>
                </div>

                {/* Improvement Hotspots */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 p-8 shadow-sm min-h-[340px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-8">Improvement Hotspots</label>
                    <div className="space-y-6">
                        {hotspots.length > 0 ? hotspots.map((item, idx) => {
                            const colors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];
                            return (
                                <div key={item.area}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{item.area}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{item.count} mentions</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-50 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                                        <div
                                            className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span className="text-xs font-bold uppercase tracking-widest">No Feedback Data Yet</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden border-b-4 border-b-blue-600">
                <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Specific Employee Suggestions</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Filtering across all feedback data</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Entity Filter */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Entity</label>
                                <div className="relative">
                                    <select
                                        value={entityFilter}
                                        onChange={(e) => setEntityFilter(e.target.value)}
                                        className="pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 dark:text-slate-300 appearance-none min-w-[160px] shadow-sm"
                                    >
                                        <option value="all">All Entities</option>
                                        {availableEntities.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                    <svg className="w-3.5 h-3.5 absolute right-3.5 top-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            {/* Level Filter */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Level</label>
                                <div className="relative">
                                    <select
                                        value={levelFilter}
                                        disabled={entityFilter === 'all'}
                                        onChange={(e) => setLevelFilter(e.target.value)}
                                        className={`pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 dark:text-slate-300 appearance-none min-w-[160px] shadow-sm ${entityFilter === 'all' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        <option value="all">All Levels</option>
                                        {availableLevels.map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                    <svg className="w-3.5 h-3.5 absolute right-3.5 top-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            {/* Name Search */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Name Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all w-48 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 shadow-sm"
                                    />
                                    <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 self-end mb-0.5">
                                <button
                                    onClick={handleQuery}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-blue-200 dark:shadow-none active:scale-95"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="self-end mb-2 ml-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                                    {suggestions.length} Results
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-h-[650px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-700">
                    {suggestions.length > 0 ? suggestions.map((suggestion) => {
                        const dateObj = new Date(suggestion.date);
                        const dateStr = dateObj.toLocaleDateString();
                        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={suggestion.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all flex items-start gap-4 group">
                                <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-slate-200/50 flex-shrink-0">
                                    {getEmojiIcon(suggestion.rating)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-slate-900 dark:text-white tracking-widest uppercase">{suggestion.user || 'Anonymous'}</span>
                                            {suggestion.entity && (
                                                <span className="text-[8px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-widest leading-normal">
                                                    {suggestion.entity}
                                                </span>
                                            )}
                                            {suggestion.level && (
                                                <span className="text-[8px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-widest leading-normal">
                                                    {suggestion.level}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <span className="text-[10px] font-bold">{dateStr}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-[10px] font-bold">{timeStr}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic pr-12 mb-3">
                                        "{suggestion.text}"
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {suggestion.successAreas && suggestion.successAreas.length > 0 && (
                                            <div>
                                                <label className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] block mb-1.5">What we are doing well</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {suggestion.successAreas.map(tag => (
                                                        <span key={tag} className="text-[8px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-2 py-0.5 rounded-md uppercase tracking-wider">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {suggestion.improvementAreas && suggestion.improvementAreas.length > 0 && (
                                            <div>
                                                <label className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] block mb-1.5">What we can improve</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {suggestion.improvementAreas.map(tag => (
                                                        <span key={tag} className="text-[8px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 px-2 py-0.5 rounded-md uppercase tracking-wider">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="p-12 text-center text-slate-400 italic">No suggestions submitted recently.</div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 flex justify-center border-t border-slate-100 dark:border-slate-700">
                    <div className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminFeedbackAnalysis;
