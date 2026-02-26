import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    getConfigEntities, createConfigEntity, updateConfigEntity, deleteConfigEntity,
    getImpactLevels, createImpactLevel, updateImpactLevel, deleteImpactLevel,
    getEmployeeCategories, createEmployeeCategory, updateEmployeeCategory, deleteEmployeeCategory,
    getPolicyCategories, createPolicyCategory, updatePolicyCategory, deletePolicyCategory,
} from '../../api';

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons = {
    entity: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    impact: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    employee: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    policy: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    plus: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
    ),
    x: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};


// ─── Reusable Table Row (inline edit) ───────────────────────────────────────
const TableRow = ({ item, columns, onEdit, onDelete, editingId, editValues, onEditChange, onSave, onCancel }) => {
    const isEditing = editingId === item._id;
    return (
        <tr className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
            {columns.map(col => (
                <td key={col.key} className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {isEditing && col.editable ? (
                        col.type === 'select' ? (
                            <select
                                value={editValues[col.key] || ''}
                                onChange={e => onEditChange(col.key, e.target.value)}
                                className="w-full p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900 border border-blue-300 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                            >
                                {col.options?.map(opt => (
                                    <option key={opt._id} value={opt._id}>{opt.name} ({opt.entityCode})</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={editValues[col.key] || ''}
                                onChange={e => onEditChange(col.key, e.target.value)}
                                className="w-full p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900 border border-blue-300 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                autoFocus={col.autoFocus}
                            />
                        )
                    ) : (
                        <span className={col.className}>{col.render ? col.render(item) : item[col.key]}</span>
                    )}
                </td>
            ))}
            <td className="py-3 px-4 text-right">
                {isEditing ? (
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={onSave} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">{icons.check}</button>
                        <button onClick={onCancel} className="p-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-300 rounded-lg transition-colors">{icons.x}</button>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">{icons.edit}</button>
                        <button onClick={() => onDelete(item._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">{icons.trash}</button>
                    </div>
                )}
            </td>
        </tr>
    );
};

// ─── Config Table Panel ──────────────────────────────────────────────────────
const ConfigTable = ({ title, icon, accentColor, columns, rows, onAdd, onEdit, onDelete, loading, addForm }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const handleEdit = (item) => {
        setEditingId(item._id);
        const vals = {};
        columns.filter(c => c.editable).forEach(c => {
            // For select columns store the referenced id
            vals[c.key] = c.getValue ? c.getValue(item) : item[c.key];
        });
        setEditValues(vals);
    };

    const handleEditChange = (key, val) => setEditValues(prev => ({ ...prev, [key]: val }));
    const handleCancel = () => { setEditingId(null); setEditValues({}); };
    const handleSave = () => {
        onEdit(editingId, editValues, () => { setEditingId(null); setEditValues({}); });
    };

    const accentMap = {
        blue: 'from-blue-500 to-blue-600',
        amber: 'from-amber-500 to-amber-600',
        emerald: 'from-emerald-500 to-emerald-600',
        purple: 'from-purple-500 to-purple-600',
    };
    const gradient = accentMap[accentColor] || accentMap.blue;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className={`bg-linear-to-r ${gradient} p-6 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-white/70 text-xs">{rows.length} record{rows.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all"
                >
                    {icons.plus}
                    Add New
                </button>
            </div>

            {/* Add Form (inline, shown on demand) */}
            {addForm}

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[285px]">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                ) : rows.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="text-gray-300 dark:text-slate-600 text-4xl mb-3">○</div>
                        <p className="text-gray-400 text-sm">No records yet. Click <strong>Add New</strong> to get started.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-white dark:bg-slate-800 shadow-[0_1px_0_0_rgba(243,244,246,1)] dark:shadow-[0_1px_0_0_rgba(51,65,85,1)]">
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className="py-3 px-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</th>
                                ))}
                                <th className="py-3 px-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                            {rows.map(row => (
                                <TableRow
                                    key={row._id}
                                    item={row}
                                    columns={columns}
                                    onEdit={handleEdit}
                                    onDelete={onDelete}
                                    editingId={editingId}
                                    editValues={editValues}
                                    onEditChange={handleEditChange}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ─── Inline Add Row ──────────────────────────────────────────────────────────
const InlineAddForm = ({ visible, fields, onSubmit, onCancel, submitting }) => {
    const [values, setValues] = useState({});
    useEffect(() => { if (!visible) setValues({}); }, [visible]);
    if (!visible) return null;
    return (
        <div className="border-b border-gray-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10 px-6 py-4">
            <div className="flex flex-wrap items-end gap-3">
                {fields.map(f => (
                    <div key={f.key} className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{f.label}</label>
                        {f.type === 'select' ? (
                            <select
                                value={values[f.key] || ''}
                                onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            >
                                <option value="">Select {f.label}</option>
                                {f.options?.map(opt => (
                                    <option key={opt._id} value={opt._id}>{opt.name} ({opt.entityCode})</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                                value={values[f.key] || ''}
                                onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                autoFocus={f.autoFocus}
                            />
                        )}
                    </div>
                ))}
                <div className="flex gap-2">
                    <button
                        onClick={() => onSubmit(values)}
                        disabled={submitting}
                        className="px-5 py-2.5 bg-zuari-navy hover:bg-[#122856] text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={onCancel} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


// ════════════════════════════════════════════════════════════════════════════
//  Main AdminConfig Page
// ════════════════════════════════════════════════════════════════════════════
const AdminConfig = () => {
    // ── state ────────────────────────────────────────────────────────────────
    const [entities, setEntities] = useState([]);
    const [impactLevels, setImpactLevels] = useState([]);
    const [empCategories, setEmpCategories] = useState([]);
    const [policyCategories, setPolicyCategories] = useState([]);
    const [loading, setLoading] = useState({ entities: true, impact: true, emp: true, policy: true });

    const [showAdd, setShowAdd] = useState({ entities: false, impact: false, emp: false, policy: false });
    const [submitting, setSubmitting] = useState(false);

    // selected entity filter for impact levels
    const [filterEntity, setFilterEntity] = useState('');

    // ── fetch ────────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            const [e, imp, emp, pol] = await Promise.all([
                getConfigEntities(), getImpactLevels(), getEmployeeCategories(), getPolicyCategories()
            ]);
            setEntities(e);
            setImpactLevels(imp);
            setEmpCategories(emp);
            setPolicyCategories(pol);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading({ entities: false, impact: false, emp: false, policy: false });
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const refreshImpact = async (entityId) => {
        const imp = await getImpactLevels(entityId || undefined);
        setImpactLevels(imp);
    };

    // ── generic helpers ──────────────────────────────────────────────────────
    const toggleAdd = (key) => setShowAdd(p => ({ ...p, [key]: !p[key] }));

    // ── ENTITY CRUD ──────────────────────────────────────────────────────────
    const handleAddEntity = async (vals) => {
        if (!vals.name || !vals.entityCode) return toast.error('Name and entity code are required');
        setSubmitting(true);
        try {
            const created = await createConfigEntity(vals);
            setEntities(p => [created, ...p]);
            setShowAdd(p => ({ ...p, entities: false }));
            toast.success('Entity created');
        } catch (e) { toast.error(e.message); } finally { setSubmitting(false); }
    };
    const handleEditEntity = async (id, vals, done) => {
        try {
            const updated = await updateConfigEntity(id, vals);
            setEntities(p => p.map(item => item._id === id ? updated : item));
            toast.success('Entity updated');
            done();
        } catch (e) { toast.error(e.message); }
    };
    const handleDeleteEntity = async (id) => {
        if (!window.confirm('Delete this entity and all its impact levels?')) return;
        try {
            await deleteConfigEntity(id);
            setEntities(p => p.filter(x => x._id !== id));
            setImpactLevels(p => p.filter(x => x.entity?._id !== id));
            toast.success('Entity deleted');
        } catch (e) { toast.error(e.message); }
    };

    // ── IMPACT LEVEL CRUD ────────────────────────────────────────────────────
    const filteredImpact = filterEntity ? impactLevels.filter(i => i.entity?._id === filterEntity) : impactLevels;

    const handleAddImpact = async (vals) => {
        if (!vals.name || !vals.entity) return toast.error('Name and entity are required');
        setSubmitting(true);
        try {
            const created = await createImpactLevel(vals);
            setImpactLevels(p => [created, ...p]);
            setShowAdd(p => ({ ...p, impact: false }));
            toast.success('Impact level created');
        } catch (e) { toast.error(e.message); } finally { setSubmitting(false); }
    };
    const handleEditImpact = async (id, vals, done) => {
        try {
            const updated = await updateImpactLevel(id, vals);
            setImpactLevels(p => p.map(x => x._id === id ? updated : x));
            toast.success('Impact level updated');
            done();
        } catch (e) { toast.error(e.message); }
    };
    const handleDeleteImpact = async (id) => {
        if (!window.confirm('Delete this impact level?')) return;
        try {
            await deleteImpactLevel(id);
            setImpactLevels(p => p.filter(x => x._id !== id));
            toast.success('Impact level deleted');
        } catch (e) { toast.error(e.message); }
    };

    // ── EMPLOYEE CATEGORY CRUD ───────────────────────────────────────────────
    const handleAddEmp = async (vals) => {
        if (!vals.name || !vals.code) return toast.error('Full name and code are required');
        setSubmitting(true);
        try {
            const created = await createEmployeeCategory(vals);
            setEmpCategories(p => [created, ...p]);
            setShowAdd(p => ({ ...p, emp: false }));
            toast.success('Employee category created');
        } catch (e) { toast.error(e.message); } finally { setSubmitting(false); }
    };
    const handleEditEmp = async (id, vals, done) => {
        try {
            const updated = await updateEmployeeCategory(id, vals);
            setEmpCategories(p => p.map(x => x._id === id ? updated : x));
            toast.success('Updated');
            done();
        } catch (e) { toast.error(e.message); }
    };
    const handleDeleteEmp = async (id) => {
        if (!window.confirm('Delete this employee category?')) return;
        try {
            await deleteEmployeeCategory(id);
            setEmpCategories(p => p.filter(x => x._id !== id));
            toast.success('Deleted');
        } catch (e) { toast.error(e.message); }
    };

    // ── POLICY CATEGORY CRUD ─────────────────────────────────────────────────
    const handleAddPolicy = async (vals) => {
        if (!vals.name) return toast.error('Name is required');
        setSubmitting(true);
        try {
            const created = await createPolicyCategory(vals);
            setPolicyCategories(p => [created, ...p]);
            setShowAdd(p => ({ ...p, policy: false }));
            toast.success('Policy category created');
        } catch (e) { toast.error(e.message); } finally { setSubmitting(false); }
    };
    const handleEditPolicy = async (id, vals, done) => {
        try {
            const updated = await updatePolicyCategory(id, vals);
            setPolicyCategories(p => p.map(x => x._id === id ? updated : x));
            toast.success('Updated');
            done();
        } catch (e) { toast.error(e.message); }
    };
    const handleDeletePolicy = async (id) => {
        if (!window.confirm('Delete this policy category?')) return;
        try {
            await deletePolicyCategory(id);
            setPolicyCategories(p => p.filter(x => x._id !== id));
            toast.success('Deleted');
        } catch (e) { toast.error(e.message); }
    };

    // ─── column defs ─────────────────────────────────────────────────────────
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const entityCols = [
        { key: 'name', label: 'Name', editable: true, autoFocus: true },
        { key: 'entityCode', label: 'Code', editable: true, render: (r) => <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-lg text-xs font-bold">{r.entityCode}</span> },
        { key: 'createdBy', label: 'Created By', render: (r) => <span className="text-gray-500">{r.createdBy || '—'}</span> },
        { key: 'createdAt', label: 'Created On', render: (r) => <span className="text-gray-400 text-xs">{formatDate(r.createdAt)}</span> },
    ];

    const impactCols = [
        { key: 'name', label: 'Level Name', editable: true, autoFocus: true },
        {
            key: 'entity', label: 'Entity', editable: true, type: 'select', options: entities,
            getValue: (r) => r.entity?._id || '',
            render: (r) => (
                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-lg text-xs font-bold">
                    {r.entity?.name || '—'}
                </span>
            )
        },
        { key: 'createdBy', label: 'Created By', render: (r) => <span className="text-gray-500">{r.createdBy || '—'}</span> },
        { key: 'createdAt', label: 'Created On', render: (r) => <span className="text-gray-400 text-xs">{formatDate(r.createdAt)}</span> },
    ];

    const simpleCols = [
        { key: 'name', label: 'Category Name', editable: true, autoFocus: true },
        { key: 'createdBy', label: 'Created By', render: (r) => <span className="text-gray-500">{r.createdBy || '—'}</span> },
        { key: 'createdAt', label: 'Created On', render: (r) => <span className="text-gray-400 text-xs">{formatDate(r.createdAt)}</span> },
    ];

    const empCols = [
        { key: 'name', label: 'Full Name', editable: true, autoFocus: true },
        {
            key: 'code', label: 'Code', editable: true,
            render: (r) => (
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs font-bold">
                    {r.code || '—'}
                </span>
            )
        },
        { key: 'createdBy', label: 'Created By', render: (r) => <span className="text-gray-500">{r.createdBy || '—'}</span> },
        { key: 'createdAt', label: 'Created On', render: (r) => <span className="text-gray-400 text-xs">{formatDate(r.createdAt)}</span> },
    ];

    return (
        <div className="space-y-8 animate-up">
            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-1">Configuration</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage master data: entities, impact levels, and categories</p>
            </div>

            {/* ─ ENTITY + IMPACT LEVEL (side by side) ───────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {/* Entity */}
                <ConfigTable
                    title="Entities"
                    icon={icons.entity}
                    accentColor="blue"
                    columns={entityCols}
                    rows={entities}
                    loading={loading.entities}
                    onAdd={() => toggleAdd('entities')}
                    onEdit={handleEditEntity}
                    onDelete={handleDeleteEntity}
                    addForm={
                        <InlineAddForm
                            visible={showAdd.entities}
                            submitting={submitting}
                            fields={[
                                { key: 'name', label: 'Entity Name', placeholder: 'Zuari Industries Ltd', autoFocus: true },
                                { key: 'entityCode', label: 'Entity Code', placeholder: 'ZIL' },
                            ]}
                            onSubmit={handleAddEntity}
                            onCancel={() => setShowAdd(p => ({ ...p, entities: false }))}
                        />
                    }
                />

                {/* Impact Level */}
                <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-amber-500 to-amber-600 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                {icons.impact}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Impact Levels</h3>
                                <p className="text-white/70 text-xs">{filteredImpact.length} record{filteredImpact.length !== 1 ? 's' : ''} {filterEntity ? '(filtered)' : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Entity filter */}
                            <select
                                value={filterEntity}
                                onChange={e => setFilterEntity(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-white/20 text-white text-sm font-medium border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-gray-800"
                            >
                                <option value="">All Entities</option>
                                {entities.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                            </select>
                            <button
                                onClick={() => toggleAdd('impact')}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all"
                            >
                                {icons.plus}
                                Add New
                            </button>
                        </div>
                    </div>

                    <InlineAddForm
                        visible={showAdd.impact}
                        submitting={submitting}
                        fields={[
                            { key: 'name', label: 'Level Name', placeholder: 'e.g. Critical, High, Medium', autoFocus: true },
                            { key: 'entity', label: 'Entity', type: 'select', options: entities },
                        ]}
                        onSubmit={handleAddImpact}
                        onCancel={() => setShowAdd(p => ({ ...p, impact: false }))}
                    />

                    <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[285px]">
                        {loading.impact ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                        ) : filteredImpact.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="text-gray-300 dark:text-slate-600 text-4xl mb-3">○</div>
                                <p className="text-gray-400 text-sm">No impact levels {filterEntity ? 'for this entity' : 'yet'}.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-800 shadow-[0_1px_0_0_rgba(243,244,246,1)] dark:shadow-[0_1px_0_0_rgba(51,65,85,1)]">
                                    <tr>
                                        {impactCols.map(col => (
                                            <th key={col.key} className="py-3 px-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</th>
                                        ))}
                                        <th className="py-3 px-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                    {filteredImpact.map(row => (
                                        <ImpactRow
                                            key={row._id}
                                            item={row}
                                            entities={entities}
                                            onEdit={handleEditImpact}
                                            onDelete={handleDeleteImpact}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* ─ EMPLOYEE CATEGORIES + POLICY CATEGORIES (side by side) ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <ConfigTable
                    title="Employee Categories"
                    icon={icons.employee}
                    accentColor="emerald"
                    columns={empCols}
                    rows={empCategories}
                    loading={loading.emp}
                    onAdd={() => toggleAdd('emp')}
                    onEdit={handleEditEmp}
                    onDelete={handleDeleteEmp}
                    addForm={
                        <InlineAddForm
                            visible={showAdd.emp}
                            submitting={submitting}
                            fields={[
                                { key: 'name', label: 'Full Name', placeholder: 'e.g. Full-Time Consultants', autoFocus: true },
                                { key: 'code', label: 'Code (Short Name)', placeholder: 'e.g. FTC' },
                            ]}
                            onSubmit={handleAddEmp}
                            onCancel={() => setShowAdd(p => ({ ...p, emp: false }))}
                        />
                    }
                />

                <ConfigTable
                    title="Policy Categories"
                    icon={icons.policy}
                    accentColor="purple"
                    columns={simpleCols}
                    rows={policyCategories}
                    loading={loading.policy}
                    onAdd={() => toggleAdd('policy')}
                    onEdit={handleEditPolicy}
                    onDelete={handleDeletePolicy}
                    addForm={
                        <InlineAddForm
                            visible={showAdd.policy}
                            submitting={submitting}
                            fields={[{ key: 'name', label: 'Category Name', placeholder: 'e.g. HR, Finance, Operations', autoFocus: true }]}
                            onSubmit={handleAddPolicy}
                            onCancel={() => setShowAdd(p => ({ ...p, policy: false }))}
                        />
                    }
                />
            </div>
        </div>
    );
};

// ── Impact Row with its own inline edit (needs entity select options) ─────────
const ImpactRow = ({ item, entities, onEdit, onDelete, formatDate }) => {
    const [editing, setEditing] = useState(false);
    const [vals, setVals] = useState({ name: '', entity: '' });

    const startEdit = () => {
        setVals({ name: item.name, entity: item.entity?._id || '' });
        setEditing(true);
    };
    const cancel = () => setEditing(false);
    const save = () => onEdit(item._id, vals, () => setEditing(false));

    return (
        <tr className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                {editing ? (
                    <input value={vals.name} onChange={e => setVals(p => ({ ...p, name: e.target.value }))}
                        className="w-full p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900 border border-blue-300 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" autoFocus />
                ) : item.name}
            </td>
            <td className="py-3 px-4">
                {editing ? (
                    <select value={vals.entity} onChange={e => setVals(p => ({ ...p, entity: e.target.value }))}
                        className="w-full p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900 border border-blue-300 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm">
                        {entities.map(e => <option key={e._id} value={e._id}>{e.name} ({e.entityCode})</option>)}
                    </select>
                ) : (
                    <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-lg text-xs font-bold">
                        {item.entity?.name || '—'}
                    </span>
                )}
            </td>
            <td className="py-3 px-4 text-sm text-gray-500">{item.createdBy || '—'}</td>
            <td className="py-3 px-4 text-xs text-gray-400">{formatDate(item.createdAt)}</td>
            <td className="py-3 px-4 text-right">
                {editing ? (
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={save} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">{icons.check}</button>
                        <button onClick={cancel} className="p-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-300 rounded-lg transition-colors">{icons.x}</button>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={startEdit} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">{icons.edit}</button>
                        <button onClick={() => onDelete(item._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">{icons.trash}</button>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default AdminConfig;
