/**
 * Generates a CSV string from an array of objects.
 * @param {Array<Object>} data - The data to convert.
 * @param {Array<string>} headers - The headers for the CSV.
 * @returns {string} - The CSV string.
 */
export const generateCSV = (data, headers) => {
    if (!data || !data.length) return '';

    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] === undefined || row[header] === null ? '' : row[header];
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\r\n');
};
