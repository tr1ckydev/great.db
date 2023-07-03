export default class Table<T extends { [s: string]: any; }>{
    public readonly name: string;
    private readonly db;
    constructor(name: string, schema: string, db: any) {
        this.name = name;
        this.db = db;
        this.db.exec(`CREATE TABLE IF NOT EXISTS ${this.name}(${schema})`);
    }
    get(keyName: keyof T, keyValue: T[keyof T]): T | null;
    get(keyName: keyof T, keyValue: T[keyof T], fetchAll: true): T[];
    get(keyName: keyof T, keyValue: T[keyof T], fetchAll: false): T | null;
    get(keyName: keyof T, keyValue: T[keyof T], fetchAll = false) {
        const res = this.db.prepare(`SELECT * FROM ${this.name} WHERE ${keyName as string} = ?`)[fetchAll ? "all" : "get"](keyValue);
        return !res ? null : res;
    }
    has(keyName: keyof T, keyValue: T[keyof T]) {
        return !!(this.get(keyName, keyValue));
    }
    set(...data: T[]) {
        data.forEach(row => {
            const [keyName, keyValue] = Object.entries(row)[0];
            const keys = Object.keys(row);
            if (this.has(keyName as keyof T, keyValue)) {
                this.db.prepare(`UPDATE ${this.name} SET ${keys.map(x => x + " = ?").join(", ")} WHERE ${keyName} = ?`).run(...Object.values(row), keyValue);
            } else {
                this.db.prepare(`INSERT INTO ${this.name} (${keys.join(", ")}) VALUES (${"?, ".repeat(keys.length).slice(0, -2)})`).run(...Object.values(row));
            }
        });
    }
    delete(keyName: keyof T, keyValue: T[keyof T]) {
        this.db.prepare(`DELETE FROM ${this.name} WHERE ${keyName as string} = ?`).run(keyValue);
    }
    filter(action: "Select" | "Delete", options: Partial<{
        condition: string,
        pattern: string,
        fromKeys: (keyof T)[],
        unique: boolean,
        operation: "Min" | "Max" | "Avg" | "Sum" | "Count",
        sort: { keyName: keyof T, type: "Ascending" | "Descending"; }[],
        limit: number;
    }>) {
        const what = (options.unique ? "DISTINCT " : "")
            + (options.fromKeys ? options.fromKeys?.join(", ") : "*");
        const finalQuery = `${action} `
            + (options.operation ? `${options.operation}(${what}) AS result` : what)
            + ` FROM ${this.name}`
            + (options.condition ? ` WHERE ${this.parseCondition(options.condition)}` : "")
            + (options.pattern ? ` LIKE ${options.pattern}` : "")
            + (options.sort ? ` ORDER BY ${options.sort?.map(x => `${x.keyName as string} ${x.type === "Ascending" ? "ASC" : "DESC"}`).join(", ")}` : "")
            + (options.limit ? ` LIMIT ${options.limit}` : "");
        const res = this.db.prepare(finalQuery).all();
        return options.operation ? res[0].result : res;
    }
    private parseCondition(condition: string) {
        return condition
            .replaceAll(/===|==/g, "=")
            .replaceAll("&&", " AND ")
            .replaceAll("||", " OR ");
    }
}