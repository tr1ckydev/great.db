import { GreatDB, Schema } from "great.db";

// Creating the database
const db = new GreatDB.Database({
    type: GreatDB.Type.File,
    name: "test.sqlite"
});

// Creating the table
const table = db.table("addressList", Schema.Presets.KeyValue);

// Populating the table
table.set(
    { key: "John Doe", value: "Obere Str. 57" },
    { key: "Adam Evans", value: "120 Hanover Sq." },
    { key: "Frank Smith", value: "City Center Plaza 516 Main St." }
);

// Retrieving a value
const x = table.get("key", "John Doe");
console.log(x?.value);   // Obere Str. 57

// Updating an already present key with a different value
table.set({ key: "John Doe", value: "9 Hawthorne St." });

// Retrieving the new value
const y = table.get("key", "John Doe");
console.log(y?.value);   // 9 Hawthorne St.

// Closing the database after all tasks are done
db.close();