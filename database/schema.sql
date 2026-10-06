-- ClipperCartel — database schema
--
-- All tables are InnoDB + utf8mb4. CREATE … IF NOT EXISTS so the
-- migration runner is idempotent. Phone numbers are stored in E.164
-- format (e.g. +2349165063185) because that's what the WhatsApp
-- Cloud API expects.
--
-- Shape mirrors PROJECT_PLAN.md § 9c, adapted for a single-operator
-- shop that confirms bookings via WhatsApp.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ------------------------------------------------------------------
--  customers
--  Identified by phone (unique). Minimal profile — the WhatsApp
--  conversation is where the real relationship lives.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(32)  NOT NULL,
  email           VARCHAR(190) NULL,
  whatsapp_opt_in TINYINT(1)   NOT NULL DEFAULT 1,
  no_show_count   INT UNSIGNED NOT NULL DEFAULT 0,
  notes           TEXT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
--  services
--  What the shop offers. Admin editable. price_cents NULL = pricing
--  on request (confirmed at the chair).
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(120) NOT NULL,
  slug            VARCHAR(140) NOT NULL,
  description     TEXT NULL,
  price_cents     INT UNSIGNED NULL,
  duration_min    SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  display_order   INT UNSIGNED NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_services_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
--  schedule
--  Weekly working hours — single operator, so one row per weekday.
--  0 = Sunday … 6 = Saturday.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule (
  day_of_week     TINYINT UNSIGNED NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_working      TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
--  time_off
--  Holidays, sick days, one-off blocks. Reduces availability.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS time_off (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  starts_at       DATETIME NOT NULL,
  ends_at         DATETIME NOT NULL,
  reason          VARCHAR(255) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_time_off_range (starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
--  bookings
--  confirmation_code is the user-facing handle (used in WA replies).
--  price_cents_at_booking is a snapshot — services can change price
--  without rewriting history.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  confirmation_code       CHAR(8) NOT NULL,
  customer_id             BIGINT UNSIGNED NOT NULL,
  service_id              BIGINT UNSIGNED NULL,
  service_name            VARCHAR(120) NOT NULL,
  starts_at               DATETIME NOT NULL,
  ends_at                 DATETIME NOT NULL,
  status                  ENUM('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
  price_cents_at_booking  INT UNSIGNED NULL,
  notes                   TEXT NULL,
  notified_whatsapp       TINYINT(1) NOT NULL DEFAULT 0,
  notified_email          TINYINT(1) NOT NULL DEFAULT 0,
  ip_hash                 CHAR(64) NULL,
  user_agent              VARCHAR(255) NULL,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_bookings_code (confirmation_code),
  KEY idx_bookings_starts (starts_at),
  KEY idx_bookings_customer (customer_id),
  CONSTRAINT fk_bookings_customer
    FOREIGN KEY (customer_id) REFERENCES customers (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_bookings_service
    FOREIGN KEY (service_id)  REFERENCES services  (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
--  messages (contact-form inbox)
--  notified_whatsapp / notified_email flip to 1 after the notify
--  attempts, so the admin UI can tell at a glance if a reach-out
--  landed on the owner's phone.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name               VARCHAR(120) NOT NULL,
  email              VARCHAR(190) NOT NULL,
  subject            VARCHAR(190) NULL,
  body               TEXT NOT NULL,
  is_read            TINYINT(1) NOT NULL DEFAULT 0,
  notified_whatsapp  TINYINT(1) NOT NULL DEFAULT 0,
  notified_email     TINYINT(1) NOT NULL DEFAULT 0,
  ip_hash            CHAR(64) NULL,
  user_agent         VARCHAR(255) NULL,
  received_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_received (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
--  admins
--  Owner's login(s). Password hashed with password_hash() (bcrypt).
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(190) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(120) NOT NULL,
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
--  settings  (admin-editable site config)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  `key`       VARCHAR(64) NOT NULL,
  `value`     TEXT NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
