export default class Table<T extends { [s: string]: any; }>{
    public readonly name: string;
    private readonly db;
    constructor(name: string, schema: string, db: any) {
        this.name = name;
        this.db = db;
        this.db.exec(`CREATE TABLE IF NOT EXISTS ${this.name}(${schema})`);
    }
    async get(keyName: keyof T, keyValue: T[keyof T]): Promise<T | null | undefined>;
    async get(keyName: keyof T, keyValue: T[keyof T], fetchAll: true): Promise<T[]>;
    async get(keyName: keyof T, keyValue: T[keyof T], fetchAll: false): Promise<T | null | undefined>;
    async get(keyName: keyof T, keyValue: T[keyof T], fetchAll = false) {
        return this.db.prepare(`SELECT * FROM ${this.name} WHERE ${keyName as string} = ?`)[fetchAll ? "all" : "get"](keyValue);
    }
    async has(keyName: keyof T, keyValue: T[keyof T]) {
        return !!(await this.get(keyName, keyValue));
    }
    async set(data: T | T[]) {
        if (data.constructor === Array) for (const row of data) await this.setRow(row);
        else await this.setRow(data as T);
    }
    private async setRow(data: T) {
        const [keyName, keyValue] = Object.entries(data)[0];
        const keys = Object.keys(data);
        if (await this.has(keyName as keyof T, keyValue)) {
            this.db.prepare(`UPDATE ${this.name} SET ${keys.map(x => x + " = ?").join(", ")} WHERE ${keyName} = ?`).run(...Object.values(data), keyValue);
        } else {
            this.db.prepare(`INSERT INTO ${this.name} (${keys.join(", ")}) VALUES (${"?, ".repeat(keys.length).slice(0, -2)})`).run(...Object.values(data));
        }
    }
    async filter(options: Partial<{
        condition: string,
        fromKeys: (keyof T)[],
        unique: boolean,
        operation: "Min" | "Max" | "Avg" | "Sum" | "Count",
        sort: { keyName: keyof T, type: "Ascending" | "Descending" }[],
        limit: number
    }>) {
        const what = (options.unique ? "DISTINCT " : "")
            + (options.fromKeys ? options.fromKeys?.join(", ") : "*");
        const finalQuery = "SELECT "
            + (options.operation ? `${options.operation}(${what}) AS result` : what)
            + ` FROM ${this.name}`
            + (options.condition ? ` WHERE ${this.parseCondition(options.condition)}` : "")
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
    async delete(keyName: keyof T, keyValue: T[keyof T]) {
        this.db.prepare(`DELETE FROM ${this.name} WHERE ${keyName as string} = ?`).run(keyValue);
    }
}