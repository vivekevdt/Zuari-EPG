import React, { useState, useEffect } from "react";
import { getEntities, getPolicies } from "../../api";

const SuperAdminVectorDb = () => {
    const [data, setData] = useState([]);
    const [dbSize, setDbSize] = useState('0 Bytes');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [entities, setEntities] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState("");
    const [selectedPolicy, setSelectedPolicy] = useState("");

    const [filteredPolicies, setFilteredPolicies] = useState([]);

    useEffect(() => {
        // Fetch entities and policies for filters
        const fetchFilters = async () => {
            try {
                const [entitiesData, policiesData] = await Promise.all([
                    getEntities(),
                    getPolicies()
                ]);
                setEntities(entitiesData);
                setPolicies(policiesData);
            } catch (err) {
                console.error("Error fetching filter options:", err);
            }
        };

        fetchFilters();
        fetchVectorData(); // Initial load
    }, []);

    // Effect to filter policies based on selected entity
    useEffect(() => {
        if (selectedEntity && selectedEntity !== "All Entities") {
            const relevant = policies.filter(p => p.entity === selectedEntity);
            setFilteredPolicies(relevant);
            // Reset policy selection if it doesn't belong to new entity
            if (selectedPolicy && !relevant.find(p => p.title === selectedPolicy)) {
                setSelectedPolicy("");
            }
        } else {
            setFilteredPolicies(policies);
        }
    }, [selectedEntity, policies]);

    const fetchVectorData = () => {
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_BACKEND_URL || "";
        let url = new URL(`${API_URL}/api/super-admin/vector-db`);
        const params = new URLSearchParams();
        if (selectedEntity) params.append("entity", selectedEntity);
        if (selectedPolicy) params.append("policy", selectedPolicy);
        url.search = params.toString();

        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;

        fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((data) => {
                setData(data.data || []);
                setDbSize(data.dbSize || 'Unknown');
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    const [selectedRow, setSelectedRow] = useState(null);

    const handleApplyFilters = () => {
        fetchVectorData();
    };

    const handleClearFilters = () => {
        setSelectedEntity("");
        setSelectedPolicy("");
    };

    return (
        <div className="space-y-8 animate-up h-full flex flex-col relative">
            {/* Detail Modal */}
            {selectedRow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedRow(null)}>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-600 max-w-2xl w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {selectedRow.policy}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedRow.heading} • {selectedRow.entity || "Global"}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRow(null)}
                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {selectedRow.content}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                            <span className="text-xs text-gray-400 font-mono">ID: {selectedRow.id}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-end justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">Vector Database Visualizer</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monitor and inspect stored embeddings.</p>
                </div>
                <div className="flex gap-4 text-sm font-medium text-gray-500">
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-100 dark:border-slate-700">
                        Total Records: <span className="text-zuari-navy font-bold">{data.length}</span>
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-100 dark:border-slate-700">
                        Disk Usage: <span className="text-zuari-navy font-bold">{dbSize}</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 shrink-0">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Entity</label>
                        <select
                            value={selectedEntity}
                            onChange={(e) => setSelectedEntity(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Entities</option>
                            {entities.map(ent => (
                                <option key={ent._id} value={ent.name}>{ent.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Policy</label>
                        <select
                            value={selectedPolicy}
                            onChange={(e) => setSelectedPolicy(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={!selectedEntity && policies.length > 50} // Optional filtering hint? No, just let them pick.
                        >
                            <option value="">All Policies</option>
                            {filteredPolicies.map(pol => (
                                <option key={pol._id} value={pol.title}>{pol.title}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleApplyFilters}
                        className="px-6 py-3 bg-zuari-navy text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#122856] transition-all active:scale-95 whitespace-nowrap"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={() => {
                            setSelectedEntity("");
                            setSelectedPolicy("");
                        }}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-slate-800 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">Loading data...</div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center text-red-500">Error: {error}</div>
                ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar p-1">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10 shadow-sm">
                                <tr className="text-left">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">Entity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">Policy</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">Heading</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">Content Preview</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer relative"
                                        onClick={() => setSelectedRow(row)}
                                    >
                                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{row.id || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {row.entity || "Global"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-200">{row.policy}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{row.heading || "Section"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate" title={row.content}>
                                            {row.content}
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No records found matching filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminVectorDb;
