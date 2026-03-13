import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import {
    getInsightsAdoption,
    getInsightsThematicClusters,
    getInsightsEntities,
} from '../../api';

// ── Shared UI Helpers ─────────────────────────────────────────────────────────
const Spinner = () => (
    <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

const EmptyState = ({ icon, title, desc, hint }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <p className="font-semibold text-slate-600 dark:text-slate-300 text-base mb-1">{title}</p>
        <p className="text-sm mb-2">{desc}</p>
        {hint && <p className="text-xs text-blue-400 italic">{hint}</p>}
    </div>
);

const TrendBadge = ({ trend }) => {
    if (trend === 'up') return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">↑ Rising</span>;
    if (trend === 'down') return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">↓ Declining</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full">→ Stable</span>;
};

const statColors = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
    green: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800',
    amber: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800',
    red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
};

const StatCard = ({ label, value, delta, subText, color, info }) => {
    const deltaColors = { up: 'text-emerald-600 dark:text-emerald-400', down: 'text-red-500 dark:text-red-400', neutral: 'text-slate-500 dark:text-slate-400' };
    const deltaSymbols = { up: '↑', down: '↓', neutral: '→' };

    const displayDelta = delta?.value 

    return (
        <div className={`bg-gradient-to-br ${statColors[color]} border rounded-2xl p-4 shadow-sm flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-1 relative z-10">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</div>
                {info && (
                    <div title={info} className="cursor-help p-1 bg-white/50 dark:bg-slate-800/50 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0 -mt-1 -mr-1">
                        <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                )}
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">{value !== undefined ? value : '—'}</div>
            {delta && (
                <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-1.5 items-center flex-wrap mt-auto">
                    <span className={`font-bold ${deltaColors[delta.type]}`}>{deltaSymbols[delta.type]} {displayDelta}{delta.type !== 'neutral' ? '%' : ''}</span>
                    <span>{subText}</span>
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminInsights = () => {
    const [entity, setEntity] = useState('all');
    const [period, setPeriod] = useState('7');
    const [entities, setEntities] = useState([]);

    // Load entity list from DB once on mount
    useEffect(() => {
        getInsightsEntities().then(setEntities).catch(console.error);
    }, []);

    const [adoption, setAdoption] = useState(null);
    const [loadingAdoption, setLoadingAdoption] = useState(true);

    const [clustersData, setClustersData] = useState({ resolved: [], gaps: [] });
    const [loadingClusters, setLoadingClusters] = useState(true);

    const [activeTab, setActiveTab] = useState('resolved');
    const [selectedClusterIdx, setSelectedClusterIdx] = useState(0);

    const fetchAdoption = useCallback(async () => {
        setLoadingAdoption(true);
        try {
            const data = await getInsightsAdoption({ entity, period });
            setAdoption(data);
        } catch (err) { console.error(err); }
        finally { setLoadingAdoption(false); }
    }, [entity, period]);

    const fetchClusters = useCallback(async () => {
        setLoadingClusters(true);
        try {
            const data = await getInsightsThematicClusters({ entity, period });
            setClustersData(data || { resolved: [], gaps: [] });
            setSelectedClusterIdx(0); // reset selection when data changes
        } catch (err) { console.error(err); }
        finally { setLoadingClusters(false); }
    }, [entity, period]);

    useEffect(() => {
        fetchAdoption();
        fetchClusters();
    }, [fetchAdoption, fetchClusters]);

    const getPeriodLabel = () => {
        if (period === '7') return 'vs previous week';
        if (period === '90') return 'vs previous quarter';
        if (period === 'year') return 'vs previous year';
        return '';
    };

    const periodLabel = getPeriodLabel();

    // compute current active clusters list
    const activeList = activeTab === 'resolved' ? clustersData.resolved : clustersData.gaps;
    const activeClusterInfo = activeList[selectedClusterIdx];

    return (
        <div className="space-y-10 pb-12 min-h-full">
            {/* ── Topbar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Insights</h1>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-0.5">/ Policy Analytics</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entity</span>
                        <select value={entity} onChange={e => setEntity(e.target.value)} className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer text-sm">
                            <option value="all">All Entities</option>
                            {entities.map(e => (
                                <option key={e._id} value={e.name}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all group/period">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Time Range</span>
                        <select 
                            value={period} 
                            onChange={e => setPeriod(e.target.value)} 
                            className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer text-sm focus:text-blue-600 dark:focus:text-blue-400 transition-colors py-0.5"
                            style={{ colorScheme: 'dark' }}
                        >
                            <option value="7" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Last 7 Days</option>
                            <option value="90" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Last 90 Days</option>
                            <option value="year" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">This Year</option>
                            <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Time</option>
                        </select>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-2 rounded-xl shadow-md shadow-emerald-400/30">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Live
                    </span>
                </div>
            </div>

            {/* ── 01 Adoption Overview ── */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">01 — Adoption Overview</span>
                </div>
                {loadingAdoption ? <Spinner /> : !adoption ? (
                    <EmptyState icon="📊" title="No data yet" desc="Conversations will appear here once employees start chatting." />
                ) : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            <StatCard
                                label="Total Inquiries"
                                value={adoption.totalInquiries?.value}
                                delta={adoption.totalInquiries?.delta}
                                subText={`unique sessions ${periodLabel}`}
                                color="blue"
                                info="Total number of unique user sessions recorded."
                            />
                            <StatCard
                                label="AI Resolution Rate"
                                value={`${adoption.aiResolutionRate?.value}%`}
                                delta={adoption.aiResolutionRate?.delta}
                                subText={`resolved by AI ${periodLabel}`}
                                color="green"
                                info="Percentage of inquiries successfully resolved by the AI without human intervention."
                            />
                            <StatCard
                                label="HR Time Saved"
                                value={(() => {
                                    const mins = adoption.hrTimeSaved?.value || 0;
                                    if (mins < 60) return `${mins}m`;
                                    const hrs = Math.floor(mins / 60);
                                    const remainingMins = mins % 60;
                                    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
                                })()}
                                delta={adoption.hrTimeSaved?.delta}
                                subText={`efficiency gain ${periodLabel}`}
                                color="amber"
                                info="Estimated total HR time saved by automating resolutions."
                            />
                            <StatCard
                                label="Human Handoff Rate"
                                value={`${adoption.humanHandoffRate?.value}%`}
                                delta={adoption.humanHandoffRate?.delta}
                                subText={`escalated to HR ${periodLabel}`}
                                color="red"
                                info="Percentage of inquiries escalated to human HR representatives."
                            />

                            <div className={`bg-gradient-to-br ${statColors.purple} border rounded-2xl p-4 shadow-sm flex flex-col justify-between`}>
                                <div className="flex justify-between items-start mb-1 relative z-10">
                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
                                        User Feedback
                                    </div>
                                    <div title="Thumbs up vs Thumbs down responses recorded from employees." className="cursor-help p-1 bg-white/50 dark:bg-slate-800/50 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0 -mt-1 -mr-1">
                                        <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                    </div>
                                </div>
                                <div className="flex justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{adoption.userFeedback?.helpful || 0}</div>
                                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider">Helpful</div>
                                    </div>
                                    <div className="h-8 w-px bg-purple-200 dark:bg-purple-800/50"></div>
                                    <div className="flex-1 text-right">
                                        <div className="text-4xl font-black text-red-500 dark:text-red-400 leading-none">{adoption.userFeedback?.unhelpful || 0}</div>
                                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider text-right">Unhelpful</div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-400 flex gap-2 mt-auto">
                                    <span className={adoption.userFeedback?.helpfulDelta?.type === 'up' ? 'text-emerald-500 font-bold' : ''}>
                                        {adoption.userFeedback?.helpfulDelta?.type === 'up' && '↑'} {adoption.userFeedback?.helpfulDelta?.value}% Helpful
                                    </span>
                                    <span>•</span>
                                    <span>{periodLabel}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Daily Volume */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        {period === '7' ? 'Daily' : period === '90' ? 'Weekly' : 'Monthly'} Query Volume
                                    </span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                        {period === '7' ? 'Last 7 Days' : period === '90' ? 'Last 13 Weeks' : 'Trend Analysis'}
                                    </span>
                                </div>
                                {adoption.dailyVolume?.length > 0 ? (
                                    <>
                                        <div className="h-40 relative flex items-end gap-2 mb-4 px-1">
                                            {/* Background Grid Lines for a premium feel */}
                                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className="w-full h-px bg-slate-900 dark:bg-white" />
                                                ))}
                                            </div>

                                            {/* Bars */}
                                            {adoption.dailyVolume.map((d, i) => {
                                                const maxVal = Math.max(...adoption.dailyVolume.map(x => x.count), 1);
                                                const h = d.count === 0 ? 4 : Math.round((d.count / maxVal) * 150) + 6;
                                                const isToday = i === adoption.dailyVolume.length - 1;

                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                        {/* Tooltip on Hover */}
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl border border-slate-700 dark:border-slate-200 translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                                                            <div className="text-[8px] opacity-60 mb-0.5">{period === '7' ? 'Day' : period === '90' ? 'Week of' : 'Month'}</div>
                                                            {d.day} — {d.count} inquiries
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45 border-r border-b border-slate-700 dark:border-slate-200"></div>
                                                        </div>

                                                        {/* Bar with Gradient and Animation */}
                                                        <div
                                                            style={{ height: `${h}px`, animationDelay: `${i * 0.05}s` }}
                                                            className={`w-full rounded-t-lg transition-all duration-300 relative overflow-hidden group-hover:brightness-110 group-hover:shadow-lg group-hover:shadow-blue-500/20 animate-grow ${isToday
                                                                ? 'bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600'
                                                                : 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 dark:from-blue-700 dark:via-blue-600 dark:to-blue-500'
                                                                }`}
                                                        >
                                                            {/* Subtle reflection effect for premium look */}
                                                            <div className="absolute top-0 left-0 w-full h-[50%] bg-white/10 opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex mt-2">
                                            {adoption.dailyVolume.map((d, i) => (
                                                <div key={i} className="flex-1 text-center font-black text-[9px] text-slate-400 uppercase tracking-widest leading-none">
                                                    {d.day}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-slate-400 py-12 text-center italic">No query data for this period.</p>
                                )}

                                {adoption.byLevel?.length > 0 && (
                                    <div className="mt-5 space-y-2">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Queries by Employee Level</div>
                                        {adoption.byLevel.map(({ name, pct }) => (
                                            <div key={name} className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 w-32 shrink-0 truncate">{name}</span>
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-10 text-right">{pct}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Most Accessed Policies Donut */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">MOST ACCESSED POLICIES</div>
                                <div className="flex-1 flex items-center justify-between gap-6">
                                    {adoption.policyAccess?.length > 0 ? (
                                        <>
                                            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                                    {/* Background track (darker for that high-contrast look) */}
                                                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" className="dark:stroke-slate-700" strokeWidth="12" />

                                                    {(() => {
                                                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6', '#f97316', '#64748b'];
                                                        const circ = 2 * Math.PI * 38;
                                                        let currentOffset = 0;

                                                        return adoption.policyAccess.map((entry, i) => {
                                                            const dashLength = (entry.percentage / 100) * circ;
                                                            const offset = currentOffset;
                                                            currentOffset -= dashLength;

                                                            if (entry.percentage <= 0) return null;

                                                            return (
                                                                <circle
                                                                    key={entry.name}
                                                                    cx="50"
                                                                    cy="50"
                                                                    r="38"
                                                                    fill="none"
                                                                    stroke={colors[i % colors.length]}
                                                                    strokeWidth="12"
                                                                    strokeDasharray={`${dashLength} ${circ}`}
                                                                    strokeDashoffset={offset}
                                                                    transform="rotate(-90 50 50)"
                                                                    style={{ transition: 'all 1s ease' }}
                                                                />
                                                            );
                                                        });
                                                    })()}
                                                </svg>
                                                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none mt-1">
                                                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">
                                                        {adoption.policyAccess.reduce((a, b) => a + b.count, 0)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">queries</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col gap-2.5">
                                                {(() => {
                                                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];
                                                    const otherPolicy = adoption.policyAccess.find(p => p.name === 'Other');
                                                    const mainPolicies = adoption.policyAccess.filter(p => p.name !== 'Other');
                                                    const topMain = mainPolicies.slice(0, 5);
                                                    const remainingMain = mainPolicies.slice(5);
                                                    const otherTopicsPct = remainingMain.reduce((acc, curr) => acc + curr.percentage, 0);

                                                    return (
                                                        <>
                                                            {topMain.map((entry, i) => (
                                                                <div key={entry.name} className="flex items-center justify-between w-full group">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div>
                                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">
                                                                            {entry.name}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-2">
                                                                        {entry.percentage}%
                                                                    </span>
                                                                </div>
                                                            ))}

                                                            {otherTopicsPct > 0 && (
                                                                <div className="flex items-center justify-between w-full group opacity-60">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Other Topics</span>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-2">
                                                                        {otherTopicsPct}%
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {otherPolicy && (
                                                                <div className="flex items-center justify-between w-full group pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                                                        <span className="text-xs text-slate-700 dark:text-slate-200 font-bold truncate max-w-[120px]">
                                                                            {otherPolicy.name}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-2">
                                                                        {otherPolicy.percentage}%
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            <p className="text-xs text-slate-400">No policy access data yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* ── 02 Thematic Clusters ── */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">02 — Thematic Clusters</span>
                </div>

                {loadingClusters ? <Spinner /> : (clustersData.resolved.length === 0 && clustersData.gaps.length === 0) ? (
                    <EmptyState icon="🔍" title="No clusters yet" desc="Clusters are derived from employee questions." hint="💡 Typically visible after a few conversations." />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-6">

                        {/* Left Column: Tabs & List */}
                        <div className="flex flex-col gap-4">
                            {/* Tabs */}
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => { setActiveTab('resolved'); setSelectedClusterIdx(0); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'resolved' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                >
                                    <span className="text-sm">✓</span> Resolved
                                </button>
                                <button
                                    onClick={() => { setActiveTab('gaps'); setSelectedClusterIdx(0); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'gaps' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                >
                                    <span className="text-sm text-slate-400">✕</span> Gaps
                                </button>
                            </div>

                            {/* List of Clusters */}
                            <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                                {activeList.length === 0 ? (
                                    <div className="py-10 text-center text-xs text-slate-400">No {activeTab} clusters found.</div>
                                ) : (
                                    activeList.map((cluster, idx) => {
                                        const isSelected = idx === selectedClusterIdx;

                                        return (
                                            <div
                                                key={cluster.name}
                                                onClick={() => setSelectedClusterIdx(idx)}
                                                className={`shrink-0 cursor-pointer border rounded-2xl p-4 transition-all relative overflow-hidden ${isSelected ? (activeTab === 'resolved' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-500/50' : 'border-red-500 bg-red-50/50 dark:bg-red-900/10 dark:border-red-500/50') : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                            >
                                                {/* Left accent line for selected */}
                                                {isSelected && (
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTab === 'resolved' ? 'bg-blue-500' : 'bg-red-500'}`} />
                                                )}

                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">{cluster.name}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'resolved' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {cluster.count} {activeTab === 'resolved' ? 'Solved' : 'Gaps'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${activeTab === 'resolved' ? 'bg-blue-500' : 'bg-red-500'}`}
                                                            style={{ width: `${cluster.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500">{cluster.percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 relative flex flex-col">
                            {!activeClusterInfo ? (
                                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                                    Select a cluster to view details
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 ${activeTab === 'resolved' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                                {activeTab === 'resolved' ? 'HIGH VALUE CLUSTER' : 'PRIORITY GAP CLUSTER'}
                                            </span>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{activeClusterInfo.name}</h2>
                                            {activeTab === 'gaps' && (
                                                <p className="text-sm font-semibold text-red-500 mt-2">Missing content causing AI fallbacks</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-baseline gap-1 justify-end">
                                                <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{activeClusterInfo.count}</span>
                                            </div>
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                                                {activeTab === 'resolved' ? 'RESOLUTIONS' : 'GAPS'}
                                            </div>
                                            <div className={`h-1 w-full mt-2 rounded-full ${activeTab === 'resolved' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                        </div>
                                    </div>

                                    {/* Line Separator */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                            {activeTab === 'resolved' ? 'SUCCESSFUL EMPLOYEE INQUIRIES' : 'UNANSWERED EMPLOYEE QUERIES'}
                                        </span>
                                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                                    </div>

                                    {/* Samples List */}
                                    <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar pr-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 backdrop-blur-sm">
                                                <tr>
                                                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 w-12 text-center">Status</th>
                                                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 w-1/3">Query</th>
                                                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Response</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                {activeClusterInfo.samples.map((sample, idx) => {
                                                    const isObject = typeof sample === 'object' && sample !== null;
                                                    const question = isObject ? sample.question : sample;
                                                    const responseContent = isObject ? sample.response : "N/A";

                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                                            <td className="py-3 px-4 align-middle text-center">
                                                                <div className={`w-6 h-6 rounded-full inline-flex items-center justify-center shrink-0 ${activeTab === 'resolved' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-50 text-red-500 dark:bg-red-900/40 dark:text-red-400'}`}>
                                                                    {activeTab === 'resolved' ? '✓' : '✕'}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 align-top">
                                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">"{question}"</p>
                                                            </td>
                                                            <td className="py-3 px-4 align-top relative">
                                                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                    <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: responseContent }} />

                                                                    {/* Hover Tooltip */}
                                                                    {responseContent !== "N/A" && (
                                                                        <div className="absolute left-4 top-10 z-50 w-80 max-h-64 overflow-y-auto bg-slate-900 dark:bg-slate-700 text-slate-100 dark:text-slate-200 text-xs p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-700 dark:border-slate-600">
                                                                            <div dangerouslySetInnerHTML={{ __html: responseContent }} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer / CTA Frame */}
                                    <div className="mt-8">
                                        {activeTab === 'resolved' && (
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex-wrap gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm shrink-0">
                                                        <span className="text-blue-500 text-lg">✨</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Success Insight</div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">Automated resolution is healthy. No immediate action required for this segment.</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminInsights;
