import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAdminUsers, getEntities, createUser, deleteUser, updateUser } from '../../api';

import ConfirmationModal from '../../components/ConfirmationModal';

const AdminEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        entity: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, entitiesData] = await Promise.all([
                    getAdminUsers(),
                    getEntities()
                ]);
                setEmployees(usersData);
                setEntities(entitiesData);
                if (entitiesData.length > 0) {
                    setFormData(prev => ({ ...prev, entity: entitiesData[0].name }));
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.entity) {
            toast.error("Please fill all fields (Password is optional for editing)");
            return;
        }

        if (!isEditing && !formData.password) {
            toast.error("Password is required for new employees");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing) {
                await updateUser(editId, {
                    name: formData.name,
                    email: formData.email,
                    entity: formData.entity,
                    ...(formData.password ? { password: formData.password } : {})
                });
            } else {
                await createUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    entity: formData.entity,
                    role: 'user'
                });
            }

            // Refresh list
            const updatedUsers = await getAdminUsers();
            setEmployees(updatedUsers);

            // Reset form
            setFormData(prev => ({
                name: '',
                email: '',
                password: '',
                entity: entities[0]?.name || ''
            }));
            setIsEditing(false);
            setEditId(null);
            toast.success(isEditing ? "Employee updated successfully!" : "Employee created successfully!");
        } catch (error) {
            console.error("Error creating employee:", error);
            toast.error(error.message || "Failed to create employee");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteEmployee = (id) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteEmployee = async () => {
        if (!employeeToDelete) return;
        try {
            await deleteUser(employeeToDelete);
            setEmployees(employees.filter(emp => emp._id !== employeeToDelete));
            toast.success("Employee deleted successfully");
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Failed to delete employee");
        }
    };

    const handleEditClick = (employee) => {
        setFormData({
            name: employee.name,
            email: employee.email,
            password: '',
            entity: employee.entity || (entities[0]?.name || '')
        });
        setEditId(employee._id);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            entity: entities[0]?.name || ''
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading employees...</div>;

    return (
        <div className="space-y-8 animate-up">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEmployee}
                title="Delete Employee"
                message="Are you sure you want to delete this employee? This action cannot be undone."
                confirmText="Delete Employee"
                isDanger={true}
            />
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">Employee Directory</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage organization access and team members</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Add New Member Form */}
                <div className="lg:w-1/3">
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{isEditing ? 'Edit Member' : 'Add New Member'}</h3>

                        <form onSubmit={handleCreateEmployee} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ex. Jane Doe"
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{isEditing ? 'New Password (Optional)' : 'Initial Password'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assign Entity</label>
                                <div className="relative">
                                    <select
                                        name="entity"
                                        value={formData.entity}
                                        onChange={handleChange}
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select Entity</option>
                                        {entities.map(ent => (
                                            <option key={ent._id} value={ent.name}>{ent.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
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
                                    {isSubmitting ? 'Saving...' : (isEditing ? 'Update Employee' : 'Create Employee')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Active Employees List */}
                <div className="lg:w-2/3">
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Active Employees</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700">
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company Entity</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined On</th>
                                        <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {employees.map((employee) => (
                                        <tr key={employee._id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold mb-3 shadow-inner">
                                                        {employee.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800 dark:text-main">{employee.name}</div>
                                                        <div className="text-xs text-gray-400">{employee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                                    {employee.entity}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                    {new Date(employee.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={() => handleEditClick(employee)}
                                                    className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all mr-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => confirmDeleteEmployee(employee._id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-400">No employees found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmployees;
