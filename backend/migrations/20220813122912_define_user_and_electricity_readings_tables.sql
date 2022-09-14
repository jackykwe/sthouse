-- Add migration script here

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS electricity_readings;

CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY NOT NULL,
    auth0_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS electricity_readings(
    id INTEGER PRIMARY KEY NOT NULL,
    low_kwh REAL NOT NULL,
    normal_kwh REAL NOT NULL,
    unix_ts_millis INTEGER NOT NULL,
    creator_id INTEGER NOT NULL,
    tombstone INTEGER NOT NULL DEFAULT 0,
    UNIQUE(unix_ts_millis, creator_id),
    FOREIGN KEY(creator_id) REFERENCES users(id)
) STRICT;
