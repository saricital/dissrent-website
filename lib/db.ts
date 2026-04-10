import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { enumerateDateStrings } from "./booking";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "rentacar.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    car_name TEXT,
    car_img TEXT,
    pickup_date TEXT,
    return_date TEXT,
    days INTEGER,
    pickup_location TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    contact_preference TEXT NOT NULL,
    total_price INTEGER,
    status TEXT DEFAULT 'pending',
    confirm_token TEXT UNIQUE,
    cancel_token TEXT UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS car_blocked_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_img TEXT NOT NULL,
    date TEXT NOT NULL,
    UNIQUE(car_img, date)
  );

  CREATE INDEX IF NOT EXISTS idx_blocked_dates_car_date
  ON car_blocked_dates(car_img, date);
`);

// Migrate existing DB: add cancel_token column if it doesn't exist yet
try {
  db.exec("ALTER TABLE bookings ADD COLUMN cancel_token TEXT");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_cancel_token ON bookings(cancel_token)");
} catch {
  // Column already exists — safe to ignore
}

export interface Booking {
  id: string;
  car_name: string | null;
  car_img: string | null;
  pickup_date: string | null;
  return_date: string | null;
  days: number | null;
  pickup_location: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  contact_preference: string;
  total_price: number | null;
  status: string;
  confirm_token: string | null;
  cancel_token: string | null;
  created_at: string;
}

export interface BlockedDate {
  car_img: string;
  date: string;
}

const dbHelpers = {
  createBooking(booking: Omit<Booking, "status">) {
    db.prepare(`
      INSERT INTO bookings (id, car_name, car_img, pickup_date, return_date, days, pickup_location, customer_name, customer_phone, customer_email, contact_preference, total_price, status, confirm_token, cancel_token, created_at)
      VALUES (@id, @car_name, @car_img, @pickup_date, @return_date, @days, @pickup_location, @customer_name, @customer_phone, @customer_email, @contact_preference, @total_price, 'pending', @confirm_token, @cancel_token, @created_at)
    `).run(booking);
  },

  getBookingByToken(token: string): Booking | undefined {
    return db.prepare("SELECT * FROM bookings WHERE confirm_token = ?").get(token) as Booking | undefined;
  },

  getBookingByCancelToken(token: string): Booking | undefined {
    return db.prepare("SELECT * FROM bookings WHERE cancel_token = ?").get(token) as Booking | undefined;
  },

  confirmBookingIfAvailable(id: string): { success: boolean; reason?: "not_found" | "not_pending" | "conflict" } {
    const insert = db.prepare("INSERT OR IGNORE INTO car_blocked_dates (car_img, date) VALUES (?, ?)");
    const run = db.transaction((bookingId: string) => {
      const booking = db
        .prepare("SELECT * FROM bookings WHERE id = ?")
        .get(bookingId) as Booking | undefined;

      if (!booking) {
        return { success: false as const, reason: "not_found" as const };
      }

      if (booking.status !== "pending") {
        return { success: false as const, reason: "not_pending" as const };
      }

      if (
        booking.car_img &&
        booking.pickup_date &&
        booking.return_date &&
        dbHelpers.hasBlockingConflict(booking.car_img, booking.pickup_date, booking.return_date)
      ) {
        return { success: false as const, reason: "conflict" as const };
      }

      db.prepare("UPDATE bookings SET status = 'confirmed', confirm_token = NULL WHERE id = ?").run(bookingId);
      if (booking.car_img && booking.pickup_date && booking.return_date) {
        for (const date of enumerateDateStrings(booking.pickup_date, booking.return_date)) {
          insert.run(booking.car_img, date);
        }
      }

      return { success: true as const };
    });

    return run(id);
  },

  getAllBookings(): Booking[] {
    return db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all() as Booking[];
  },

  getBlockedCarsForRange(start: string, end: string): string[] {
    const rows = db.prepare(`
      SELECT DISTINCT car_img FROM car_blocked_dates
      WHERE date >= ? AND date <= ?
    `).all(start, end) as { car_img: string }[];
    return rows.map((r) => r.car_img);
  },

  getBlockedDates(start: string, end: string): BlockedDate[] {
    return db.prepare(`
      SELECT car_img, date FROM car_blocked_dates
      WHERE date >= ? AND date <= ?
      ORDER BY date
    `).all(start, end) as BlockedDate[];
  },

  getBookingById(id: string): Booking | undefined {
    return db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as Booking | undefined;
  },

  hasBlockingConflict(carImg: string, pickupDate: string, returnDate: string): boolean {
    const row = db
      .prepare(
        `
          SELECT 1
          FROM car_blocked_dates
          WHERE car_img = ?
            AND date >= ?
            AND date <= ?
          LIMIT 1
        `
      )
      .get(carImg, pickupDate, returnDate);

    return Boolean(row);
  },

  blockDatesForBooking(carImg: string | null, pickupDate: string | null, returnDate: string | null): void {
    if (!carImg || !pickupDate || !returnDate) return;
    const insert = db.prepare("INSERT OR IGNORE INTO car_blocked_dates (car_img, date) VALUES (?, ?)");
    const run = db.transaction(() => {
      for (const date of enumerateDateStrings(pickupDate, returnDate)) {
        insert.run(carImg, date);
      }
    });
    run();
  },

  cancelBooking(id: string): void {
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as Booking | undefined;
    if (!booking) return;
    const run = db.transaction(() => {
      db.prepare("UPDATE bookings SET status = 'cancelled', confirm_token = NULL, cancel_token = NULL WHERE id = ?").run(id);
      if (booking.car_img && booking.pickup_date && booking.return_date) {
        db.prepare(
          "DELETE FROM car_blocked_dates WHERE car_img = ? AND date >= ? AND date <= ?"
        ).run(booking.car_img, booking.pickup_date, booking.return_date);
      }
    });
    run();
  },

  getBlockedDatesForCar(carImg: string): string[] {
    const rows = db.prepare(
      "SELECT date FROM car_blocked_dates WHERE car_img = ? ORDER BY date"
    ).all(carImg) as { date: string }[];
    return rows.map((r) => r.date);
  },

  isDateReservedByConfirmedBooking(carImg: string, date: string): boolean {
    const row = db
      .prepare(
        `
          SELECT 1
          FROM bookings
          WHERE status = 'confirmed'
            AND car_img = ?
            AND pickup_date <= ?
            AND return_date >= ?
          LIMIT 1
        `
      )
      .get(carImg, date, date);

    return Boolean(row);
  },

  toggleBlockedDate(carImg: string, date: string): "blocked" | "unblocked" | "reserved" {
    if (dbHelpers.isDateReservedByConfirmedBooking(carImg, date)) {
      return "reserved";
    }

    const existing = db.prepare(
      "SELECT id FROM car_blocked_dates WHERE car_img = ? AND date = ?"
    ).get(carImg, date);
    if (existing) {
      db.prepare("DELETE FROM car_blocked_dates WHERE car_img = ? AND date = ?").run(carImg, date);
      return "unblocked";
    } else {
      db.prepare("INSERT INTO car_blocked_dates (car_img, date) VALUES (?, ?)").run(carImg, date);
      return "blocked";
    }
  },
};

export default dbHelpers;
