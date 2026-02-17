import React, { useState, useEffect } from 'react';
import { getAdminInteractions, getEntities } from '../../api';

const AdminInteractions = () => {
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [entities, setEntities] = useState([]);
    const [filters, setFilters] = useState({
        entity: '',
        name: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const data = await getEntities();
                setEntities(data);
            } catch (error) {
                console.error("Error fetching entities:", error);
            }
        };
        fetchEntities();
    }, []);

    useEffect(() => {
        const fetchInteractions = async () => {
            setLoading(true);
            try {
                // Only send non-empty filters
                const activeFilters = {};
                if (filters.entity && filters.entity !== 'All Entities') activeFilters.entity = filters.entity;
                if (filters.name) activeFilters.name = filters.name;
                if (filters.startDate) activeFilters.startDate = filters.startDate;
                if (filters.endDate) activeFilters.endDate = filters.endDate;

                const data = await getAdminInteractions(activeFilters);
                setInteractions(data);
            } catch (error) {
                console.error("Error fetching interactions:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search for name
        const timeoutId = setTimeout(() => {
            fetchInteractions();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            // Reset name if entity is cleared/changed to All (optional based on UX, but "user cannot select name if he do not select entity" implies dependency)
            // Actually request says: "user cannot select name if he do not select entity"
            if (key === 'entity' && (value === '' || value === 'All Entities')) {
                newFilters.name = '';
            }
            return newFilters;
        });
    };

    return (
        <div className="space-y-8 animate-up">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">User Monitoring</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and analyze all user questions</p>
                </div>

                <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700">
                    <h2 className="text-5xl font-black text-gray-800 dark:text-white tracking-tight mb-4">Coming Soon</h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 text-center max-w-md">
                        We are working hard to bring you advanced user monitoring and analytics. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminInteractions;
