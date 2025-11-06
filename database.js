import * as SQLite from "expo-sqlite";

// Open database
const db = SQLite.openDatabaseSync("customer0DB.db");

// ✅ Initialize Database
export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS customer (
      entity_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      last_seen TEXT,
      visited BOOLEAN DEFAULT 0
    );
  `);

  // Insert dummy data if table is empty
  const existing = await db.getAllAsync("SELECT COUNT(*) as count FROM customer");
  if (existing?.[0]?.count === 0) {
   await db.runAsync(`
  INSERT INTO customer (name, phone, last_seen, visited) VALUES
  ('John Doe', '123456789', '2025-11-06 10:00', 1),
  ('Jane Smith', '987654321', '2025-11-05 18:30', 0),
  ('Alice Johnson', '555666777', '2025-11-06 09:15', 1),
  ('Bob Williams', '111222333', '2025-11-04 14:20', 0),
  ('Carol Brown', '444555666', '2025-11-06 08:45', 1),
  ('David Miller', '777888999', '2025-11-03 19:10', 0),
  ('Eva Davis', '222333444', '2025-11-06 11:30', 1),
  ('Frank Wilson', '333444555', '2025-11-05 16:50', 0),
  ('Grace Lee', '666777888', '2025-11-06 07:25', 1),
  ('Henry Taylor', '999000111', '2025-11-04 12:40', 0),
  ('Ivy Anderson', '555444333', '2025-11-06 09:50', 1),
  ('Jack Thomas', '111333555', '2025-11-05 20:05', 0),
  ('Karen Martin', '444666888', '2025-11-06 10:15', 1),
  ('Leo Harris', '777999111', '2025-11-03 15:30', 0),
  ('Mia Clark', '222555777', '2025-11-06 08:05', 1),
  ('Noah Lewis', '333666999', '2025-11-05 17:25', 0),
  ('Olivia Robinson', '666111444', '2025-11-06 07:55', 1),
  ('Peter Walker', '999222555', '2025-11-04 11:10', 0),
  ('Quinn Hall', '555777222', '2025-11-06 09:40', 1),
  ('Rachel Young', '111444777', '2025-11-05 18:00', 0)
`);

  }
};

// ✅ Get All Customers
export const getAllCustomers = async () => {
  const result = await db.getAllAsync("SELECT * FROM customer ORDER BY entity_id DESC");
  return result;
};

// ✅ Search Customers by Name
export const searchCustomers = async (query) => {
  const result = await db.getAllAsync(
    "SELECT * FROM customer WHERE name LIKE ? ORDER BY entity_id DESC",
    [`%${query}%`]
  );
  return result;
};

// ✅ Update Visited Status
export const updateVisited = async (id, visited) => {
  await db.runAsync("UPDATE customer SET visited = ? WHERE entity_id = ?", [visited, id]);
};

// Add new customer
export const addCustomer = async (name, phone, last_seen, visited = 0) => {
  await db.runAsync(
    "INSERT INTO customer (name, phone, last_seen, visited) VALUES (?, ?, ?, ?)",
    [name, phone, last_seen, visited]
  );
};

