import { DataType, GreatDB, Schema } from "great.db";

// Creating the database
const db = new GreatDB.Database({
    type: GreatDB.Type.Disk,
    name: "test"
});

// Creating the schema and the table (Typescript types are automagically inferred)
const customerSchema = Schema.Create({
    id: DataType.AutoIncrement,
    name: DataType.String,
    phone: DataType.Number,
    address: DataType.String,
    member: DataType.Boolean
});
const table = db.table("customers", customerSchema);

// Populating the table
await table.set([
    {
        name: "John Doe",
        phone: 1234567890,
        address: "Obere Str. 57",
        member: false
    },
    {
        name: "Adam Evans",
        phone: 6789067890,
        address: "120 Hanover Sq.",
        member: true
    },
    {
        name: "Frank Smith",
        phone: 1234512345,
        address: "City Center Plaza 516 Main St.",
        member: true
    }
]);

// Retrieving a value
const x = await table.get("id", 1);
console.log(x?.address);   // Obere Str. 57

// Updating specific value(s) of a particular "id"
await table.set({ id: 1, address: "8 Johnstown Road" });

// Retrieving the new value
const y = await table.get("id", 1);
console.log(y?.address);   // 8 Johnstown Road

// Closing the database after all tasks are done
await db.close();