import { table } from "../db/lancedb.js";

import embed from "../utils/embeddings.js";

export async function searchPolicy(question, user, topK = 4) {

    const [queryVector] = await embed([question]);

    let searchBuilder = table.search(queryVector);

    if (user) {
        let conditions = [];

        // 1. Entity Filter
        if (user.entity) {
            const safeEntity = String(user.entity).replace(/'/g, "\\'");
            conditions.push(`entity LIKE '%${safeEntity}%'`);
        }

        // 2. Impact Level Filter
        if (user.level) {
            const safeLevel = String(user.level).replace(/'/g, "\\'");
            conditions.push(`impactLevel LIKE '%${safeLevel}%'`);
        }

        // 3. Employee Category Filter
        if (user.empCategory) {
            const safeCategory = String(user.empCategory).replace(/'/g, "\\'");
            conditions.push(`empCategory LIKE '%${safeCategory}%'`);
        }

        // Combine all conditions with AND
        if (conditions.length > 0) {
            const whereClause = conditions.join(" AND ");
            searchBuilder = searchBuilder.where(whereClause);
        }
    }

    const results = await searchBuilder
        .limit(topK)
        .toArray();

    return results;
}
