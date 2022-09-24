-- Add migration script here

ALTER TABLE electricity_reading_modifications
ADD COLUMN image_modified INTEGER NOT NULL DEFAULT 0;
