import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getEntities, createEntity, deleteEntity, updateEntity } from '../../api';

import ConfirmationModal from '../../components/ConfirmationModal';

const AdminEntities = () => {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entityToDelete, setEntityToDelete] = useState(null);

    useEffect(() => {
        fetchEntities();
    }, []);

    const fetchEntities = async () => {
        try {
            const data = await getEntities();
            setEntities(data);
        } catch (error) {
            console.error("Error fetching entities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            if (isEditing) {
                await updateEntity(editId, name);
                toast.success("Entity updated successfully");
            } else {
                await createEntity(name);
                toast.success("Entity created successfully");
            }
            setName('');
            setIsEditing(false);
            setEditId(null);
            fetchEntities();
        } catch (error) {
            console.error("Error saving entity:", error);
            toast.error(error.message || "Failed to save entity");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (entity) => {
        setName(entity.name);
        setEditId(entity._id);
        setIsEditing(true);
    };

    const confirmDelete = (id) => {
        setEntityToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!entityToDelete) return;
        try {
            await deleteEntity(entityToDelete);
            toast.success("Entity deleted successfully");
            setEntities(entities.filter(e => e._id !== entityToDelete));
        } catch (error) {
            console.error("Error deleting entity:", error);
            toast.error("Failed to delete entity");
        }
    };

    const handleCancel = () => {
        setName('');
        setIsEditing(false);
        setEditId(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading entities...</div>;

    // Hardcoded Entity List
    const AVAILABLE_ENTITIES = [
        { code: 'ZIL', name: 'Zuari Industries Ltd' },
        { code: 'ZIIL', name: 'Zuari Infraworld India Ltd' },
        { code: 'SIL', name: 'Simon India Ltd' },
        { code: 'ZIntL', name: 'Zuari International' },
        { code: 'ZFL', name: 'Zuari Finserv Ltd' },
        { code: 'ZIBL', name: 'Zuari Insurance Brokers Ltd' },
        { code: 'ZMSL', name: 'Zuari Management Services Ltd' },
        { code: 'FFPL', name: 'Forte Furniture Products India Pvt Ltd' },
        { code: 'IFPL', name: 'Indian Furniture Private Ltd' },
        { code: 'ZEBPL', name: 'Zuari Envien Bioenergy Pvt Ltd' }
    ];

    return (
        <div className="space-y-8 animate-up">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Entity"
                message="Are you sure you want to delete this entity? This might affect users assigned to this entity."
                confirmText="Delete Entity"
                isDanger={true}
            />
            <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Entity Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-fit">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                        {isEditing ? 'Edit Entity' : 'Add New Entity'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Entity</label>
                            <div className="relative">
                                <select
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                                >
                                    <option value="">-- Select an Entity --</option>
                                    {AVAILABLE_ENTITIES.map((entity) => (
                                        <option key={entity.code} value={entity.name}>
                                            {entity.name} ({entity.code})
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Entities are predefined with linked codes.</p>
                        </div>

                        <div className="flex gap-3">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-2xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting || !name.trim()}
                                className="flex-1 py-4 bg-zuari-navy hover:bg-[#122856] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70"
                            >
                                {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Existing Entities</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700">
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Code</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Entity Name</th>
                                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {entities.map((entity) => (
                                    <tr key={entity._id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-4 px-4 font-mono text-sm font-bold text-blue-600 bg-blue-50/50 rounded-lg">{entity.entityCode || '-'}</td>
                                        <td className="py-4 px-4 font-bold text-gray-800 dark:text-gray-200">{entity.name}</td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => handleEdit(entity)}
                                                className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all mr-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(entity._id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {entities.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="text-center py-8 text-gray-400">No entities found.</td>
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

export default AdminEntities;
