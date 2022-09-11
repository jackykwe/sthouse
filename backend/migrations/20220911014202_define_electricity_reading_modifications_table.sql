-- Add migration script here

DROP TABLE IF EXISTS electricity_reading_modifications;

CREATE TABLE IF NOT EXISTS electricity_reading_modifications(
    reading_id INTEGER NOT NULL,
    modifier_id INTEGER NOT NULL,
    unix_ts_millis INTEGER NOT NULL,
    FOREIGN KEY(reading_id) REFERENCES electricity_readings(id),
    FOREIGN KEY(modifier_id) REFERENCES users(id),
    PRIMARY KEY(reading_id, modifier_id, unix_ts_millis)
) STRICT;
