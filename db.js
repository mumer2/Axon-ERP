import * as SQLite from "expo-sqlite";

let db;

export async function initDB() {
  db = await SQLite.openDatabaseAsync("appdata.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT
    );
  `);

  return db;
}

export async function addUser(name, email, phone) {
  await db.runAsync(
    "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
    [name, email, phone]
  );
}

export async function getUsers() {
  return await db.getAllAsync("SELECT * FROM users");
}
