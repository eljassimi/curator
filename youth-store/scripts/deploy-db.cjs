"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

/** Merge root `.env` into `process.env` so this script matches Prisma CLI behavior. */
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

/**
 * Trim and unwrap accidental extra quotes (common when pasting from hosting panels).
 */
function unwrapEnvString(raw) {
  if (raw == null) return "";
  let s = String(raw).trim();
  while (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Prisma MySQL datasource requires `mysql://`. Hosting panels sometimes omit the
 * protocol or use JDBC-style URLs.
 */
function normalizeMysqlUrl(raw) {
  let u = unwrapEnvString(raw);
  if (!u) return "";

  if (u.startsWith("jdbc:mysql://")) {
    u = "mysql://" + u.slice("jdbc:mysql://".length);
  } else if (u.startsWith("mysql2://")) {
    u = "mysql://" + u.slice("mysql2://".length);
  } else if (!u.includes("://") && u.includes("@")) {
    u = "mysql://" + u.replace(/^\/+/, "");
  }

  return u;
}

function resolveDatabaseUrl() {
  const candidates = [
    "DATABASE_URL",
    "MYSQL_URL",
    "MYSQL_DATABASE_URL",
    "MYSQLDATABASE_URL",
  ];

  for (const key of candidates) {
    const raw = process.env[key];
    if (!unwrapEnvString(raw)) continue;
    const normalized = normalizeMysqlUrl(raw);
    if (normalized.startsWith("mysql://")) {
      if (key !== "DATABASE_URL") {
        console.log(`[deploy-db] Mapped ${key} → DATABASE_URL for Prisma.`);
      }
      process.env.DATABASE_URL = normalized;
      return normalized;
    }
  }

  const fallback = normalizeMysqlUrl(process.env.DATABASE_URL);
  if (fallback.startsWith("mysql://")) {
    process.env.DATABASE_URL = fallback;
  }
  return fallback;
}

function printInvalidUrlHelp(raw) {
  const preview =
    raw === undefined || raw === ""
      ? "(empty)"
      : `${String(raw).slice(0, 80)}${String(raw).length > 80 ? "…" : ""}`;
  console.error("");
  console.error("[deploy-db] DATABASE_URL is not a valid Prisma MySQL URL.");
  console.error(`[deploy-db] Current value (preview): ${preview}`);
  console.error(
    "[deploy-db] Prisma requires: mysql://USER:PASSWORD@HOST:PORT/DATABASE",
  );
  console.error(
    "[deploy-db] On Hostinger: use Remote MySQL host (not localhost), include the port (often 3306), and URL-encode special characters in the password.",
  );
  console.error("");
}

loadEnvFile();

function sh(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

sh("npx prisma generate");

const dbUrl = resolveDatabaseUrl();

// Debug: show masked DATABASE_URL to help troubleshoot connection issues
if (dbUrl) {
  try {
    const urlObj = new URL(dbUrl);
    const maskedPassword = urlObj.password ? "***" : "(empty)";
    console.log(`[deploy-db] DATABASE_URL: ${urlObj.protocol}//${urlObj.username}:${maskedPassword}@${urlObj.host}${urlObj.pathname}`);
  } catch {
    console.log("[deploy-db] DATABASE_URL format could not be parsed for debugging.");
  }
}

if (!dbUrl || dbUrl.trim() === "") {
  console.log(
    "[deploy-db] DATABASE_URL is not set — skipping migrate deploy and seed (OK for local next build without a DB).",
  );
  process.exit(0);
}

if (!dbUrl.startsWith("mysql://")) {
  printInvalidUrlHelp(process.env.DATABASE_URL);
  process.exit(1);
}

try {
  sh("npx prisma migrate deploy");
} catch (err) {
  console.warn("[deploy-db] Warning: prisma migrate deploy failed. This may be due to network restrictions.");
  console.warn("[deploy-db] The build will continue. Run migrations manually if needed.");
  console.warn("[deploy-db] Error:", err.message || err);
}

if (process.env.SKIP_SEED === "1" || process.env.SKIP_SEED === "true") {
  console.log("[deploy-db] SKIP_SEED is set — skipping prisma db seed.");
  process.exit(0);
}

try {
  sh("npx prisma db seed");
} catch (err) {
  console.warn("[deploy-db] Warning: prisma db seed failed. This may be due to network restrictions.");
  console.warn("[deploy-db] The build will continue. Run seed manually if needed.");
}
