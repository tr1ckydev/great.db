import { GreatDB, Schema } from "great.db";

// Creating the database
const db = new GreatDB.Database({
    type: GreatDB.Type.Disk,
    name: "test",
    mode: GreatDB.Mode.ReadWrite
});

// Defining the schema type for typescript
type schemaType = {
    id: number,
    name: string,
    phone: number,
    address: string,
    member: boolean
};

// Creating the schema and the table
const customerSchema = Schema.Create({
    id: Number,
    name: String,
    phone: Number,
    address: String,
    member: Boolean
});
const table = db.table<schemaType>("customers", customerSchema);

// Populating the table
await table.set({
    id: 1,
    name: "John Doe",
    phone: 1234567890,
    address: "Obere Str. 57",
    member: false
});
await table.set({
    id: 2,
    name: "Adam Evans",
    phone: 6789067890,
    address: "120 Hanover Sq.",
    member: true
});
await table.set({
    id: 3,
    name: "Frank Smith",
    phone: 1234512345,
    address: "City Center Plaza 516 Main St.",
    member: true
});

// Retrieving a value
const x = await table.get("id", 1);
console.log(x.address);   // Obere Str. 57

// Updating specific value(s) of a particular "id"
await table.set({ id: 1, address: "8 Johnstown Road" });

// Retrieving the new value
const y = await table.get("id", "1");
console.log(y.address);   // 8 Johnstown Road

// Closing the database after all tasks are done
db.close();