# Table of Contents

- [Installation](#installation)
- [new Database()](#new-databaseconfig---greatdbdatabase)
- [Schema](#schema)
  - [Schema#Create()](#create--)
  - [Schema#Presets](#presets)
- [Database#table()](#databasetablename-schema---table)
  - [table#name - Name of the table](#name---string)
  - [table#set() - Insert/Update data to table](#set-----promisevoid)
  - [table#get() - Retrieve data from table](#getkeyname-string-keyvalue-fetchall-boolean---promiserowobject--null--undefined)
  - [table#has() - Check if a value exists](#haskeyname-string-keyvalue---promiseboolean)
  - [table#filter() - Carry out complex operations on data](#filteroptions---promiseany)
  - [table#delete() - Delete row(s) based on a value](#deletekeyname-string-keyvalue---promisevoid)
- [Database#executeQuery()](#databaseexecutequeryquery-string---promiseany)
- Database#serialize()
- Database#clone()
- Database#backup()
- [Database#close()](#databaseclose)



## Installation

- ### Using `bun` runtime

  ```
  bun i great.db
  ```

  Installs `great.db` only because `bun:sqlite` is already built into bun runtime.

- ### Using `node.js` runtime

  ```
  npm i great.db better-sqlite3
  ```

  Installs `great.db` along with the dependency `better-sqlite3`.



## new Database(*config*) -> `GreatDB.Database`

- `config.type`: The following options are accepted.
  - `GreatDB.Type.Disk`: To create/open a sqlite database file.
  - `GreatDB.Type.Memory`: To create an in-memory database. (If you have chosen this, then the following options aren't required)
  - `GreatDB.Type.Serialized`: To create database from another previously serialized database. (Generally you would use Database#clone)
- `config.name`: The name of the database file.
- `config.location?`: The path where the database file will be stored/opened from. If not provided, the root directory of your project will be chosen by default.
- `config.data`: (Only for Serialized type) A Buffer or Uint8Array serialized version of a database.

```typescript
import { GreatDB } from "great.db";
const db = new GreatDB.Database({
    type: GreatDB.Type.Disk,
    name: "test"
});
```



## Schema

Schema is a way to define the columns and their datatypes of your table.

### .Create({ ... })

Create a new schema with the column names along with their datatypes which will be later passed on to the [Database#table](#databasetablename-schema---table).

The following datatypes are available when creating a schema.

| DataType                 | Description                                                  |
| :----------------------- | :----------------------------------------------------------- |
| `DataType.String`        | A javascript string value.                                   |
| `DataType.Number`        | A javascript numeric value supporting both Integers and Decimals. |
| `DataType.BigInt`        | A javascript BigInt value.                                   |
| *`DataType.Boolean`      | A javascript boolean value.                                  |
| *`DataType.Uint8Array`   | A javascript Uint8Array  value.                              |
| `DataType.Buffer`        | A javascript Buffer value.                                   |
| `DataType.AutoIncrement` | An integer datatype which automatically increments whenever a new row is inserted into the table. |

> DataTypes marked with an asterisk(*) only support `bun:sqlite` and do not work with `better-sqlite3`.

```typescript
// Example
import { Schema, DataType } from "great.db";
const customerSchema = Schema.Create({
    id: DataType.AutoIncrement,
    name: DataType.String,
    phone: DataType.Number,
    address: DataType.String,
    member: DataType.Boolean
});
```

### .Presets

Some commonly used presets are available to save your time in creating a schema for it.

- `KeyValue`

  | key `String` | value `String` |
  | :----------: | :------------: |

- More coming soon...



## Database#table(*name, schema*) -> `Table`

Creates/Opens a table from the database with the name provided along with the schema created earlier or a preset.

```typescript
const table = db.table("customers", customerSchema);
// const table = db.table("addressList", Schema.Presets.KeyValue);
```

### .name -> `string`

Returns the name of the table that this instance is currently operating with.

### .set({ ... }) -> `Promise<void>`

From the passed object data, the first entry of the object is always treated as the *key* which means great.db will check if there is any row already having that value in that column. Three cases arise after that:

- #### If there is an AutoIncrement column

  There is no need to mention it when inserting data (Snippet 1 below) unless you want to update any existing value of that row (Snippet 2 below).

- #### If the key is not present

  The supplied data is inserted as a new row into the table (Snippet 1 below).

- #### If the key is present

  The row having that key will be selected and the rest of the supplied data will update the old data of that row (Snippet 2 below).

```typescript
// Snippet 1
await table.set({
    name: "John Doe",
    phone: 1234567890,
    address: "Obere Str. 57",
    member: false
});

// Snippet 2
await table.set({
    id: 1,
    address: "8 Johnstown Road"
});
```

Table after Snippet 1:

|  id  |   name   |   phone    |    address    | member |
| :--: | :------: | :--------: | :-----------: | :----: |
|  1   | John Doe | 1234567890 | Obere Str. 57 | false  |

Table after Snippet 2:

|  id  |   name   |   phone    |     address      | member |
| :--: | :------: | :--------: | :--------------: | :----: |
|  1   | John Doe | 1234567890 | 8 Johnstown Road | false  |

### .get(*keyName* `string`, *keyValue*, *fetchAll?* `boolean`) -> `Promise<rowObject | null | undefined>`

Retrieves data from the table with the supplied key data. If fetchAll is `true` it returns all the row(s) where the key matches else only the first row. If no key matches then `null`, `undefined` or `[]`(fetchAll is `true`) is returned.

```typescript
const x = await table.get("id", 1);
console.log(x.address);   // Obere Str. 57
```

To perform more complex queries based on conditions to retrieve data, jump to [table#filter()](#filteroptions---promiseany).

### .has(*keyName* `string`, *keyValue*) -> `Promise<boolean>`

Checks if the supplied key data already exists in the table.

```typescript
const x = await table.has("name", "John Doe");
console.log(x);   // true
```

### .filter(*options*) -> `Promise<any>`

Carry out complex operations easily with lot of options to configure your query. All the properties are optional and if an empty object is passed, the entire table is returned in the form of array of rows.

- options.condition `string`: Any valid javascript expression can be used such as comparing column names with their values using [comparison](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#comparison_operators) or [logical](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#logical_operators) operators. See the example below.
- options.pattern `string`: Search for data in a column, based on a specific pattern. [Learn more](https://www.w3schools.com/sql/sql_like.asp).
- options.fromKeys `keyName[]`: The columns which will be selected specifically.
- options.unique `boolean`: If `true` then duplicate rows will be ignored. (Default is `false`).
- options.operation: Perform various operations on a selected column.
  - `"Min"`: Minimum of all the values in a column.
  - `"Max"`: Maximum from all the values in a column.
  - `"Avg"`: Average of all the values in a column.
  - `"Sum"`: Summation of all the values in a column.
  - `"Count"`: Returns count of all the rows returned by the query (or, you may use the `length` property of the resultant array).
- options.sort `{ keyName: string, type: "Ascending"|"Descending" }[]`: Array of object(s) having column name and the way they should be sorted.
- options.limit `number`: Limit the amount of rows to return.

```typescript
// To get names of first 3 persons for whom the condition matches and sort them in ascending order.
const x = await table.filter({
    condition: "value < 150000 && area === 'country'",
    sort: [{ keyName: "owner_name", type: "Ascending" }],
    limit: 3
}) as any[];
console.log(x.map(a => a.owner_name).join(", "));
```

For more ideas on how to use the filter for various purposes, check out the examples.

> ⚠️ CAUTION: You might construct such a query which isn't supported by SQLite which would hence throw an error.

### .delete(*keyName* `string`, *keyValue*) -> `Promise<void>`

Deletes the row(s) where ever the supplied key data matches.

```typescript
await table.delete("name", "John Doe");
```



## Database#executeQuery(*query* `string`) -> `Promise<any>`

Executes the provided SQL query directly on the current table to perform your custom operation. If no data is returned by the query, `null` is returned.

```typescript
const res = await db.executeQuery("some sql query");
```



## Database#serialize() -> `Buffer | Uint8Array`

Serializes the current database and returns `Buffer` if you are using `better-sqlite3` or `Uint8Array` if using bun:sqlite.



## Database#clone() -> `GreatDB.Database`

Creates a clone of the current database by serializing it first and returning a new `GreatDB.Database` instance of it. Changes to the cloned database doesn't affect the original one.

```typescript
const db2 = db1.clone();
```



## Database#backup(*filename* `string`, *location*? `string`) -> `Promise<void>`

Creates a hard copy on your disk of the current database i.e. cloning the current database contents into a `.sqlite` file which will be created on your disk. Useful for creating hard copy of an in-memory database or just creating a timely backup of the database.

- filename: Name of your database file which you want to create.
- location: (Optional) The path where you want to store the database file. If not mentioned, the current working directory will be chosen by default.

```typescript
await db.backup("db_backup");
```



## Database#close()

```typescript
await db.close();
```

To close the currently working database after all the tasks have been done. Executing any operation further will result into an error.
