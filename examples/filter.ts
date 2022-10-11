import { DataType, GreatDB, Schema } from "great.db";

// The following database has been used in this example:
// http://2016.padjo.org/files/data/starterpack/simplefolks.sqlite

// Opening the database
const db = new GreatDB.Database({
    type: GreatDB.Type.Disk,
    name: "simplefolks"
});

// Creating the schema and the table
const homesSchema = Schema.Create({
    owner_name: DataType.String,
    area: DataType.String,
    value: DataType.Number
});
const table = db.table("homes", homesSchema);

const a = await table.filter({
    condition: "area !== 'suburbs' && value > 180000",
    sort: [{ keyName: "value", type: "Ascending" }],
    limit: 5
}) as any[];
console.log(a);

const b = await table.filter({
    condition: "value < 150000 && area === 'country'",
    sort: [{ keyName: "owner_name", type: "Ascending" }],
    limit: 3
}) as any[];
console.log(b?.map(x => x.owner_name).join(", "));

const c = await table.filter({
    condition: "area !== 'suburbs'",
    unique: true,
    fromKeys: ["value"],
    operation: "Avg"
}) as number;
console.log(c);

// Closing the database after all tasks are done
await db.close();