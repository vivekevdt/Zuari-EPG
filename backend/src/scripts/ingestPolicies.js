import { v4 as uuid } from "uuid";
import { db, schema } from "../db/lancedb.js";

// Recreate table fresh for ingestion
const table = await db.createEmptyTable("policies", schema, { mode: "overwrite" });
import embed from "../utils/embeddings.js";
import { loadPDF, loadDOCX } from "../utils/textLoaders.js";
import generateChunks from "../utils/generateChunks.js";


const policies = [
    { name: "Leave Policy", path: "../files/01_leave_and_holidays_policy.docx", type: "docx" },
    { name: "HR Policy", path: "../files/02_working_hours_policy.docx", type: "docx" },
    { name: "Holiday Policy", path: "../files/03_holiday_list.docx", type: "docx" },
];

for (const p of policies) {
    const text =
        p.type === "pdf"
            ? await loadPDF(p.path)
            : await loadDOCX(p.path);

    if (!text || text.length === 0) {
        console.error(`❌ FAILED to load text for ${p.name}`);
        continue;
    }
    console.log(`Loaded ${text.length} chars for ${p.name}`);

    // const chunks = chunkText(text);
    const chunks = await generateChunks(text);
    console.log("chunks", chunks);
    const filteredChunks = chunks.filter(c => c?.content?.trim().length > 20);


    console.log(`Total chunks created: ${filteredChunks.length}`);

    if (filteredChunks.length === 0) {
        console.warn(`⚠️ No valid chunks for ${p.name}, skipping...`);
        continue;
    }


    const vectors = await embed(
        filteredChunks.map(c => c.content)
    );


    const rows = filteredChunks.map((chunk, i) => ({
        id: uuid(),
        vector: Array.from(vectors[i]), // Ensure plain array
        content: String(chunk.content || ""), // Ensure string
        heading: chunk.heading ? String(chunk.heading) : null, // Handle null/undefined
        policy: String(p.name),
    }));


    await table.add(rows);
    console.log(`✅ ${p.name} stored`);
}
