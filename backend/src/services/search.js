import { table } from "../db/lancedb.js";

import embed from "../utils/embeddings.js";

export async function searchPolicy(question, userEntity, topK = 4) {

    const [queryVector] = await embed([question]);

    let searchBuilder = table.search(queryVector);

    if (userEntity) {
        // Simple sanitization to prevent SQL injection-like issues in filter string
        const safeEntity = userEntity.replace(/'/g, "\\'");
        searchBuilder = searchBuilder.where(`entity = '${safeEntity}'`);
    }

    const results = await searchBuilder
        .limit(topK)
        .toArray();

    return results;
}
