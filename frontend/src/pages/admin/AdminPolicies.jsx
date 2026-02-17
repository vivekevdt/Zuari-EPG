import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    getPolicies, getEntities, uploadPolicy,
    chunkPolicy,
    publishPolicy,
    deletePolicy,
    updatePolicy
} from '../../api';

import ConfirmationModal from '../../components/ConfirmationModal';

const AdminPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEntity, setFilterEntity] = useState('All Entities');
    const [isUploading, setIsUploading] = useState(false);

    // Upload Form State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadEntity, setUploadEntity] = useState('');
    const [editingPolicyId, setEditingPolicyId] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState(null);

    // Actions Menu State
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [policiesData, entitiesData] = await Promise.all([
                    getPolicies(),
                    getEntities()
                ]);
                setPolicies(policiesData);
                setEntities(entitiesData);
                if (entitiesData.length > 0) {
                    setUploadEntity(entitiesData[0].name);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if ((!selectedFile && !editingPolicyId) || !uploadTitle || !uploadEntity) {
            toast.error("Please fill all fields and select a file");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        if (selectedFile) {
            formData.append('policyDocument', selectedFile);
        }
        formData.append('title', uploadTitle);
        formData.append('entity', uploadEntity);

        try {
            if (editingPolicyId) {
                await updatePolicy(editingPolicyId, formData);
                toast.success("Policy updated successfully!");
            } else {
                await uploadPolicy(formData);
                toast.success("Policy uploaded successfully!");
            }

            // Refresh policies
            const updatedPolicies = await getPolicies();
            setPolicies(updatedPolicies);

            // Reset form
            setSelectedFile(null);
            setUploadTitle('');
            setEditingPolicyId(null);
            setShowUploadModal(false);
        } catch (error) {
            console.error("Error saving policy:", error);
            toast.error("Failed to save policy");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateClick = (policy) => {
        setUploadTitle(policy.title);
        setUploadEntity(policy.entity);
        setEditingPolicyId(policy._id);
        setSelectedFile(null); // Optional to upload new file
        setShowUploadModal(true);
        setActiveMenuId(null);
    };

    const openUploadModal = () => {
        setUploadTitle('');
        if (entities.length > 0) setUploadEntity(entities[0].name);
        setEditingPolicyId(null);
        setSelectedFile(null);
        setShowUploadModal(true);
    };

    const confirmDeletePolicy = (id) => {
        setPolicyToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeletePolicy = async () => {
        if (!policyToDelete) return;
        try {
            await deletePolicy(policyToDelete);
            toast.success("Policy deleted successfully");
            const updatedPolicies = await getPolicies();
            setPolicies(updatedPolicies);
        } catch (error) {
            console.error("Error deleting policy:", error);
            toast.error("Failed to delete policy");
        }
    };

    const handleCreateChunks = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: 'chunking' }));
        try {
            await chunkPolicy(id);
            toast.success("Chunks created successfully!");
            const updatedPolicies = await getPolicies();
            setPolicies(updatedPolicies);
        } catch (error) {
            console.error("Error creating chunks:", error);
            toast.error("Failed to create chunks");
        } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        }
    };

    const handlePublishPolicy = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: 'publishing' }));
        try {
            await publishPolicy(id);
            const updatedPolicies = await getPolicies();
            setPolicies(updatedPolicies);
        } catch (error) {
            console.error("Error publishing policy:", error);
            toast.error("Failed to publish policy");
        } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        }
    };

    const handleDownloadPolicy = (filename) => {
        // Construct standard URL to access uploads (assuming static serve setup or similar)
        // Adjust this if your static file serving path is different
        const fileUrl = `${import.meta.env.VITE_BACKEND_URL}/uploads/policies/${filename}`;
        window.open(fileUrl, '_blank');
    };

    const filteredPolicies = filterEntity === 'All Entities'
        ? policies
        : policies.filter(p => p.entity === filterEntity);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading policies...</div>;

    return (
        <div className="space-y-8 animate-up relative">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeletePolicy}
                title="Delete Policy"
                message="Are you sure you want to delete this policy? This will also delete all associated chunks and cannot be undone."
                confirmText="Delete Policy"
                isDanger={true}
            />
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">Policy Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage corporate documentation and AI visibility.</p>
                </div>
                <button
                    onClick={openUploadModal}
                    className="flex items-center gap-2 px-6 py-3 bg-zuari-navy hover:bg-[#122856] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Upload Policy
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Filter By Entity:</span>
                <select
                    value={filterEntity}
                    onChange={(e) => setFilterEntity(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option>All Entities</option>
                    {entities.map(ent => (
                        <option key={ent._id} value={ent.name}>{ent.name}</option>
                    ))}
                </select>

                {/* Upload form inline if toggled - specifically requested as separate UI but putting inline for simplicity or modal */}
            </div>

            {/* Upload Modal / Section */}
            {showUploadModal && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-xl border border-blue-100 dark:border-blue-900 mb-8 animate-up">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{editingPolicyId ? 'Update Policy' : 'Upload New Policy'}</h3>
                    <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Policy Title</label>
                            <input
                                type="text"
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                                placeholder="e.g. HR General Policy 2024"
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Entity</label>
                            <select
                                value={uploadEntity}
                                onChange={(e) => setUploadEntity(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {entities.map(ent => (
                                    <option key={ent._id} value={ent.name}>{ent.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Policy Document (PDF/DOCX) {editingPolicyId && <span className="text-xs text-gray-400 normal-case">(Optional: Leave empty to keep existing file)</span>}</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                            >
                                {isUploading ? 'Saving...' : (editingPolicyId ? 'Update Policy' : 'Upload Policy')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className=""> {/* Removed overflow-hidden/auto to allow menus to float */}
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-slate-700">
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Index</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Policy Document</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Target Entity</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Chunked</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Published</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Uploaded</th>
                                <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredPolicies.map((policy, index) => (
                                <tr key={policy._id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="py-4 px-4 text-gray-400 font-mono text-sm">{(index + 1).toString().padStart(2, '0')}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${policy.filename.endsWith('.pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                {policy.filename.endsWith('.pdf') ? 'PDF' : 'DOC'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-main">{policy.title}</div>
                                                <div className="text-xs text-gray-400 uppercase">{policy.filename.split('.').pop()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                                            {policy.entity}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.status === 'live' ? 'bg-green-100 text-green-800' :
                                            policy.status === 'failed-please retry' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {policy.status === 'live' ? 'Live' :
                                                policy.status === 'failed-please retry' ? 'Failed' :
                                                    'Pending'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        {actionLoading[policy._id] === 'chunking' ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-50 rounded-full">
                                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                            </span>
                                        ) : policy.ischunked ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        {actionLoading[policy._id] === 'publishing' ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-50 rounded-full">
                                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                            </span>
                                        ) : policy.status === 'live' ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </span>
                                        ) : policy.status === 'failed-please retry' ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                            {new Date(policy.uploadDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="relative flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === policy._id ? null : policy._id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                            </button>

                                            {activeMenuId === policy._id && (
                                                <div className="absolute top-10 right-0 z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">

                                                    {/* Download */}
                                                    <button
                                                        onClick={() => handleDownloadPolicy(policy.filename)}
                                                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 dark:text-gray-300 font-medium"
                                                    >
                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                        Download
                                                    </button>

                                                    {/* Update */}
                                                    <button
                                                        onClick={() => handleUpdateClick(policy)}
                                                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 dark:text-gray-300 font-medium"
                                                    >
                                                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        Update Policy
                                                    </button>

                                                    {/* Create Chunks */}
                                                    {!policy.ischunked && (
                                                        <button
                                                            onClick={() => handleCreateChunks(policy._id)}
                                                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 dark:text-gray-300 font-medium"
                                                        >
                                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                                            Create Chunks
                                                        </button>
                                                    )}

                                                    {/* Publish */}
                                                    {policy.status !== 'live' && (
                                                        <button
                                                            onClick={() => handlePublishPolicy(policy._id)}
                                                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 dark:text-gray-300 font-medium"
                                                        >
                                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                            {policy.status === 'failed-please retry' ? 'Retry Publish' : 'Publish'}
                                                        </button>
                                                    )}

                                                    <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => confirmDeletePolicy(policy._id)}
                                                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-500 font-medium"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        Delete Policy
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPolicies.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">No policies found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPolicies;
