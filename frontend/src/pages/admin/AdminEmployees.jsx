import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAdminUsers, getEntities, createUser, deleteUser, updateUser, uploadEmployees, downloadEmployeeTemplate } from '../../api';

import ConfirmationModal from '../../components/ConfirmationModal';

const AVAILABLE_ROLES = [
    { value: 'employee', label: 'Employee' },
    { value: 'admin', label: 'Admin' },
    { value: 'superAdmin', label: 'Super Admin' }
];

const AdminEmployees = () => {
    const [users, setUsers] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creationMode, setCreationMode] = useState(null); // 'manual', 'bulk', or null
    const [uploadFile, setUploadFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        entity: '',
        level: '',
        status: 'active',
        entity_code: '',
        roles: ['employee']
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersData = await getAdminUsers();
                setUsers(usersData);
                // We default to the first available entity if desired, or empty
                if (AVAILABLE_ENTITIES.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        entity: AVAILABLE_ENTITIES[0].name,
                        entity_code: AVAILABLE_ENTITIES[0].code
                    }));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: value };
            // Auto-set entity code when entity changes
            if (name === 'entity') {
                const selectedEntity = AVAILABLE_ENTITIES.find(ent => ent.name === value);
                if (selectedEntity) {
                    updates.entity_code = selectedEntity.code;
                }
            }
            return updates;
        });
    };

    const handleRoleToggle = (roleValue) => {
        setFormData(prev => {
            const currentRoles = prev.roles || ['employee'];
            if (currentRoles.includes(roleValue)) {
                if (currentRoles.length === 1) {
                    toast.error('User must have at least one role');
                    return prev;
                }
                return { ...prev, roles: currentRoles.filter(r => r !== roleValue) };
            } else {
                return { ...prev, roles: [...currentRoles, roleValue] };
            }
        });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.entity) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing) {
                await updateUser(editId, {
                    name: formData.name,
                    email: formData.email,
                    entity: formData.entity,
                    roles: formData.roles,
                });
            } else {
                await createUser({
                    name: formData.name,
                    email: formData.email,
                    roles: formData.roles,
                    entity: formData.entity,
                    level: formData.level,
                    status: formData.status,
                    entity_code: formData.entity_code
                });
            }

            // Refresh list
            const updatedUsers = await getAdminUsers();
            setUsers(updatedUsers);

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                entity: AVAILABLE_ENTITIES[0]?.name || '',
                level: '',
                status: 'active',
                entity_code: AVAILABLE_ENTITIES[0]?.code || '',
                roles: ['employee']
            });
            setIsEditing(false);
            setEditId(null);
            toast.success(isEditing ? "User updated successfully!" : "User created successfully!");
        } catch (error) {
            console.error("Error saving user:", error);
            toast.error(error.message || "Failed to save user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteUser = (id) => {
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete);
            setUsers(users.filter(u => u._id !== userToDelete));
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const handleEditClick = (userItem) => {
        setFormData({
            name: userItem.name,
            email: userItem.email,
            password: '',
            entity: userItem.entity || (entities[0]?.name || ''),
            level: userItem.level || '',
            status: userItem.status || 'active',
            entity_code: userItem.entity_code || '',
            roles: userItem.roles || ['employee']
        });
        setEditId(userItem._id);
        setIsEditing(true);
        setCreationMode('manual');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            entity: AVAILABLE_ENTITIES[0]?.name || '',
            level: '',
            status: 'active',
            entity_code: AVAILABLE_ENTITIES[0]?.code || '',
            roles: ['employee']
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return toast.error("Please select a file");
        setIsSubmitting(true);
        try {
            const res = await uploadEmployees(uploadFile);
            toast.success(res.message);
            if (res.errors && res.errors.length > 0) {
                res.errors.forEach(err => toast.error(err, { duration: 5000 }));
            }
            const updatedUsers = await getAdminUsers();
            setUsers(updatedUsers);
            setUploadFile(null);
            // reset file input?
            document.getElementById('csvInput').value = "";
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to upload');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="space-y-8 animate-up">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete User"
                isDanger={true}
            />
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage users, assign roles and control access</p>
                </div>
            </div>

            {/* Action Tabs */}
            <div className="flex gap-4">
                <button
                    onClick={() => { setCreationMode('manual'); setIsEditing(false); }}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${creationMode === 'manual' || isEditing ? 'bg-zuari-navy text-white shadow-lg shadow-blue-900/20' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
                >
                    Manual Creation
                </button>
                <button
                    onClick={() => { setCreationMode('bulk'); setIsEditing(false); }}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${creationMode === 'bulk' ? 'bg-zuari-navy text-white shadow-lg shadow-blue-900/20' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
                >
                    Bulk Upload
                </button>
            </div>

            {/* Form Container */}
            {(creationMode || isEditing) && (
                <div className="w-full">
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-full relative animate-up">
                        <button
                            onClick={() => { setCreationMode(null); setIsEditing(false); }}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        {creationMode === 'manual' || isEditing ? (
                            <>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{isEditing ? 'Edit User' : 'Create New User'}</h3>
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Ex. Jane Doe"
                                                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Work Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="jane@zuari.com"
                                                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assign Entity</label>
                                            <div className="relative">
                                                <select
                                                    name="entity"
                                                    value={formData.entity}
                                                    onChange={handleChange}
                                                    className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    <option value="" disabled>Select Entity</option>
                                                    {AVAILABLE_ENTITIES.map(ent => (
                                                        <option key={ent.code} value={ent.name}>{ent.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assign Roles</label>
                                            <div className="flex flex-wrap gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                                                {AVAILABLE_ROLES.map(role => (
                                                    <label
                                                        key={role.value}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all text-sm font-semibold border ${formData.roles?.includes(role.value)
                                                            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.roles?.includes(role.value) || false}
                                                            onChange={() => handleRoleToggle(role.value)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${formData.roles?.includes(role.value)
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'border-gray-300 dark:border-slate-500'
                                                            }`}>
                                                            {formData.roles?.includes(role.value) && (
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                            )}
                                                        </div>
                                                        {role.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Level</label>
                                            <input
                                                type="text"
                                                name="level"
                                                value={formData.level}
                                                onChange={handleChange}
                                                placeholder="L3"
                                                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                                            <div className="relative">
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-2xl font-bold transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-4 bg-zuari-navy hover:bg-[#122856] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70"
                                        >
                                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center flex flex-col items-center justify-center h-[70%] py-12">
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Upload Users CSV</h3>
                                <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">Import your CSV file to bulk-create users. Ensure required headers are present.</p>

                                <input
                                    type="file"
                                    id="csvInput"
                                    accept=".csv,.xlsx,.xls"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <div className="flex gap-4 w-full max-w-md mx-auto">
                                    <button
                                        onClick={() => document.getElementById('csvInput').click()}
                                        className="flex-1 py-3 bg-zuari-navy text-white rounded-2xl font-bold hover:bg-[#122856] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        {uploadFile ? uploadFile.name.substring(0, 15) + (uploadFile.name.length > 15 ? '...' : '') : 'Choose File'}
                                    </button>
                                    <button
                                        onClick={downloadEmployeeTemplate}
                                        className="flex-1 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        Template
                                    </button>
                                </div>

                                {uploadFile && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={isSubmitting}
                                        className="w-full max-w-md mx-auto mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-900/20 disabled:opacity-70"
                                    >
                                        {isSubmitting ? 'Uploading...' : 'Upload & Process'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="w-full">
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">All Users</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700">
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Roles</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company Entity</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Level</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {users.map((userItem) => (
                                    <tr key={userItem._id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold shadow-inner">
                                                    {userItem.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-white">{userItem.name}</div>
                                                    <div className="text-xs text-gray-400">{userItem.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(userItem.roles || []).map(role => {
                                                    const colorMap = {
                                                        employee: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                                                        admin: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                                                        superAdmin: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                                    };
                                                    const labelMap = { employee: 'Employee', admin: 'Admin', superAdmin: 'Super Admin' };
                                                    return (
                                                        <span key={role} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorMap[role] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                            {labelMap[role] || role}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                                {userItem.entity}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                {userItem.level || '-'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${userItem.status === 'inactive'
                                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-800'
                                                }`}>
                                                {userItem.status === 'inactive' ? 'Inactive' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                {new Date(userItem.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(userItem)}
                                                className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all mr-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => confirmDeleteUser(userItem._id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-gray-400">No users found.</td>
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

export default AdminEmployees;
