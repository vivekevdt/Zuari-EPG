import * as lancedb from "@lancedb/lancedb";
import * as arrow from "apache-arrow";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../policy_db");

export const db = await lancedb.connect(dbPath);

export const schema = new arrow.Schema([
    new arrow.Field("id", new arrow.Utf8(), false),
    new arrow.Field("vector", new arrow.FixedSizeList(3072, new arrow.Field("item", new arrow.Float32())), false),
    new arrow.Field("content", new arrow.Utf8(), false),
    new arrow.Field("heading", new arrow.Utf8(), true),
    new arrow.Field("policy", new arrow.Utf8(), false),
    new arrow.Field("entity", new arrow.Utf8(), false), // Added entity field
]);

let table;
try {
    table = await db.openTable("policies");
} catch (error) {
    table = await db.createEmptyTable("policies", schema);
}

export { table };
