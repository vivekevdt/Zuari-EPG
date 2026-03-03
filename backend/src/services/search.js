import { table } from "../db/lancedb.js";

import embed from "../utils/embeddings.js";

export async function searchPolicy(question, user, topK = 100) {


    const [queryVector] = await embed([question]);

    let searchBuilder = table.search(queryVector);

    if (user) {
        let conditions = [];

        // 1. Entity Filter
        if (user.entity) {
            const entityId = user.entity._id ? String(user.entity._id) : String(user.entity);
            const safeEntity = entityId.replace(/'/g, "\\'");
            conditions.push(`entity LIKE '%${safeEntity}%'`);
        }

        // 2. Impact Level Filter
        if (user.level) {
            const levelId = user.level._id ? String(user.level._id) : String(user.level);
            const safeLevel = levelId.replace(/'/g, "\\'");
            conditions.push(`impactLevel LIKE '%${safeLevel}%'`);
        }

        // 3. Employee Category Filter
        if (user.empCategory) {
            const empCatId = user.empCategory._id ? String(user.empCategory._id) : String(user.empCategory);
            const safeCategory = empCatId.replace(/'/g, "\\'");
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
