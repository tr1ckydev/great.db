import { Database, SQLQueryBindings } from "bun:sqlite";

type KeyType = string | number;

export default class Table<T>{
    private name: string;
    public db: Database;
    constructor(name: string, schema: string, db: Database) {
        this.name = name;
        this.db = db;
        this.db.run(`CREATE TABLE IF NOT EXISTS ${this.name} (${schema})`);
    }
    async get(keyName: string, keyValue: KeyType, fetchAll = false) {
        return this.db.query(`SELECT * FROM ${this.name} WHERE ${keyName} = ?`)[fetchAll ? "all" : "get"](keyValue) as T;
    }
    async has(keyName: string, keyValue: KeyType) {
        return (await this.get(keyName, keyValue)) !== null;
    }
    async set(data: T) {
        const [keyName, keyValue] = Object.entries(data)[0];
        const keys = Object.keys(data);
        if (await this.has(keyName, keyValue)) {
            this.db.run(`UPDATE ${this.name} SET ${keys.map(x => x + " = ?").join(", ")} WHERE ${keyName} =  ?`,
                ...Object.values(data), keyValue);
        } else {
            this.db.run(`INSERT INTO ${this.name} (${keys.join(", ")}) VALUES (${"?, ".repeat(keys.length).slice(0, -2)})`,
                ...Object.values(data));
        }
    }
    async delete(keyName: string, keyValue: KeyType) {
        this.db.run(`DELETE FROM ${this.name} WHERE ${keyName} = ?`, keyValue);
    }
    async toArray() {
        return this.db.query<SQLQueryBindings, T>(`SELECT * FROM ${this.name}`).all();
    }
}