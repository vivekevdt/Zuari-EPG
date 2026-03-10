import React, { useState, useEffect, useCallback } from 'react';
import {
    getInsightsAdoption,
    getInsightsThemes,
    getInsightsGaps,
    getInsightsGapQueue,
    flagInsightsGap,
    unflagInsightsGap,
    getInsightsDemand,
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

const StatCard = ({ label, value, delta, subText, color }) => {
    const colors = {
        blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
        green: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800',
        amber: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800',
        red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
    };
    const deltaColors = { up: 'text-emerald-600 dark:text-emerald-400', down: 'text-red-500 dark:text-red-400', neutral: 'text-slate-500 dark:text-slate-400' };
    const deltaSymbols = { up: '↑', down: '↓', neutral: '→' };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{label}</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white mb-3">{value !== undefined ? value : '—'}</div>
            {delta && (
                <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-1.5 items-center flex-wrap">
                    <span className={`font-bold ${deltaColors[delta.type]}`}>{deltaSymbols[delta.type]} {delta.value}{delta.type !== 'neutral' ? '%' : ''}</span>
                    <span>{subText}</span>
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminInsights = () => {
    const [entity, setEntity] = useState('all');
    const [period] = useState('7');
    const [gapFilter, setGapFilter] = useState('all');
    const [entities, setEntities] = useState([]);

    // Load entity list from DB once on mount
    useEffect(() => {
        getInsightsEntities().then(setEntities).catch(console.error);
    }, []);

    const [adoption, setAdoption] = useState(null);
    const [themes, setThemes] = useState([]);
    const [gaps, setGaps] = useState([]);
    const [queue, setQueue] = useState([]);
    const [demand, setDemand] = useState([]);

    const [loadingAdoption, setLoadingAdoption] = useState(true);
    const [loadingThemes, setLoadingThemes] = useState(true);
    const [loadingGaps, setLoadingGaps] = useState(true);
    const [loadingDemand, setLoadingDemand] = useState(true);

    const fetchAdoption = useCallback(async () => {
        setLoadingAdoption(true);
        try {
            const data = await getInsightsAdoption({ entity, period });
            setAdoption(data);
        } catch (err) { console.error(err); }
        finally { setLoadingAdoption(false); }
    }, [entity, period]);

    const fetchThemes = useCallback(async () => {
        setLoadingThemes(true);
        try {
            const data = await getInsightsThemes({ entity, period });
            setThemes(data || []);
        } catch (err) { console.error(err); }
        finally { setLoadingThemes(false); }
    }, [entity, period]);

    const fetchGaps = useCallback(async () => {
        setLoadingGaps(true);
        try {
            const [gapsData, queueData] = await Promise.all([
                getInsightsGaps({ entity, period }),
                getInsightsGapQueue()
            ]);
            setGaps(gapsData || []);
            setQueue(queueData || []);
        } catch (err) { console.error(err); }
        finally { setLoadingGaps(false); }
    }, [entity, period]);

    const fetchDemand = useCallback(async () => {
        setLoadingDemand(true);
        try {
            const data = await getInsightsDemand({ entity, period });
            setDemand(data || []);
        } catch (err) { console.error(err); }
        finally { setLoadingDemand(false); }
    }, [entity, period]);

    useEffect(() => {
        fetchAdoption();
        fetchThemes();
        fetchGaps();
        fetchDemand();
    }, [fetchAdoption, fetchThemes, fetchGaps, fetchDemand]);

    const handleFlag = async (gap) => {
        try {
            await flagInsightsGap(gap.id, {
                question: gap.question,
                entity: gap.entity,
                level: gap.level
            });
            const queueData = await getInsightsGapQueue();
            setQueue(queueData || []);
        } catch (e) { console.error(e); }
    };

    const handleUnflag = async (flagId) => {
        try {
            await unflagInsightsGap(flagId);
            setQueue(prev => prev.filter(q => q._id !== flagId));
        } catch (e) { console.error(e); }
    };

    const flaggedFeedbackIds = new Set(queue.map(q => String(q.feedbackId)));
    const filteredGaps = gapFilter === 'all' ? gaps : gaps.filter(g => g.type === gapFilter);
    const visibleThemes = themes.filter(t => t.currentCount > 0);

    const periodLabel = 'vs previous week';

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
                    {/* Period filter removed as per user request */}
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
                            />
                            <StatCard
                                label="AI Resolution Rate"
                                value={`${adoption.aiResolutionRate?.value}%`}
                                delta={adoption.aiResolutionRate?.delta}
                                subText={`resolved by AI ${periodLabel}`}
                                color="green"
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
                            />
                            <StatCard
                                label="Human Handoff Rate"
                                value={`${adoption.humanHandoffRate?.value}%`}
                                delta={adoption.humanHandoffRate?.delta}
                                subText={`escalated to HR ${periodLabel}`}
                                color="red"
                            />
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">User Feedback</div>
                                <div className="flex items-end gap-4 mb-3">
                                    <div>
                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{adoption.userFeedback?.helpful || 0}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Helpful</div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                    <div>
                                        <div className="text-2xl font-black text-red-500 dark:text-red-400 leading-none">{adoption.userFeedback?.unhelpful || 0}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Unhelpful</div>
                                    </div>
                                </div>
                                <div className="text-[9px] text-slate-400 flex gap-2">
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
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Daily Query Volume</span>
                                    <span className="text-[10px] text-slate-400">Last 7 days</span>
                                </div>
                                {adoption.dailyVolume?.length > 0 ? (
                                    <>
                                        <div className="flex items-end gap-1 h-16 mb-2">
                                            {adoption.dailyVolume.map((d, i) => {
                                                const maxVal = Math.max(...adoption.dailyVolume.map(x => x.count), 1);
                                                const h = d.count === 0 ? 2 : Math.round((d.count / maxVal) * 56) + 4;
                                                const isToday = i === adoption.dailyVolume.length - 1;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.count} queries`}>
                                                        <div style={{ height: h }} className={`w-full rounded-t-md transition-all ${isToday ? 'bg-slate-200 dark:bg-slate-600' : 'bg-blue-500 dark:bg-blue-600'}`}></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex">
                                            {adoption.dailyVolume.map((d, i) => <div key={i} className="flex-1 text-center text-[9px] text-slate-400">{d.day}</div>)}
                                        </div>
                                    </>
                                ) : <p className="text-xs text-slate-400 py-6 text-center">No query data for this period.</p>}

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
                                            <div className="relative w-36 h-36">
                                                <svg width="144" height="144" viewBox="0 0 100 100">
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
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">
                                                        {adoption.policyAccess.reduce((a, b) => a + b.count, 0)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">queries</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col gap-2.5">
                                                {adoption.policyAccess.slice(0, 5).map((entry, i) => {
                                                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];
                                                    return (
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
                                                    );
                                                })}
                                                {adoption.policyAccess.length > 5 && (
                                                    <div className="flex items-center justify-between w-full group opacity-60">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Other Topics</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-2">
                                                            {adoption.policyAccess.slice(5).reduce((acc, curr) => acc + curr.percentage, 0)}%
                                                        </span>
                                                    </div>
                                                )}
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

            {/* ── 02 Question Themes ── */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">02 — Question Themes</span>
                </div>
                {loadingThemes ? <Spinner /> : visibleThemes.length === 0 ? (
                    <EmptyState icon="🔍" title="No themes yet" desc="Themes are derived from employee questions. Send a few messages to see them here." hint="💡 Typically visible after ~20 conversations." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleThemes.map(t => {
                            const delta = t.currentCount - t.prevCount;
                            const deltaAbs = Math.abs(delta);
                            const hasActivity = t.currentCount > 0 || t.prevCount > 0;
                            return (
                                <div key={t.name} className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 hover:shadow-md transition-all ${hasActivity ? 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700' : 'border-dashed border-slate-200 dark:border-slate-700 opacity-60'}`}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <span className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{t.name}</span>
                                        <TrendBadge trend={t.trend} />
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mb-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${t.pct}%` }} />
                                    </div>

                                    {/* Count comparison: current vs previous */}
                                    <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2.5 mb-3">
                                        <div className="text-center">
                                            <div className="text-xl font-black text-slate-900 dark:text-white leading-none">{t.currentCount}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">This Week</div>
                                        </div>
                                        <div className={`text-base font-black ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                            {delta > 0 ? `↑ +${deltaAbs}` : delta < 0 ? `↓ ${deltaAbs}` : '→'}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-black text-slate-400 dark:text-slate-500 leading-none">{t.prevCount}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Prev Week</div>
                                        </div>
                                    </div>

                                    {/* Sample question */}
                                    {t.sample
                                        ? <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate" title={t.sample}>{t.sample}</p>
                                        : <p className="text-xs text-slate-300 dark:text-slate-600 italic">No questions yet in this period</p>
                                    }
                                </div>
                            );
                        })}
                    </div>

                )}
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* ── 03 Policy Gap Signals ── */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">03 — Policy Gap Signals</span>
                    <span className="text-xs text-slate-400">{gaps.length} signal{gaps.length !== 1 ? 's' : ''} found</span>
                </div>
                {loadingGaps ? <Spinner /> : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                        {/* Gap list */}
                        <div>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {[['all', `All (${gaps.length})`], ['unhelpful', `Rated Unhelpful (${gaps.filter(g => g.type === 'unhelpful').length})`]].map(([val, label]) => (
                                    <button key={val} onClick={() => setGapFilter(val)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${gapFilter === val ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {filteredGaps.length === 0 ? (
                                <EmptyState icon="✅" title="No gap signals" desc="Gap signals appear when employees rate AI responses as unhelpful." hint="Keep improving your policies to maintain a clean gap signal list!" />
                            ) : (
                                <div className="space-y-3">
                                    {filteredGaps.map(g => {
                                        const isFlagged = flaggedFeedbackIds.has(String(g.id));
                                        return (
                                            <div key={g.id} className="flex items-start gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                                                <div className="text-xl shrink-0 mt-0.5">👎</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1.5 break-words">{g.question}</p>
                                                    <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-400">
                                                        {g.entity && <span>🏢 {g.entity}</span>}
                                                        {g.level && <span>👤 {g.level}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Rated Unhelpful</span>
                                                    <button
                                                        onClick={() => !isFlagged && handleFlag(g)}
                                                        disabled={isFlagged}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isFlagged ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 cursor-default' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 cursor-pointer'}`}
                                                    >
                                                        {isFlagged ? '✓ Flagged' : '🚩 Flag'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Flag queue */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">🚩 Flagged for Revision</span>
                                <span className="text-[10px] text-slate-400">{queue.length} item{queue.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 min-h-[200px]">
                                {queue.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-center">
                                        <div className="text-3xl mb-2">🚩</div>
                                        <p className="text-xs">No items flagged yet.<br />Flag gaps from the list to queue them.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {queue.map(q => (
                                            <div key={q._id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug break-words">{q.question}</p>
                                                    <button onClick={() => handleUnflag(q._id)} className="text-slate-300 dark:text-slate-500 hover:text-red-400 transition-colors shrink-0 text-xs cursor-pointer">✕</button>
                                                </div>
                                                <div className="flex gap-2 text-[10px] text-slate-400 flex-wrap">
                                                    {q.entity && <span>🏢 {q.entity}</span>}
                                                    {q.level && <span>👤 {q.level}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* ── 04 Unanswered Demand ── */}
            <section>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">04 — Unanswered Demand</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Topics employees ask about that aren't covered by existing policies</p>
                {loadingDemand ? <Spinner /> : demand.length === 0 ? (
                    <EmptyState icon="🎉" title="No unanswered demand detected" desc="All questions appear to be handled by existing policies." hint="Great sign! Keep your policies up-to-date to maintain this." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {demand.map(d => (
                            <div key={d.theme} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${d.strength === 'high' ? 'text-red-500' : d.strength === 'medium' ? 'text-amber-500' : 'text-slate-400'}`}>
                                    ● {d.strength === 'high' ? 'High Signal' : d.strength === 'medium' ? 'Medium Signal' : 'Low Signal'}
                                </span>
                                <p className="text-base font-black text-slate-900 dark:text-white mt-1 mb-1">{d.theme}</p>
                                <p className="text-xs text-slate-400 mb-3">{d.count} employee{d.count !== 1 ? 's' : ''} asked about this</p>
                                <div className="space-y-1.5 mb-4">
                                    {d.samples.map((s, i) => <p key={i} className="text-xs text-slate-500 dark:text-slate-400 italic">"{s}"</p>)}
                                </div>
                                {d.segments?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {d.segments.map(seg => <span key={seg} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{seg}</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminInsights;
