import { expect, test } from "bun:test";
import { unlinkSync } from "fs";
import { GreatDB, Schema } from "../src";

test("backup database", async () => {

    const db1 = new GreatDB.Database({ type: GreatDB.Type.Memory });
    const table1 = db1.table("hello", Schema.Presets.KeyValue);
    await table1.set({ key: "1", value: "Bob" });

    // Creating a hard copy of the in-memory database above.
    await db1.backup("db_backup");

    // Opening the database file created above.
    const db2 = new GreatDB.Database({
        type: GreatDB.Type.Disk,
        name: "db_backup"
    });
    const table2 = db2.table("hello", Schema.Presets.KeyValue);

    expect(JSON.stringify(
        await table2.filter({})
    )).toBe(JSON.stringify(
        [{ key: "1", value: "Bob" }]
    ));

    // Deleting the created database
    unlinkSync("db_backup.sqlite");

    db1.close();
    db2.close();

});