import * as SQLite from "expo-sqlite";

// Use openDatabaseSync for modern Expo SDK (persistent DB)
const db = SQLite.openDatabaseSync("customer0DB.db");

// ---------------------- INITIALIZATION ----------------------
export const initDB = async () => {
  // Customer Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS customer (
      entity_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      last_seen TEXT,
      visited BOOLEAN DEFAULT 0
    );
  `);

  // Items Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT DEFAULT ''
    );
  `);

  // Order Booking
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS order_booking (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_date TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      order_no TEXT NOT NULL,
      created_by_id INTEGER,
      created_date TEXT,
      FOREIGN KEY (customer_id) REFERENCES customer(entity_id)
    );
  `);

  // Order Booking Line (Details Table)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS order_booking_line (
      line_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      order_qty INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES order_booking(booking_id),
      FOREIGN KEY (item_id) REFERENCES items(id)
    );
  `);

  // Insert dummy customers if empty
  const existingCustomers = await db.getAllAsync(
    "SELECT COUNT(*) as count FROM customer"
  );
  if (existingCustomers?.[0]?.count === 0) {
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

  // Insert dummy items if empty
  const existingItems = await db.getAllAsync(
    "SELECT COUNT(*) as count FROM items"
  );
  if (existingItems?.[0]?.count === 0) {
   await db.runAsync(`
  INSERT INTO items (name, price, image) VALUES
  -- 🧵 Clothing & Textiles
  ('Cotton Fabric Roll', 1200, ''),
  ('Polyester Yarn', 850, ''),
  ('Silk Dupatta', 500, ''),
  ('Denim Jeans', 2200, ''),
  ('Formal Shirt', 2100, ''),
  ('T-Shirt Pack', 1500, ''),
  ('Winter Jacket', 4500, ''),

  -- 🛒 Groceries
  ('Basmati Rice 5kg', 1700, ''),
  ('Cooking Oil 1L', 620, ''),
  ('Sugar 1kg', 180, ''),
  ('Wheat Flour 10kg', 1650, ''),
  ('Tea Pack 250g', 450, ''),
  ('Milk Carton 1L', 270, ''),
  ('Eggs (Dozen)', 320, ''),

  -- 🧴 Household & Cleaning
  ('Washing Powder 1kg', 480, ''),
  ('Dishwashing Liquid 500ml', 350, ''),
  ('Bath Soap 3-Pack', 250, ''),
  ('Shampoo 400ml', 600, ''),
  ('Toothpaste 150g', 200, ''),

  -- 💻 Electronics
  ('LED Bulb 12W', 350, ''),
  ('Power Bank 10000mAh', 2800, ''),
  ('Bluetooth Earbuds', 4200, ''),
  ('USB Cable Type-C', 350, ''),
  ('Mobile Charger', 950, ''),

  -- 🏠 Home & Kitchen
  ('Plastic Chair', 1200, ''),
  ('Stainless Steel Pan', 2100, ''),
  ('Curtain Set', 2500, ''),
  ('Wall Clock', 1450, ''),
  ('Floor Mat', 850, '')
`);

  }
};

// ---------------------- CUSTOMER FUNCTIONS ----------------------
export const getAllCustomers = async () => {
  return await db.getAllAsync("SELECT * FROM customer ORDER BY entity_id DESC");
};

export const searchCustomers = async (query) => {
  return await db.getAllAsync(
    "SELECT * FROM customer WHERE name LIKE ? ORDER BY entity_id DESC",
    [`%${query}%`]
  );
};

export const updateVisited = async (id, visited) => {
  await db.runAsync("UPDATE customer SET visited = ? WHERE entity_id = ?", [
    visited,
    id,
  ]);
};

export const addCustomer = async (name, phone, last_seen, visited = 0) => {
  await db.runAsync(
    "INSERT INTO customer (name, phone, last_seen, visited) VALUES (?, ?, ?, ?)",
    [name, phone, last_seen, visited]
  );
};

// ---------------------- ITEM FUNCTIONS ----------------------
export const getItems = async (query = "") => {
  return await db.getAllAsync(
    "SELECT * FROM items WHERE name LIKE ? ORDER BY id DESC",
    [`%${query}%`]
  );
};

export const addItem = async (name, price, image = "") => {
  await db.runAsync("INSERT INTO items (name, price, image) VALUES (?, ?, ?)", [
    name,
    price,
    image,
  ]);
};

// ---------------------- ORDER BOOKING FUNCTIONS ----------------------

// Add main order (returns booking_id)
export const addOrderBooking = async (order) => {
  const result = await db.runAsync(
    `INSERT INTO order_booking (order_date, customer_id, order_no, created_by_id, created_date)
     VALUES (?, ?, ?, ?, ?)`,
    [
      order.order_date,
      order.customer_id,
      order.order_no,
      order.created_by_id,
      order.created_date,
    ]
  );
  return result.lastInsertRowId;
};

// Add order booking line — fixed to ensure data is committed
export const addOrderBookingLine = async (line) => {
  await db.execAsync("BEGIN TRANSACTION;");
  try {
    await db.runAsync(
      `INSERT INTO order_booking_line (booking_id, item_id, order_qty, unit_price, amount)
       VALUES (?, ?, ?, ?, ?)`,
      [
        line.booking_id,
        line.item_id,
        line.order_qty,
        line.unit_price,
        line.amount,
      ]
    );
    await db.execAsync("COMMIT;");
  } catch (error) {
    console.error("Error inserting order line:", error);
    await db.execAsync("ROLLBACK;");
    throw error;
  }
};

// Fetch all orders summary
export const getAllOrders = async () => {
  return await db.getAllAsync(`
    SELECT 
      ob.booking_id, 
      ob.order_no, 
      ob.order_date, 
      c.name AS customer_name,
      COUNT(obl.line_id) AS item_count,
      SUM(obl.amount) AS total_amount
    FROM order_booking ob
    LEFT JOIN customer c ON ob.customer_id = c.entity_id
    LEFT JOIN order_booking_line obl ON ob.booking_id = obl.booking_id
    GROUP BY ob.booking_id
    ORDER BY ob.booking_id DESC;
  `);
};

// Fetch single order details
export const getOrderDetails = async (bookingId) => {
  return await db.getAllAsync(
    `
    SELECT 
      obl.line_id, 
      i.name AS item_name, 
      obl.order_qty, 
      obl.unit_price, 
      obl.amount
    FROM order_booking_line obl
    JOIN items i ON obl.item_id = i.id
    WHERE obl.booking_id = ?
    `,
    [bookingId]
  );
};

// ---------------------- ORDER BOOKING LINE HELPERS ----------------------

// Get existing order line by booking and item
export const getOrderLineByBookingAndItem = async (bookingId, itemId) => {
  return await db.getAllAsync(
    `SELECT * FROM order_booking_line WHERE booking_id = ? AND item_id = ?`,
    [bookingId, itemId]
  );
};

// Update an existing order line
export const updateOrderBookingLine = async (lineId, data) => {
  await db.runAsync(
    `UPDATE order_booking_line 
     SET order_qty = ?, amount = ?
     WHERE line_id = ?`,
    [data.order_qty, data.amount, lineId]
  );
};

// ---------------------- DELETE ORDER LINE ----------------------
export const deleteOrderBookingLine = async (booking_line_id) => {
  await db.runAsync("DELETE FROM order_booking_line WHERE line_id = ?", [
    booking_line_id,
  ]);
};

// Update order booking line
export const updateOrderBookingLineDetails = async ({
  booking_line_id,
  order_qty,
  amount,
}) => {
  try {
    await db.runAsync(
      `UPDATE order_booking_line 
       SET order_qty = ?, amount = ? 
       WHERE line_id = ?`,
      [order_qty, amount, booking_line_id]
    );
  } catch (error) {
    console.error("Failed to update order line:", error);
    throw error;
  }
};

// ---------------------- RECENT ACTIVITY ----------------------

export const initRecentActivityTable = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recent_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER,
        customer_name TEXT,
        item_count INTEGER,
        total_amount REAL,
        activity_date TEXT
      )
    `);
    console.log("Recent activity table initialized.");
  } catch (error) {
    console.error("Error creating recent_activity table:", error);
  }
};

export const addRecentActivity = async ({
  booking_id,
  customer_name,
  item_count,
  total_amount,
}) => {
  const date = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO recent_activity (booking_id, customer_name, item_count, total_amount, activity_date)
     VALUES (?, ?, ?, ?, ?)`,
    [booking_id, customer_name, item_count, total_amount, date]
  );
};

// Get all recent activities (latest first)
export const getRecentActivities = async () => {
  return await db.getAllAsync(`
    SELECT * FROM recent_activity
    ORDER BY id ASC
  `);
};

// import * as SQLite from "expo-sqlite";

// // Open database
// const db = SQLite.openDatabaseSync("customer0DB.db");

// // ✅ Initialize Database
// export const initDB = async () => {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS customer (
//       entity_id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT,
//       last_seen TEXT,
//       visited BOOLEAN DEFAULT 0
//     );
//   `);

//   // Insert dummy data if table is empty
//   const existing = await db.getAllAsync("SELECT COUNT(*) as count FROM customer");
//   if (existing?.[0]?.count === 0) {
//    await db.runAsync(`
//   INSERT INTO customer (name, phone, last_seen, visited) VALUES
//   ('John Doe', '123456789', '2025-11-06 10:00', 1),
//   ('Jane Smith', '987654321', '2025-11-05 18:30', 0),
//   ('Alice Johnson', '555666777', '2025-11-06 09:15', 1),
//   ('Bob Williams', '111222333', '2025-11-04 14:20', 0),
//   ('Carol Brown', '444555666', '2025-11-06 08:45', 1),
//   ('David Miller', '777888999', '2025-11-03 19:10', 0),
//   ('Eva Davis', '222333444', '2025-11-06 11:30', 1),
//   ('Frank Wilson', '333444555', '2025-11-05 16:50', 0),
//   ('Grace Lee', '666777888', '2025-11-06 07:25', 1),
//   ('Henry Taylor', '999000111', '2025-11-04 12:40', 0),
//   ('Ivy Anderson', '555444333', '2025-11-06 09:50', 1),
//   ('Jack Thomas', '111333555', '2025-11-05 20:05', 0),
//   ('Karen Martin', '444666888', '2025-11-06 10:15', 1),
//   ('Leo Harris', '777999111', '2025-11-03 15:30', 0),
//   ('Mia Clark', '222555777', '2025-11-06 08:05', 1),
//   ('Noah Lewis', '333666999', '2025-11-05 17:25', 0),
//   ('Olivia Robinson', '666111444', '2025-11-06 07:55', 1),
//   ('Peter Walker', '999222555', '2025-11-04 11:10', 0),
//   ('Quinn Hall', '555777222', '2025-11-06 09:40', 1),
//   ('Rachel Young', '111444777', '2025-11-05 18:00', 0)
// `);

//   }
// };

// // ✅ Get All Customers
// export const getAllCustomers = async () => {
//   const result = await db.getAllAsync("SELECT * FROM customer ORDER BY entity_id DESC");
//   return result;
// };

// // ✅ Search Customers by Name
// export const searchCustomers = async (query) => {
//   const result = await db.getAllAsync(
//     "SELECT * FROM customer WHERE name LIKE ? ORDER BY entity_id DESC",
//     [`%${query}%`]
//   );
//   return result;
// };

// // ✅ Update Visited Status
// export const updateVisited = async (id, visited) => {
//   await db.runAsync("UPDATE customer SET visited = ? WHERE entity_id = ?", [visited, id]);
// };

// // Add new customer
// export const addCustomer = async (name, phone, last_seen, visited = 0) => {
//   await db.runAsync(
//     "INSERT INTO customer (name, phone, last_seen, visited) VALUES (?, ?, ?, ?)",
//     [name, phone, last_seen, visited]
//   );
// };
