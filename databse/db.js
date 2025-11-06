import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("orderItems.db");

// ✅ Initialize Database
export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNo TEXT,
      customerId TEXT,
      customerName TEXT,
      itemId TEXT,
      itemName TEXT,
      quantity INTEGER,
      date TEXT,
      retailPrice REAL,
      itemCode TEXT,
      discountAmount REAL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId TEXT,
      customerName TEXT,
      phone TEXT,
      email TEXT,
      address TEXT
    );
  `);
};

//
// ─── ITEMS CRUD ───────────────────────────────────────────────
//

// ✅ Add New Item
export const addItem = async (item) => {
  const {
    orderNo,
    customerId,
    customerName,
    itemId,
    itemName,
    quantity,
    date,
    retailPrice,
    itemCode,
    discountAmount,
  } = item;

  if (
    !orderNo ||
    !customerId ||
    !customerName ||
    !itemId ||
    !itemName ||
    !date ||
    !itemCode
  ) {
    console.warn("⚠️ Missing fields in addItem:", item);
    return;
  }

  await db.runAsync(
    `
    INSERT INTO items 
      (orderNo, customerId, customerName, itemId, itemName, quantity, date, retailPrice, itemCode, discountAmount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      orderNo,
      customerId,
      customerName,
      itemId,
      itemName,
      quantity,
      date,
      retailPrice,
      itemCode,
      discountAmount,
    ]
  );
};

// ✅ Get All Items
export const getAllItems = async () => {
  const result = await db.getAllAsync("SELECT * FROM items ORDER BY id DESC");
  return result;
};

// ✅ Delete Item by ID
export const deleteItem = async (id) => {
  await db.runAsync("DELETE FROM items WHERE id = ?", [id]);
};

// ✅ Clear All Items
export const clearItems = async () => {
  await db.runAsync("DELETE FROM items");
};

// ✅ Update Quantity
export const updateQuantity = async (id, quantity) => {
  await db.runAsync("UPDATE items SET quantity = ? WHERE id = ?", [quantity, id]);
};

// ✅ Get Total Cart Value
export const getCartTotal = async () => {
  const result = await db.getAllAsync("SELECT SUM(retailPrice * quantity) AS total FROM items");
  return result?.[0]?.total || 0;
};


//
// ─── CUSTOMERS CRUD ───────────────────────────────────────────
//

// ✅ Add New Customer
export const addCustomer = async (customer) => {
  const { customerId, customerName, phone, email, address } = customer;

  if (!customerId || !customerName) {
    console.warn("⚠️ Missing fields in addCustomer:", customer);
    return;
  }

  await db.runAsync(
    `
    INSERT INTO customers (customerId, customerName, phone, email, address)
    VALUES (?, ?, ?, ?, ?);
    `,
    [customerId, customerName, phone, email, address]
  );
};

// ✅ Get All Customers
export const getAllCustomers = async () => {
  const result = await db.getAllAsync("SELECT * FROM customers ORDER BY id DESC");
  return result;
};

// ✅ Delete Customer
export const deleteCustomer = async (id) => {
  await db.runAsync("DELETE FROM customers WHERE id = ?", [id]);
};

// ✅ Clear All Customers (optional)
export const clearCustomers = async () => {
  await db.runAsync("DELETE FROM customers");
};




// import * as SQLite from "expo-sqlite";

// const db = SQLite.openDatabaseSync("orderItems.db");

// // ✅ Initialize Database
// export const initDB = async () => {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       orderNo TEXT,
//       customerId TEXT,
//       customerName TEXT,
//       itemId TEXT,
//       itemName TEXT,
//       quantity INTEGER,
//       date TEXT,
//       retailPrice REAL,
//       itemCode TEXT,
//       discountAmount REAL
//     );
//   `);
// };

// // ✅ Add New Item
// export const addItem = async (item) => {
//   const {
//     orderNo,
//     customerId,
//     customerName,
//     itemId,
//     itemName,
//     quantity,
//     date,
//     retailPrice,
//     itemCode,
//     discountAmount,
//   } = item;

//   // Make sure all fields are defined to avoid SQL errors
//   if (
//     !orderNo ||
//     !customerId ||
//     !customerName ||
//     !itemId ||
//     !itemName ||
//     !date ||
//     !itemCode
//   ) {
//     console.warn("⚠️ Missing fields in addItem:", item);
//     return;
//   }

//   await db.runAsync(
//     `
//     INSERT INTO items 
//       (orderNo, customerId, customerName, itemId, itemName, quantity, date, retailPrice, itemCode, discountAmount)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//     `,
//     [
//       orderNo,
//       customerId,
//       customerName,
//       itemId,
//       itemName,
//       quantity,
//       date,
//       retailPrice,
//       itemCode,
//       discountAmount,
//     ]
//   );
// };

// // ✅ Get All Items
// export const getAllItems = async () => {
//   const result = await db.getAllAsync("SELECT * FROM items ORDER BY id DESC");
//   return result;
// };

// // ✅ Delete Item by ID
// export const deleteItem = async (id) => {
//   await db.runAsync("DELETE FROM items WHERE id = ?", [id]);
// };

// // ✅ Clear All Items (after placing order)
// export const clearItems = async () => {
//   await db.runAsync("DELETE FROM items");
// };

// // ✅ Update Quantity
// export const updateQuantity = async (id, quantity) => {
//   await db.runAsync("UPDATE items SET quantity = ? WHERE id = ?", [quantity, id]);
// };

// // ✅ Get Total Cart Value
// export const getCartTotal = async () => {
//   const result = await db.getAllAsync("SELECT SUM(retailPrice * quantity) AS total FROM items");
//   return result?.[0]?.total || 0;
// };









// import * as SQLite from "expo-sqlite";

// let db;

// export async function initDB() {
//   db = await SQLite.openDatabaseAsync("appdata.db");

//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT,
//       email TEXT,
//       phone TEXT
//     );
//   `);

//   return db;
// }

// export async function addUser(name, email, phone) {
//   await db.runAsync(
//     "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
//     [name, email, phone]
//   );
// }

// export async function getUsers() {
//   return await db.getAllAsync("SELECT * FROM users");
// }
