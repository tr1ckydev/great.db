export const DataType = {
    String: "",
    Number: 0,
    BigInt: BigInt(0),
    Boolean: false,
    Uint8Array: new Uint8Array(),
    Buffer: globalThis.Buffer?.from(""),
    AutoIncrement: 1,
};

export namespace Schema {
    export function Create<T extends { [s: string]: string | number | bigint | boolean | Uint8Array | Buffer; }>(schema: T) {
        let parsed = "", SQLDataType = "";
        for (const [key, value] of Object.entries(schema)) {
            switch (value) {
                case "": SQLDataType = "TEXT"; break;
                case 0: SQLDataType = "INTEGER"; break;
                case BigInt(0): SQLDataType = "BIGINT"; break;
                case false: SQLDataType = "BOOLEAN"; break;
                case new Uint8Array():
                case globalThis.Buffer?.from(""):
                    SQLDataType = "BLOB"; break;
                case 1: SQLDataType = "INTEGER PRIMARY KEY AUTOINCREMENT"; break;
                default: throw Error("error: Unknown datatype in schema. Use 'DataType' only!");
            }
            parsed += (key + " " + SQLDataType + ", ");
        }
        return { parsed: parsed.slice(0, -2), schema: {} as Partial<T> };
    }
    export const Presets = {
        KeyValue: Schema.Create({ key: DataType.String, value: DataType.String }),
    };
}