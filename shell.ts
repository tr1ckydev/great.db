import { GreatDB } from "./src";

const db = new GreatDB.Database({ type: GreatDB.Type.Memory });
console.log("Great.DB live SQLite shell (in-memory database)\nType EXIT to terminate.\n");
while (true) {
    const query = prompt("> ") as string;
    if (query === "EXIT") break;
    try {
        const res = await db.executeQuery(query);
        if (res) console.log(res);
    } catch (err) {
        console.log(err);
    }
}