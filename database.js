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
      visited TEXT DEFAULT 'Unvisited',
      latitude REAL,
      longitude REAL,
      location_status TEXT DEFAULT 'Not Updated'
    );
  `);

  // Items Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT DEFAULT '',
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

  // Activity Log Table (daily status)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Unvisited',
      FOREIGN KEY (customer_id) REFERENCES customer(entity_id)
    );
  `);

  // Insert dummy customers if empty
  const existingCustomers = await db.getAllAsync(
    "SELECT COUNT(*) as count FROM customer"
  );
  if (existingCustomers?.[0]?.count === 0) {
    await db.runAsync(`
      INSERT INTO customer (name, phone, last_seen, visited, latitude, longitude,location_status) VALUES
  ('Ali Raza', '03001234567', '2025-11-06 10:00', 'Unvisited', 31.4182, 73.0791, 'Not Updated'),
  ('Ayesha Khan', '03019876543', '2025-11-05 18:30','Unvisited', 31.4220, 73.0954, 'Not Updated'),
  ('Hassan Ahmed', '03025557788', '2025-11-06 09:15', 'Unvisited', 31.4068, 73.1015, 'Not Updated'),
  ('Fatima Tariq', '03037778899', '2025-11-04 14:20', 'Unvisited', 31.4325, 73.0899, 'Not Updated'),
  ('Usman Ali', '03041112233', '2025-11-06 08:45', 'Unvisited', 31.4120, 73.0752,'Not Updated'),
  ('Sara Nawaz', '03054445566', '2025-11-03 19:10','Unvisited', 31.4263, 73.0821,'Not Updated'),
  ('Bilal Hussain', '03061114455', '2025-11-06 11:30', 'Unvisited', 31.4155, 73.0972,'Not Updated'),
  ('Zainab Noor', '03075556644', '2025-11-05 16:50', 'Unvisited', 31.4088, 73.0856,'Not Updated'),
  ('Ahmad Khan', '03082223344', '2025-11-06 07:25', 'Unvisited', 31.4204, 73.0913,'Not Updated'),
  ('Mariam Iqbal', '03093334455', '2025-11-04 12:40', 'Unvisited', 31.4176, 73.0888,'Not Updated'),
  ('Noman Siddiqui', '03111222333', '2025-11-06 09:50', 'Unvisited', 31.4290, 73.0944,'Not Updated'),
  ('Hina Javed', '03123334455', '2025-11-05 20:05', 'Unvisited', 31.4105, 73.0802,'Not Updated'),
  ('Kamran Abbas', '03134445566', '2025-11-06 10:15', 'Unvisited', 31.4188, 73.1005,'Not Updated'),
  ('Sadia Imran', '03145556677', '2025-11-03 15:30', 'Unvisited', 31.4277, 73.0866,'Not Updated'),
  ('Adnan Rafiq', '03156667788', '2025-11-06 08:05', 'Unvisited', 31.4142, 73.0924,'Not Updated'),
  ('Iqra Shah', '03167778899', '2025-11-05 17:25', 'Unvisited', 31.4160, 73.0819,'Not Updated'),
  ('Rashid Malik', '03178889900', '2025-11-06 07:55', 'Unvisited', 31.4244, 73.0961,'Not Updated'),
  ('Laiba Aslam', '03189990011', '2025-11-04 11:10', 'Unvisited', 31.4099, 73.0788,'Not Updated'),
  ('Tahir Zafar', '03211223344', '2025-11-06 09:40', 'Unvisited', 31.4231, 73.0842,'Not Updated'),
  ('Nida Farooq', '03223334455', '2025-11-05 18:00', 'Unvisited', 31.4152, 73.0895,'Not Updated')
    `);
  }

 // Insert dummy items if empty
const existingItems = await db.getAllAsync(
  "SELECT COUNT(*) as count FROM items"
);
if (existingItems?.[0]?.count === 0) {
  await db.runAsync(`
    INSERT INTO items (name, price, type, image) VALUES
    -- 🧵 Clothing & Textiles
    ('Cotton Fabric Roll', 1200, 'Clothing', ''),
    ('Polyester Yarn', 850, 'Clothing', ''),
    ('Silk Dupatta', 500, 'Clothing', ''),
    ('Denim Jeans', 2200, 'Clothing', ''),
    ('Formal Shirt', 2100, 'Clothing', ''),
    ('T-Shirt Pack', 1500, 'Clothing', ''),
    ('Winter Jacket', 4500, 'Clothing', ''),

    -- 🛒 Groceries
    ('Basmati Rice 5kg', 1700, 'Grocery', ''),
    ('Cooking Oil 1L', 620, 'Grocery', ''),
    ('Sugar 1kg', 180, 'Grocery', ''),
    ('Wheat Flour 10kg', 1650, 'Grocery', ''),
    ('Tea Pack 250g', 450, 'Grocery', ''),
    ('Milk Carton 1L', 270, 'Grocery', ''),
    ('Eggs (Dozen)', 320, 'Grocery', ''),

    -- 🧴 Household & Cleaning
    ('Washing Powder 1kg', 480, 'Household', ''),
    ('Dishwashing Liquid 500ml', 350, 'Household', ''),
    ('Bath Soap 3-Pack', 250, 'Household', ''),
    ('Shampoo 400ml', 600, 'Household', ''),
    ('Toothpaste 150g', 200, 'Household', ''),

    -- 💻 Electronics
    ('LED Bulb 12W', 350, 'Electronics', ''),
    ('Power Bank 10000mAh', 2800, 'Electronics', ''),
    ('Bluetooth Earbuds', 4200, 'Electronics', ''),
    ('USB Cable Type-C', 350, 'Electronics', ''),
    ('Mobile Charger', 950, 'Electronics', ''),

    -- 🏠 Home & Kitchen
    ('Plastic Chair', 1200, 'Home & Kitchen', ''),
    ('Stainless Steel Pan', 2100, 'Home & Kitchen', ''),
    ('Curtain Set', 2500, 'Home & Kitchen', ''),
    ('Wall Clock', 1450, 'Home & Kitchen', ''),
    ('Floor Mat', 850, 'Home & Kitchen', '')
  `);
}


   // Initialize daily activity log
  await initDailyActivityLog();
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
  const status = visited ? "Yes" : "No";
  await db.runAsync(
    "UPDATE customer SET visited = ? WHERE entity_id = ?",
    [status, id]
  );
};

export const addCustomer = async (name, phone, last_seen, visited = "Unvisited") => {
  await db.runAsync(
    "INSERT INTO customer (name, phone, last_seen, visited) VALUES (?, ?, ?, ?)",
    [name, phone, last_seen, visited]
  );
};


// ---------------------- DAILY ACTIVITY LOG FUNCTIONS ----------------------

// Initialize activity log for all customers today
export const initDailyActivityLog = async () => {
  const today = new Date().toISOString().split("T")[0];
  const customers = await getAllCustomers();

  for (let customer of customers) {
    const exists = await db.getAllAsync(
      "SELECT * FROM activity_log WHERE customer_id = ? AND date = ?",
      [customer.entity_id, today]
    );
    if (exists.length === 0) {
      await db.runAsync(
        "INSERT INTO activity_log (customer_id, customer_name, date) VALUES (?, ?, ?)",
        [customer.entity_id, customer.name, today]
      );
    }
  }
};

// Mark customer as visited (updates both customer table and activity log)
export const markCustomerVisited = async (customer_id) => {
  const today = new Date().toISOString().split("T")[0];
  await db.runAsync(
    "UPDATE customer SET visited = 'Visited' WHERE entity_id = ?",
    [customer_id]
  );
  await db.runAsync(
    "UPDATE activity_log SET status = 'Visited' WHERE customer_id = ? AND date = ?",
    [customer_id, today]
  );
};

// Optional: reset all customers to 'Unvisited' at the start of a new day
export const resetDailyCustomerStatus = async () => {
  await db.runAsync("UPDATE customer SET visited = 'Unvisited'");
  await initDailyActivityLog();
};

// Get activity log for today
export const getTodayActivityLog = async () => {
  const today = new Date().toISOString().split("T")[0];
  return await db.getAllAsync(
    "SELECT * FROM activity_log WHERE date = ? ORDER BY customer_id ASC",
    [today]
  );
};


// Update last_seen for a customer
export const updateCustomerLastSeen = async (customer_id, last_seen) => {
  await db.runAsync(
    "UPDATE customer SET last_seen = ? WHERE entity_id = ?",
    [last_seen, customer_id]
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

// Helper to get current local datetime
const getCurrentDateTime = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

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

   const bookingId = result.lastInsertRowId;

  // ✅ Get current local datetime
  const now = getCurrentDateTime();
  const today = now.split(" ")[0]; // extract YYYY-MM-DD for activity_log

  // Automatically mark customer as visited and update last_seen
  await db.runAsync(
    "UPDATE customer SET visited = 'Visited', last_seen = ? WHERE entity_id = ?",
    [now, order.customer_id]
  );

  // Update daily activity log
  await db.runAsync(
    "UPDATE activity_log SET status = 'Visited' WHERE customer_id = ? AND date = ?",
    [order.customer_id, today]
  );

  return bookingId;
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



// ---------------------- CUSTOMER LOCATION UPDATE ----------------------

// Update latitude and longitude for a customer
export const updateCustomerLocation = async (customer_id, latitude, longitude) => {
  try {
    await db.runAsync(
      `UPDATE customer 
       SET latitude = ?, longitude = ? 
       WHERE entity_id = ?`,
      [latitude, longitude, customer_id]
    );
    console.log(`Customer ${customer_id} location updated.`);
  } catch (error) {
    console.error("Error updating customer location:", error);
  }
};

// Update location, last_seen, and location_status
export const updateCustomerLocationWithLastSeen = async (customer_id, latitude, longitude, status) => {
  const last_seen = new Date().toISOString();
  try {
    await db.runAsync(
      `UPDATE customer 
       SET latitude = ?, longitude = ?, last_seen = ?, location_status = ? 
       WHERE entity_id = ?`,
      [latitude, longitude, last_seen, status, customer_id]
    );
    console.log(`Customer ${customer_id} location, last_seen, and status updated.`);
  } catch (error) {
    console.error("Error updating customer location, last_seen, and status:", error);
  }
};







// import * as SQLite from "expo-sqlite";

// // Use openDatabaseSync for modern Expo SDK (persistent DB)
// const db = SQLite.openDatabaseSync("customer0DB.db");

// // ---------------------- INITIALIZATION ----------------------
// export const initDB = async () => {
//   // Customer Table
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS customer (
//       entity_id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT,
//       last_seen TEXT,
//       visited BOOLEAN DEFAULT 0,
//       latitude REAL,
//       longitude REAL
//     );
//   `);

//   // Items Table
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       price REAL NOT NULL,
//       image TEXT DEFAULT ''
//     );
//   `);

//   // Order Booking
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS order_booking (
//       booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
//       order_date TEXT NOT NULL,
//       customer_id INTEGER NOT NULL,
//       order_no TEXT NOT NULL,
//       created_by_id INTEGER,
//       created_date TEXT,
//       FOREIGN KEY (customer_id) REFERENCES customer(entity_id)
//     );
//   `);

//   // Order Booking Line (Details Table)
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS order_booking_line (
//       line_id INTEGER PRIMARY KEY AUTOINCREMENT,
//       booking_id INTEGER NOT NULL,
//       item_id INTEGER NOT NULL,
//       order_qty INTEGER NOT NULL,
//       unit_price REAL NOT NULL,
//       amount REAL NOT NULL,
//       FOREIGN KEY (booking_id) REFERENCES order_booking(booking_id),
//       FOREIGN KEY (item_id) REFERENCES items(id)
//     );
//   `);

//   // Insert dummy customers if empty
//   const existingCustomers = await db.getAllAsync(
//     "SELECT COUNT(*) as count FROM customer"
//   );
//   if (existingCustomers?.[0]?.count === 0) {
//     await db.runAsync(`
//       INSERT INTO customer (name, phone, last_seen, visited, latitude, longitude) VALUES
//   ('Ali Raza', '03001234567', '2025-11-06 10:00', 1, 31.4182, 73.0791),
//   ('Ayesha Khan', '03019876543', '2025-11-05 18:30', 0, 31.4220, 73.0954),
//   ('Hassan Ahmed', '03025557788', '2025-11-06 09:15', 1, 31.4068, 73.1015),
//   ('Fatima Tariq', '03037778899', '2025-11-04 14:20', 0, 31.4325, 73.0899),
//   ('Usman Ali', '03041112233', '2025-11-06 08:45', 1, 31.4120, 73.0752),
//   ('Sara Nawaz', '03054445566', '2025-11-03 19:10', 0, 31.4263, 73.0821),
//   ('Bilal Hussain', '03061114455', '2025-11-06 11:30', 1, 31.4155, 73.0972),
//   ('Zainab Noor', '03075556644', '2025-11-05 16:50', 0, 31.4088, 73.0856),
//   ('Ahmad Khan', '03082223344', '2025-11-06 07:25', 1, 31.4204, 73.0913),
//   ('Mariam Iqbal', '03093334455', '2025-11-04 12:40', 0, 31.4176, 73.0888),
//   ('Noman Siddiqui', '03111222333', '2025-11-06 09:50', 1, 31.4290, 73.0944),
//   ('Hina Javed', '03123334455', '2025-11-05 20:05', 0, 31.4105, 73.0802),
//   ('Kamran Abbas', '03134445566', '2025-11-06 10:15', 1, 31.4188, 73.1005),
//   ('Sadia Imran', '03145556677', '2025-11-03 15:30', 0, 31.4277, 73.0866),
//   ('Adnan Rafiq', '03156667788', '2025-11-06 08:05', 1, 31.4142, 73.0924),
//   ('Iqra Shah', '03167778899', '2025-11-05 17:25', 0, 31.4160, 73.0819),
//   ('Rashid Malik', '03178889900', '2025-11-06 07:55', 1, 31.4244, 73.0961),
//   ('Laiba Aslam', '03189990011', '2025-11-04 11:10', 0, 31.4099, 73.0788),
//   ('Tahir Zafar', '03211223344', '2025-11-06 09:40', 1, 31.4231, 73.0842),
//   ('Nida Farooq', '03223334455', '2025-11-05 18:00', 0, 31.4152, 73.0895)
//     `);
//   }

//   // Insert dummy items if empty
//   const existingItems = await db.getAllAsync(
//     "SELECT COUNT(*) as count FROM items"
//   );
//   if (existingItems?.[0]?.count === 0) {
//    await db.runAsync(`
//   INSERT INTO items (name, price, image) VALUES
//   -- 🧵 Clothing & Textiles
//   ('Cotton Fabric Roll', 1200, ''),
//   ('Polyester Yarn', 850, ''),
//   ('Silk Dupatta', 500, ''),
//   ('Denim Jeans', 2200, ''),
//   ('Formal Shirt', 2100, ''),
//   ('T-Shirt Pack', 1500, ''),
//   ('Winter Jacket', 4500, ''),

//   -- 🛒 Groceries
//   ('Basmati Rice 5kg', 1700, ''),
//   ('Cooking Oil 1L', 620, ''),
//   ('Sugar 1kg', 180, ''),
//   ('Wheat Flour 10kg', 1650, ''),
//   ('Tea Pack 250g', 450, ''),
//   ('Milk Carton 1L', 270, ''),
//   ('Eggs (Dozen)', 320, ''),

//   -- 🧴 Household & Cleaning
//   ('Washing Powder 1kg', 480, ''),
//   ('Dishwashing Liquid 500ml', 350, ''),
//   ('Bath Soap 3-Pack', 250, ''),
//   ('Shampoo 400ml', 600, ''),
//   ('Toothpaste 150g', 200, ''),

//   -- 💻 Electronics
//   ('LED Bulb 12W', 350, ''),
//   ('Power Bank 10000mAh', 2800, ''),
//   ('Bluetooth Earbuds', 4200, ''),
//   ('USB Cable Type-C', 350, ''),
//   ('Mobile Charger', 950, ''),

//   -- 🏠 Home & Kitchen
//   ('Plastic Chair', 1200, ''),
//   ('Stainless Steel Pan', 2100, ''),
//   ('Curtain Set', 2500, ''),
//   ('Wall Clock', 1450, ''),
//   ('Floor Mat', 850, '')
// `);

//   }
// };

// // ---------------------- CUSTOMER FUNCTIONS ----------------------
// export const getAllCustomers = async () => {
//   return await db.getAllAsync("SELECT * FROM customer ORDER BY entity_id DESC");
// };

// export const searchCustomers = async (query) => {
//   return await db.getAllAsync(
//     "SELECT * FROM customer WHERE name LIKE ? ORDER BY entity_id DESC",
//     [`%${query}%`]
//   );
// };

// export const updateVisited = async (id, visited) => {
//   await db.runAsync("UPDATE customer SET visited = ? WHERE entity_id = ?", [
//     visited,
//     id,
//   ]);
// };

// export const addCustomer = async (name, phone, last_seen, visited = 0) => {
//   await db.runAsync(
//     "INSERT INTO customer (name, phone, last_seen, visited) VALUES (?, ?, ?, ?)",
//     [name, phone, last_seen, visited]
//   );
// };

// // ---------------------- ITEM FUNCTIONS ----------------------
// export const getItems = async (query = "") => {
//   return await db.getAllAsync(
//     "SELECT * FROM items WHERE name LIKE ? ORDER BY id DESC",
//     [`%${query}%`]
//   );
// };

// export const addItem = async (name, price, image = "") => {
//   await db.runAsync("INSERT INTO items (name, price, image) VALUES (?, ?, ?)", [
//     name,
//     price,
//     image,
//   ]);
// };

// // ---------------------- ORDER BOOKING FUNCTIONS ----------------------

// // Add main order (returns booking_id)
// export const addOrderBooking = async (order) => {
//   const result = await db.runAsync(
//     `INSERT INTO order_booking (order_date, customer_id, order_no, created_by_id, created_date)
//      VALUES (?, ?, ?, ?, ?)`,
//     [
//       order.order_date,
//       order.customer_id,
//       order.order_no,
//       order.created_by_id,
//       order.created_date,
//     ]
//   );
//   return result.lastInsertRowId;
// };

// // Add order booking line — fixed to ensure data is committed
// export const addOrderBookingLine = async (line) => {
//   await db.execAsync("BEGIN TRANSACTION;");
//   try {
//     await db.runAsync(
//       `INSERT INTO order_booking_line (booking_id, item_id, order_qty, unit_price, amount)
//        VALUES (?, ?, ?, ?, ?)`,
//       [
//         line.booking_id,
//         line.item_id,
//         line.order_qty,
//         line.unit_price,
//         line.amount,
//       ]
//     );
//     await db.execAsync("COMMIT;");
//   } catch (error) {
//     console.error("Error inserting order line:", error);
//     await db.execAsync("ROLLBACK;");
//     throw error;
//   }
// };

// // Fetch all orders summary
// export const getAllOrders = async () => {
//   return await db.getAllAsync(`
//     SELECT 
//       ob.booking_id, 
//       ob.order_no, 
//       ob.order_date, 
//       c.name AS customer_name,
//       COUNT(obl.line_id) AS item_count,
//       SUM(obl.amount) AS total_amount
//     FROM order_booking ob
//     LEFT JOIN customer c ON ob.customer_id = c.entity_id
//     LEFT JOIN order_booking_line obl ON ob.booking_id = obl.booking_id
//     GROUP BY ob.booking_id
//     ORDER BY ob.booking_id DESC;
//   `);
// };

// // Fetch single order details
// export const getOrderDetails = async (bookingId) => {
//   return await db.getAllAsync(
//     `
//     SELECT 
//       obl.line_id, 
//       i.name AS item_name, 
//       obl.order_qty, 
//       obl.unit_price, 
//       obl.amount
//     FROM order_booking_line obl
//     JOIN items i ON obl.item_id = i.id
//     WHERE obl.booking_id = ?
//     `,
//     [bookingId]
//   );
// };

// // ---------------------- ORDER BOOKING LINE HELPERS ----------------------

// // Get existing order line by booking and item
// export const getOrderLineByBookingAndItem = async (bookingId, itemId) => {
//   return await db.getAllAsync(
//     `SELECT * FROM order_booking_line WHERE booking_id = ? AND item_id = ?`,
//     [bookingId, itemId]
//   );
// };

// // Update an existing order line
// export const updateOrderBookingLine = async (lineId, data) => {
//   await db.runAsync(
//     `UPDATE order_booking_line 
//      SET order_qty = ?, amount = ?
//      WHERE line_id = ?`,
//     [data.order_qty, data.amount, lineId]
//   );
// };

// // ---------------------- DELETE ORDER LINE ----------------------
// export const deleteOrderBookingLine = async (booking_line_id) => {
//   await db.runAsync("DELETE FROM order_booking_line WHERE line_id = ?", [
//     booking_line_id,
//   ]);
// };

// // Update order booking line
// export const updateOrderBookingLineDetails = async ({
//   booking_line_id,
//   order_qty,
//   amount,
// }) => {
//   try {
//     await db.runAsync(
//       `UPDATE order_booking_line 
//        SET order_qty = ?, amount = ? 
//        WHERE line_id = ?`,
//       [order_qty, amount, booking_line_id]
//     );
//   } catch (error) {
//     console.error("Failed to update order line:", error);
//     throw error;
//   }
// };

// // ---------------------- RECENT ACTIVITY ----------------------

// export const initRecentActivityTable = async () => {
//   try {
//     await db.execAsync(`
//       CREATE TABLE IF NOT EXISTS recent_activity (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         booking_id INTEGER,
//         customer_name TEXT,
//         item_count INTEGER,
//         total_amount REAL,
//         activity_date TEXT
//       )
//     `);
//     console.log("Recent activity table initialized.");
//   } catch (error) {
//     console.error("Error creating recent_activity table:", error);
//   }
// };

// export const addRecentActivity = async ({
//   booking_id,
//   customer_name,
//   item_count,
//   total_amount,
// }) => {
//   const date = new Date().toISOString();
//   await db.runAsync(
//     `INSERT INTO recent_activity (booking_id, customer_name, item_count, total_amount, activity_date)
//      VALUES (?, ?, ?, ?, ?)`,
//     [booking_id, customer_name, item_count, total_amount, date]
//   );
// };


// // Get all recent activities (latest first)
// export const getRecentActivities = async () => {
//   return await db.getAllAsync(`
//     SELECT * FROM recent_activity
//     ORDER BY id ASC
//   `);
// };



// // ---------------------- CUSTOMER LOCATION UPDATE ----------------------

// // Update latitude and longitude for a customer
// export const updateCustomerLocation = async (customer_id, latitude, longitude) => {
//   try {
//     await db.runAsync(
//       `UPDATE customer 
//        SET latitude = ?, longitude = ? 
//        WHERE entity_id = ?`,
//       [latitude, longitude, customer_id]
//     );
//     console.log(`Customer ${customer_id} location updated.`);
//   } catch (error) {
//     console.error("Error updating customer location:", error);
//   }
// };

// // Optional: Update last_seen along with location
// export const updateCustomerLocationWithLastSeen = async (customer_id, latitude, longitude) => {
//   const last_seen = new Date().toISOString();
//   try {
//     await db.runAsync(
//       `UPDATE customer 
//        SET latitude = ?, longitude = ?, last_seen = ? 
//        WHERE entity_id = ?`,
//       [latitude, longitude, last_seen, customer_id]
//     );
//     console.log(`Customer ${customer_id} location and last_seen updated.`);
//   } catch (error) {
//     console.error("Error updating customer location and last_seen:", error);
//   }
// };
