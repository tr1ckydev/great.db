import { DataType, GreatDB, Schema } from "great.db";

// The following database has been used in this example:
// http://2016.padjo.org/files/data/starterpack/simplefolks.sqlite

// Opening the database
const db = new GreatDB.Database({
    type: GreatDB.Type.File,
    name: "simplefolks.sqlite"
});

// Creating the schema and the table
const homesSchema = Schema.Create({
    owner_name: DataType.String,
    area: DataType.String,
    value: DataType.Number
});
const table = db.table("homes", homesSchema);

const a = table.filter("Select", {
    condition: "area !== 'suburbs' && value > 180000",
    sort: [{ keyName: "value", type: "Ascending" }],
    limit: 5
}) as any[];
console.log(a);

const b = table.filter("Select", {
    condition: "value < 150000 && area === 'country'",
    sort: [{ keyName: "owner_name", type: "Ascending" }],
    limit: 3
}) as any[];
console.log(b?.map(x => x.owner_name).join(", "));

const c = table.filter("Select", {
    condition: "area !== 'suburbs'",
    unique: true,
    fromKeys: ["value"],
    operation: "Avg"
}) as number;
console.log(c);

// Closing the database after all tasks are done
db.close();