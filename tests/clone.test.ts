import { expect, test } from "bun:test";
import { GreatDB, Schema } from "../src";

test("clone database", async () => {

    const db1 = new GreatDB.Database({ type: GreatDB.Type.Memory });
    const table1 = db1.table("hello", Schema.Presets.KeyValue);
    await table1.set({ key: "1", value: "Bob" });

    // Creating a clone and adding more data. (Doesn't affect the original db)
    const db2 = db1.clone();
    const table2 = db2.table("hello", Schema.Presets.KeyValue);
    await table2.set({ key: "2", value: "Robert" });

    // Filter function with an empty object returns all the table data.
    expect(JSON.stringify(
        await table1.filter({})
    )).toBe(JSON.stringify(
        [{ key: "1", value: "Bob" }]
    ));
    expect(JSON.stringify(
        await table2.filter({})
    )).toBe(JSON.stringify(
        [{ key: "1", value: "Bob" }, { key: "2", value: "Robert" }]
    ));

    db1.close();
    db2.close();

});