use std::io::{Error as IOError, ErrorKind};

use log::debug;

use crate::api::electricity_readings::ElectricityReadingCreateDTO;
use crate::app_env_config::AppEnvConfig as AEC;
use crate::db::electricity_readings::create_electricity_reading;
use crate::db::types::Pool;
use crate::db::utils::{execute_statement_in_pool, get_connection};
use crate::types::AWError;

pub async fn initialise_database(pool: &Pool) -> Result<(), IOError> {
    debug!("initialise_database() called");
    let dev_mode = AEC::default().dev_mode;
    if dev_mode {
        drop_table_if_exists(pool)
            .await
            .map_err(|err| IOError::new(ErrorKind::Other, err.to_string()))?;
    }

    create_table_if_not_exists(pool)
        .await
        .map_err(|err| IOError::new(ErrorKind::Other, err.to_string()))?;

    if dev_mode {
        let readings = vec![
            ElectricityReadingCreateDTO {
                low_kwh: 3.14,
                normal_kwh: 42.42,
                creator_name: String::from("Alice"),
                creator_email: String::from("alice@gmail.com"),
            },
            ElectricityReadingCreateDTO {
                low_kwh: 31.4,
                normal_kwh: 424.2,
                creator_name: String::from("Bob"),
                creator_email: String::from("bob@gmail.com"),
            },
            ElectricityReadingCreateDTO {
                low_kwh: 314.0,
                normal_kwh: 4242.0,
                creator_name: String::from("Alice"),
                creator_email: String::from("alice@gmail.com"),
            },
        ];

        for reading in readings {
            create_electricity_reading(pool, reading)
                .await
                .map_err(|err| IOError::new(ErrorKind::Other, err.to_string()))?;
        }
    }
    Ok(())
}

/*
https://www.sqlitetutorial.net/sqlite-autoincrement/
When you create a table that has an INTEGER PRIMARY KEY column, this column is the alias of the rowid column.
*/
async fn create_table_if_not_exists(pool: &Pool) -> Result<(), AWError> {
    debug!("create_table_if_not_exists() called");
    let conn = get_connection(pool).await?;
    execute_statement_in_pool(move || {
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY NOT NULL,
                display_name TEXT NOT NULL,
                email TEXT NOT NULL,
                UNIQUE(display_name, email)
            ) STRICT;
            CREATE TABLE IF NOT EXISTS electricity_readings(
                id INTEGER PRIMARY KEY NOT NULL,
                low_kwh REAL NOT NULL,
                normal_kwh REAL NOT NULL,
                unix_ts_millis INTEGER NOT NULL,
                creator_id INTEGER NOT NULL,
                UNIQUE(unix_ts_millis, creator_id),
                FOREIGN KEY(creator_id) REFERENCES users(id)
            ) STRICT;
            ",
        )
    })
    .await
}

async fn drop_table_if_exists(pool: &Pool) -> Result<(), AWError> {
    debug!("drop_table_if_exists() called");
    let conn = get_connection(pool).await?;
    execute_statement_in_pool(move || {
        conn.execute_batch(
            "
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS electricity_readings;
            ",
        )
    })
    .await
}
