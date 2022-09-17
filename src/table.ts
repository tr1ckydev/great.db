export default class Table<T>{
    public readonly name: string;
    private readonly db;
    constructor(name: string, schema: string, db) {
        this.name = name;
        this.db = db;
        this.db.exec(`CREATE TABLE IF NOT EXISTS ${this.name} (${schema})`);
    }
    async get(keyName: keyof T, keyValue: T[keyof T]): Promise<T | null | undefined> {
        return this.db.prepare(`SELECT * FROM ${this.name} WHERE ${keyName as string} = ?`).get(keyValue);
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
    async delete(keyName: keyof T, keyValue: T[keyof T]) {
        this.db.prepare(`DELETE FROM ${this.name} WHERE ${keyName as string} = ?`).run(keyValue);
    }
    async toArray() {
        return this.db.prepare(`SELECT * FROM ${this.name}`).all() as T[];
    }
}