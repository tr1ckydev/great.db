# Table of Contents

- [Installation](#installation)
- [new Database()](#new-databaseconfig---greatdbdatabase)
- [Schema](#schema)
  - [Schema#Create()](#create--)
  - [Schema#Presets](#presets)

- [Database#table()](#databasetablename-schema---table)
  - [table#name - Name of the table](#name---string)
  - [table#set() - Insert/Update data to table](#set-----promisevoid)
  - [table#get() - Retrieve data from table](#getkeyname-string-keyvalue---promiserowobject--null--undefined)
  - [table#has() - Check if a value exists](#haskeyname-string-keyvalue---promiseboolean)
  - [table#delete() - Delete row(s) based on a value](#deletekeyname-string-keyvalue---promisevoid)
  - [table#toArray() -  Convert entire table to an array](#toarray---promisearrayofrowobjects)
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



## new Database(config) -> `GreatDB.Database`

- `config.type`: The following options are accepted.
  - `GreatDB.Type.Disk`: To create/open a sqlite database file.
  - `GreatDB.Type.Memory`: To create an in-memory database. (If you have chosen this, then the following options aren't required)
- `config.name`: The name of the database file.
- `config.location?`: The path where the database file will be stored/opened from. If not provided, the root directory of your project will be chosen by default.

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
import { Schema } from "great.db";
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

- KeyValue

  | key `String` | value `String` |
  | :----------: | :------------: |



## Database#table(name, schema) -> `Table`

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

### .get(keyName `string`, keyValue) -> `Promise<rowObject | null | undefined>`

Retrieve data from the table with the supplied key data. Returns the first row if a match is found else `null` or `undefined`.

```typescript
const x = await table.get("id", 1);
console.log(x.address);   // Obere Str. 57
```

### .has(keyName `string`, keyValue) -> `Promise<boolean>`

Checks if the supplied key data already exists in the table.

```typescript
const x = await table.has("name", "John Doe");
console.log(x);   // true
```

### .delete(keyName `string`, keyValue) -> `Promise<void>`

Deletes the row(s) where ever the supplied key data matches.

```typescript
await table.delete("name", "John Doe");
```

### .toArray() -> `Promise<arrayOfrowObjects>`

Retrieves all the rows from the current table and returns them in the form of an array containing row objects.

```typescript
await table.toArray();
```



## Database#close()

```typescript
db.close();
```

To close the currently working database after all the tasks have been done. Executing any operation further will result into an error.
