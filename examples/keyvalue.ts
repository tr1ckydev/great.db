import { GreatDB, Schema } from "great.db";

// Creating the database
const db = new GreatDB.Database({
    type: GreatDB.Type.Disk,
    name: "test",
    mode: GreatDB.Mode.ReadWrite
});

// Creating the table
const table = db.table<Schema.Types.KeyValue>("names", Schema.Presets.KeyValue);

// Populating the table
await table.set({ key: "1", value: "John Doe" });
await table.set({ key: "2", value: "Adam Evans" });
await table.set({ key: "3", value: "Frank Smith" });

// Retrieving a value
const x = await table.get("key", "1");
console.log(x.value);   // John Doe

// Updating an already present key with a different value
await table.set({ key: "1", value: "Mike William" });

// Retrieving the new value
const y = await table.get("key", "1");
console.log(y.value);   // Mike William

// Closing the database after all tasks are done
db.close();