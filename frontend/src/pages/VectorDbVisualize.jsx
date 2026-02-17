
import React, { useState, useEffect } from "react";

const VectorDbVisualize = () => {
    const [data, setData] = useState([]);
    const [dbSize, setDbSize] = useState('0 Bytes');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/vDB-visualize")
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
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Vector DB Data...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="h-screen w-full overflow-y-auto bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Vector DB Visualization</h1>
                <div className="flex gap-6 mb-4 text-gray-600">
                    <p>Total Records: <span className="font-semibold">{data.length}</span></p>
                    <p>Storage Size: <span className="font-semibold">{dbSize}</span></p>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="sticky top-0 z-10 px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-sm">
                                        ID
                                    </th>
                                    <th className="sticky top-0 z-10 px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-sm">
                                        Entity
                                    </th>
                                    <th className="sticky top-0 z-10 px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-sm">
                                        Policy
                                    </th>
                                    <th className="sticky top-0 z-10 px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-sm">
                                        Heading
                                    </th>
                                    <th className="sticky top-0 z-10 px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-sm">
                                        Content Preview
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{row.id || "N/A"}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                                <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                                <span className="relative">{row.entity || "Global"}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap font-medium">{row.policy}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{row.heading || "Section"}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="text-gray-600 truncate max-w-lg" title={row.content}>
                                                {row.content}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length === 0 && (
                            <div className="p-6 text-center text-gray-500">No vector data found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VectorDbVisualize;
