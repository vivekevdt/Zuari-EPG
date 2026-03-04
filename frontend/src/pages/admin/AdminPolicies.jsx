import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    getPolicies, getEntities, uploadPolicy,
    getArchivedPolicies,
    chunkPolicy,
    publishPolicy,
    deletePolicy,
    updatePolicy,
    getImpactLevels,
    getEmployeeCategories
} from '../../api';

import ConfirmationModal from '../../components/ConfirmationModal';

const CustomMultiSelect = ({ label, options, selectedValues, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (value) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
            <div
                className="w-full relative z-20 p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus-within:ring-2 focus-within:ring-blue-500 font-medium text-gray-700 min-h-[56px] cursor-pointer flex flex-wrap gap-2 items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedValues.length === 0 && <span className="text-gray-400">{placeholder}</span>}
                {selectedValues.map(val => {
                    const option = options.find(o => o.value === val);
                    return (
                        <span key={val} className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-2 dark:bg-blue-900 dark:text-blue-300">
                            {option ? option.label : val}
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleOption(val); }} className="hover:text-red-500 transition-colors w-4 h-4 rounded-full flex items-center justify-center leading-none">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </span>
                    );
                })}
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute z-30 w-full mt-2 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none">
                        {options.length > 0 && (
                            <div
                                className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3 text-gray-700 dark:text-gray-200 font-medium transition-colors border-b border-gray-50 dark:border-slate-700/50"
                                onClick={() => {
                                    if (selectedValues.length === options.length) {
                                        onChange([]);
                                    } else {
                                        onChange(options.map(o => o.value));
                                    }
                                }}
                            >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedValues.length === options.length && options.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                    {selectedValues.length === options.length && options.length > 0 && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    )}
                                </div>
                                <span className="font-bold text-blue-600 dark:text-blue-400">Select All</span>
                            </div>
                        )}
                        {options.map(option => (
                            <div
                                key={option.value}
                                className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3 text-gray-700 dark:text-gray-200 font-medium transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                                onClick={() => toggleOption(option.value)}
                            >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedValues.includes(option.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                    {selectedValues.includes(option.value) && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    )}
                                </div>
                                <span>{option.label}</span>
                            </div>
                        ))}
                        {options.length === 0 && (
                            <div className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">No options available</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const AdminPolicies = () => {
    // Data State
    const [policies, setPolicies] = useState([]);
    const [archivedPolicies, setArchivedPolicies] = useState([]);
    const [entities, setEntities] = useState([]);
    const [impactLevels, setImpactLevels] = useState([]);
    const [empCategories, setEmpCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEntity, setFilterEntity] = useState('All Entities');
    const [filterCategory, setFilterCategory] = useState('All Categories');

    // UI View State
    const [viewMode, setViewMode] = useState('list'); // 'list', 'upload'
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedPolicyHistory, setSelectedPolicyHistory] = useState(null);

    // Upload Form State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadEntities, setUploadEntities] = useState([]);
    const [uploadImpactLevels, setUploadImpactLevels] = useState([]);
    const [uploadEmpCategories, setUploadEmpCategories] = useState([]);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadCategory, setUploadCategory] = useState('HR - General');
    const [uploadExpiry, setUploadExpiry] = useState('');
    const [noExpiry, setNoExpiry] = useState(false);
    const [changeNote, setChangeNote] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingPolicyId, setEditingPolicyId] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState(null);

    // Actions Menu State
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    // Categories List (Hardcoded for now as per design)
    const categories = [
        'Leave & Holidays',
        'Time & Attendance',
        'Travel & Expenses',
        'Benefits & Perks',
        'Events & Activities',
        'HR - General'
    ];

    // Hardcoded Entity List (Fallback)
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

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [policiesData, entitiesData, archivedData, impactsData, categoriesData] = await Promise.all([
                getPolicies(),
                getEntities(),
                getArchivedPolicies(),
                getImpactLevels(),
                getEmployeeCategories()
            ]);
            setPolicies(policiesData);
            setEntities(entitiesData);
            setArchivedPolicies(archivedData);
            setImpactLevels(impactsData);
            setEmpCategories(categoriesData);

            // Fallback to hardcoded entities if API returns empty
            const validEntities = entitiesData.length > 0 ? entitiesData : AVAILABLE_ENTITIES.map(e => ({ _id: e.code, name: e.name }));

            if (entitiesData.length === 0) {
                setEntities(validEntities);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // File Handling
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                setSelectedFile(file);
            } else {
                toast.error('Please upload PDF or Word documents only.');
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if ((!selectedFile && !editingPolicyId) || !uploadTitle || uploadEntities.length === 0) {
            toast.error("Please fill all required fields and select a file");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        if (selectedFile) {
            formData.append('policyDocument', selectedFile);
        }
        formData.append('title', uploadTitle);
        formData.append('entity', JSON.stringify(uploadEntities));
        formData.append('impactLevel', JSON.stringify(uploadImpactLevels));
        formData.append('empCategory', JSON.stringify(uploadEmpCategories));
        formData.append('description', uploadDescription);

        if (uploadCategory) formData.append('category', uploadCategory);
        if (!noExpiry && uploadExpiry) formData.append('expiryDate', uploadExpiry);
        if (changeNote) formData.append('changeNote', changeNote);

        try {
            if (editingPolicyId) {
                await updatePolicy(editingPolicyId, formData);
                toast.success("Policy updated successfully!");
            } else {
                await uploadPolicy(formData);
                toast.success("Policy uploaded successfully!");
            }

            await fetchData();
            resetForm();
            setViewMode('list');
        } catch (error) {
            console.error("Error saving policy:", error);
            toast.error("Failed to save policy");
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setUploadTitle('');
        setUploadCategory('HR - General');
        setUploadExpiry('');
        setNoExpiry(false);
        setChangeNote('');
        setUploadEntities([]);
        setUploadImpactLevels([]);
        setUploadEmpCategories([]);
        setUploadDescription('');
        setEditingPolicyId(null);
    };

    const handleUpdateClick = (policy) => {
        setUploadTitle(policy.title);

        setUploadEntities(Array.isArray(policy.entity) ? policy.entity : (policy.entity ? [policy.entity] : []));
        setUploadImpactLevels(Array.isArray(policy.impactLevel) ? policy.impactLevel : []);
        setUploadEmpCategories(Array.isArray(policy.empCategory) ? policy.empCategory : []);
        setUploadDescription(policy.description || '');

        setUploadCategory(policy.category || 'HR - General');
        if (policy.expiryDate) {
            setUploadExpiry(new Date(policy.expiryDate).toISOString().split('T')[0]);
            setNoExpiry(false);
        } else {
            setUploadExpiry('');
            setNoExpiry(true);
        }
        setEditingPolicyId(policy._id);
        setSelectedFile(null);
        setViewMode('upload');
        setActiveMenuId(null);
    };

    const confirmDeletePolicy = (id) => {
        setPolicyToDelete(id);
        setIsDeleteModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDeletePolicy = async () => {
        if (!policyToDelete) return;
        try {
            await deletePolicy(policyToDelete);
            toast.success("Policy deleted successfully");
            await fetchData();
        } catch (error) {
            console.error("Error deleting policy:", error);
            toast.error("Failed to delete policy");
        } finally {
            setIsDeleteModalOpen(false);
            setPolicyToDelete(null);
        }
    };

    // Actions (Chunk, Publish)
    const handleAction = async (actionFn, id, actionName) => {
        // Validation for Publishing
        if (actionName === 'publishing') {
            const policy = policies.find(p => p._id === id);
            if (policy && !policy.ischunked) {
                toast.error("Please create chunks before publishing.");
                return;
            }
        }

        setActionLoading(prev => ({ ...prev, [id]: actionName }));
        try {
            await actionFn(id);
            toast.success(`${actionName} successful!`);
            await fetchData();
        } catch (error) {
            console.error(`Error during ${actionName}:`, error);
            toast.error(`Failed to ${actionName}`);
        } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
            setActiveMenuId(null);
        }
    };

    const handleDownloadPolicy = (filename) => {
        const fileUrl = `${import.meta.env.VITE_BACKEND_URL}/uploads/policies/${filename}`;
        window.open(fileUrl, '_blank');
        setActiveMenuId(null);
    };


    // Filtering
    const filteredPolicies = policies.filter(policy => {
        const matchesEntity = filterEntity === 'All Entities' ||
            (Array.isArray(policy.entity) ? policy.entity.some(e => e === filterEntity || (e && e._id === filterEntity)) : (policy.entity === filterEntity || (policy.entity && policy.entity._id === filterEntity)));
        const matchesCategory = filterCategory === 'All Categories' || (policy.category || 'General') === filterCategory;
        const matchesSearch = !searchQuery || policy.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isNotArchived = showArchiveModal || policy.status !== 'archived'; // Only show archived in modal/archive view if we implemented that logic.

        return matchesEntity && matchesCategory && matchesSearch;
    });



    return (
        <div className="space-y-8 animate-up relative min-h-screen">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeletePolicy}
                title="Delete Policy"
                message="Are you sure you want to delete this policy?"
                confirmText="Delete"
                isDanger={true}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">Policy Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Manage corporate documentation and AI visibility.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            resetForm();
                            setViewMode('upload');
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-zuari-navy hover:bg-[#122856] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Upload Policy
                    </button>
                    <button
                        onClick={() => setShowArchiveModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                        Archive
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex-1 relative w-full">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Search by policy name or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-100 outline-none placeholder-gray-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-3 flex items-center gap-2 min-w-[200px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">ENTITY:</span>
                        <select
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-0 outline-none w-full"
                        >
                            <option>All Entities</option>
                            {entities.map(ent => (
                                <option key={ent._id} value={ent._id}>{ent.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-3 flex items-center gap-2 min-w-[200px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">CATEGORY:</span>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-0 outline-none w-full"
                        >
                            <option>All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'upload' ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 animate-fade-in">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {editingPolicyId ? 'Update Policy' : 'Upload New Policy'}
                        </h3>
                        <button
                            onClick={() => setViewMode('list')}
                            className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Policy Title</label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder="e.g. HR General Policy 2024"
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                <select
                                    value={uploadCategory}
                                    onChange={(e) => setUploadCategory(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative z-50">
                                <CustomMultiSelect
                                    label="Target Entities"
                                    options={entities.map(e => ({ value: e._id, label: e.name }))}
                                    selectedValues={uploadEntities}
                                    onChange={setUploadEntities}
                                    placeholder="Select one or more entities..."
                                />
                            </div>

                            <div className="relative z-40">
                                <CustomMultiSelect
                                    label="Impact Levels"
                                    options={uploadEntities.length > 0 ? impactLevels.filter(i => uploadEntities.includes(i.entity?._id || i.entity)).map(i => ({ value: i._id, label: `${i.name} (${i.entity?.name})` })) : []}
                                    selectedValues={uploadImpactLevels}
                                    onChange={setUploadImpactLevels}
                                    placeholder={uploadEntities.length === 0 ? "Please select a Target Entity first..." : "Select impact levels..."}
                                />
                            </div>

                            <div className="relative z-30">
                                <CustomMultiSelect
                                    label="Employee Categories"
                                    options={empCategories.map(c => ({ value: c._id, label: `${c.name} (${c.code})` }))}
                                    selectedValues={uploadEmpCategories}
                                    onChange={setUploadEmpCategories}
                                    placeholder="Select employee categories..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Policy Description</label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    placeholder="Provide a brief description of the policy..."
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 resize-none h-32"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="noExpiry"
                                            checked={noExpiry}
                                            onChange={(e) => {
                                                setNoExpiry(e.target.checked);
                                                if (e.target.checked) setUploadExpiry('');
                                            }}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                        />
                                        <label htmlFor="noExpiry" className="text-xs font-bold text-gray-400 uppercase cursor-pointer select-none">No Expiry</label>
                                    </div>
                                </div>
                                <input
                                    type="date"
                                    value={uploadExpiry}
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                    disabled={noExpiry}
                                    onChange={(e) => setUploadExpiry(e.target.value)}
                                    className={`w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 ${noExpiry ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            {editingPolicyId && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Change Note / Description</label>
                                    <textarea
                                        value={changeNote}
                                        onChange={(e) => setChangeNote(e.target.value)}
                                        placeholder="Briefly describe what changed in this version..."
                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 resize-none h-24"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Drag and Drop Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-3xl p-12 transition-all text-center group cursor-pointer
                                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                            />

                            <div className="mb-4">
                                {selectedFile ? (
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    </div>
                                )}
                            </div>

                            {selectedFile ? (
                                <div>
                                    <p className="text-lg font-bold text-gray-800">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg font-bold text-gray-700">Drag and drop your policy file here</p>
                                    <p className="text-sm font-bold text-blue-600 mt-1">Browse Files</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-orange-500 font-bold text-sm mt-4">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <span>Only upload selectable PDFs or Word documents. Scanned docs/images will not be parsed.</span>
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className="px-10 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="px-10 py-4 bg-zuari-navy hover:bg-[#122856] text-white rounded-xl font-bold shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : (editingPolicyId ? 'Update Policy' : 'Upload Policy')}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700">
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16">Index</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Policy Document</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Entities</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Impact Levels</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Emp. Categories</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Version</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chunked</th>
                                    <th className="text-center py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Published</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Uploaded</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</th>
                                    <th className="text-right py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {filteredPolicies.map((policy, index) => (
                                    <tr key={policy._id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-4 px-4 text-gray-400 font-mono text-sm">{(index + 1).toString().padStart(2, '0')}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[10px] shadow-sm ${policy.filename.endsWith('.pdf') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {policy.filename.endsWith('.pdf') ? 'PDF' : 'DOC'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-white text-sm">{policy.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 align-top">
                                            <div className="flex flex-col gap-1 items-start">
                                                {(() => {
                                                    const ents = Array.isArray(policy.entity) ? policy.entity : (policy.entity ? [policy.entity] : []);
                                                    const visible = ents.slice(0, 3);
                                                    const remaining = ents.length - 3;
                                                    return (
                                                        <>
                                                            {visible.map((ent, i) => {
                                                                const entityObj = entities.find(e => e._id === ent);
                                                                return (
                                                                    <span key={i} className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold truncate max-w-[120px]" title={entityObj ? entityObj.name : ent}>
                                                                        {entityObj ? entityObj.name : ent}
                                                                    </span>
                                                                );
                                                            })}
                                                            {remaining > 0 && (
                                                                <div className="relative group inline-block mt-1">
                                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-[9px] font-bold cursor-help">
                                                                        +{remaining} more
                                                                    </span>
                                                                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-max max-w-[200px] bg-gray-900 text-white text-[10px] rounded-lg shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            {ents.map((ent, i) => {
                                                                                const entityObj = entities.find(e => e._id === ent);
                                                                                return <div key={i} className="truncate">• {entityObj ? entityObj.name : ent}</div>;
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {ents.length === 0 && <span className="text-gray-400 text-xs">-</span>}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 align-top">
                                            <div className="flex flex-col gap-1 items-start min-w-[120px]">
                                                {(() => {
                                                    if (!policy.impactLevel || policy.impactLevel.length === 0) return <span className="text-gray-400 text-xs">-</span>;
                                                    const visible = policy.impactLevel.slice(0, 3);
                                                    const remaining = policy.impactLevel.length - 3;

                                                    return (
                                                        <>
                                                            <div className="grid grid-cols-3 gap-1">
                                                                {visible.map((impactId, i) => {
                                                                    const impact = impactLevels.find(il => il._id === impactId);
                                                                    if (!impact) return null;
                                                                    return (
                                                                        <span key={i} className="px-2 py-1 rounded bg-purple-50 text-purple-700 text-[10px] font-bold truncate text-center" title={impact.name}>
                                                                            {impact.name}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                            {remaining > 0 && (
                                                                <div className="relative group inline-block mt-1">
                                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-[9px] font-bold cursor-help">
                                                                        +{remaining} more
                                                                    </span>
                                                                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-max max-w-[200px] bg-gray-900 text-white text-[10px] rounded-lg shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                                        <div className="grid grid-cols-4 gap-1.5">
                                                                            {policy.impactLevel.map((impactId, i) => {
                                                                                const impact = impactLevels.find(il => il._id === impactId);
                                                                                return impact ? <span key={i} className="px-2 py-1 bg-gray-800 rounded text-center">{impact.name}</span> : null;
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 align-top">
                                            <div className="flex flex-col gap-1 items-start min-w-[120px]">
                                                {(() => {
                                                    if (!policy.empCategory || policy.empCategory.length === 0) return <span className="text-gray-400 text-xs">-</span>;
                                                    const visible = policy.empCategory.slice(0, 3);
                                                    const remaining = policy.empCategory.length - 3;

                                                    return (
                                                        <>
                                                            <div className="grid grid-cols-3 gap-1">
                                                                {visible.map((catId, i) => {
                                                                    const cat = empCategories.find(c => c._id === catId);
                                                                    if (!cat) return null;
                                                                    return (
                                                                        <span key={i} className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold truncate text-center" title={cat.name}>
                                                                            {cat.code || cat.name}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                            {remaining > 0 && (
                                                                <div className="relative group inline-block mt-1">
                                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-[9px] font-bold cursor-help">
                                                                        +{remaining} more
                                                                    </span>
                                                                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-max max-w-[200px] bg-gray-900 text-white text-[10px] rounded-lg shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                                        <div className="grid grid-cols-4 gap-1.5">
                                                                            {policy.empCategory.map((catId, i) => {
                                                                                const cat = empCategories.find(c => c._id === catId);
                                                                                return cat ? <span key={i} className="px-2 py-1 bg-gray-800 rounded text-center">{cat.code || cat.name}</span> : null;
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wide">
                                                v{policy.version || '1.0'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                                                {policy.category || 'HR - General'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${policy.status === 'live' ? 'bg-green-100 text-green-700' :
                                                policy.status === 'failed-please retry' ? 'bg-red-100 text-red-700' :
                                                    policy.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-yellow-100 text-yellow-700' // pending
                                                }`}>
                                                {policy.status === 'live' ? 'Live' :
                                                    policy.status === 'failed-please retry' ? 'Failed' :
                                                        policy.status === 'draft' ? 'Draft' :
                                                            'Pending'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {actionLoading[policy._id] === 'chunking' ? (
                                                <div className="inline-block w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : policy.ischunked ? (
                                                <div className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full mx-auto">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            ) : (
                                                <div className="w-2 h-0.5 bg-gray-200 mx-auto rounded-full"></div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {actionLoading[policy._id] === 'publishing' ? (
                                                <div className="inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : policy.status === 'live' ? (
                                                <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full mx-auto">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            ) : (
                                                <div className="w-2 h-0.5 bg-gray-200 mx-auto rounded-full"></div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                {new Date(policy.uploadDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {(() => {
                                                if (!policy.expiryDate) {
                                                    return <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">No Expiry</div>;
                                                }
                                                const expDate = new Date(policy.expiryDate);
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);

                                                const isExpired = expDate <= today;
                                                return (
                                                    <div className={`text-sm font-semibold ${isExpired ? 'text-red-500 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {expDate.toLocaleDateString()}
                                                    </div>
                                                );
                                            })()}
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
                                                    <div className="absolute top-[36px] right-8 z-[9999] w-48 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-slate-700 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">

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
                                                                onClick={() => handleAction(chunkPolicy, policy._id, 'chunking')}
                                                                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 dark:text-gray-300 font-medium"
                                                            >
                                                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                                                Create Chunks
                                                            </button>
                                                        )}

                                                        {/* Publish */}
                                                        {policy.status !== 'live' && (
                                                            <button
                                                                onClick={() => handleAction(publishPolicy, policy._id, 'publishing')}
                                                                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 dark:text-gray-300 font-medium"
                                                            >
                                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                                {policy.status === 'failed-please retry' ? 'Retry Publish' : 'Publish'}
                                                            </button>
                                                        )}

                                                        {/* History */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPolicyHistory(policy);
                                                                setShowHistoryModal(true);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-600 dark:text-gray-300 font-medium"
                                                        >
                                                            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            Version History
                                                        </button>

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
                                        <td colSpan="8" className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                <p className="font-medium">No policies found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Archive Modal */}
            {showArchiveModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowArchiveModal(false)}></div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl relative overflow-hidden animate-up">
                        <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 dark:text-white">Archived Policies</h2>
                                <p className="text-gray-500 mt-1">Review historical and deactivated documentation.</p>
                            </div>
                            <button onClick={() => setShowArchiveModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Document</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Entity</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {/* Mock Archive Data or Filtered Data */}
                                    {archivedPolicies.length > 0 ? archivedPolicies.map((policy) => (
                                        <tr key={policy._id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-500">PDF</div>
                                                    <span className="font-bold text-gray-700">{policy.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">{policy.category || 'General'}</td>
                                            <td className="py-4 px-6 text-sm text-gray-600">{policy.entity}</td>
                                            <td className="py-4 px-6 text-sm text-gray-600">{new Date(policy.uploadDate).toLocaleDateString()}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleDownloadPolicy(policy.filename)}
                                                    className="text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center justify-end gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No archived policies found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                            <button onClick={() => setShowArchiveModal(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">Done</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Version History Modal */}
            {showHistoryModal && selectedPolicyHistory && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowHistoryModal(false)}></div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-up transform transition-all">
                        <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start bg-gray-50/50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 dark:text-white">Version History - {selectedPolicyHistory.title}</h2>
                                <p className="text-gray-500 mt-1 font-medium">Track changes and see previous states.</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto relative">
                            {/* Timeline connector line */}
                            <div className="absolute left-[54px] top-8 bottom-8 w-0.5 bg-gray-100 dark:bg-slate-700"></div>

                            <div className="space-y-8 relative">
                                {/* Current Version */}
                                <div className="flex gap-6 relative">
                                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Version {selectedPolicyHistory.version || '1.0'}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700 uppercase tracking-wide">Active</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">{new Date(selectedPolicyHistory.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Current active version.</p>

                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                {(selectedPolicyHistory.lastUpdatedBy || 'AD').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{selectedPolicyHistory.lastUpdatedBy || 'Admin'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* History Versions */}
                                {selectedPolicyHistory.versions && selectedPolicyHistory.versions.slice().reverse().map((ver, idx) => (
                                    <div key={idx} className="flex gap-6 relative group">
                                        <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 flex items-center justify-center group-hover:border-blue-400 transition-colors">
                                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-slate-500 group-hover:bg-blue-400 transition-colors"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">Version {ver.version}</h3>
                                                <span className="text-xs font-bold text-gray-400">{new Date(ver.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{ver.changeNote || 'No change description provided.'}</p>

                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                                                    {(ver.changedBy || 'SY').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">{ver.changedBy || 'System'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end">
                            <button onClick={() => setShowHistoryModal(false)} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors shadow-sm">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPolicies;
