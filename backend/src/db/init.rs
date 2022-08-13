use log::debug;
use sqlx::{Pool, Sqlite};

use crate::api::electricity_readings::ElectricityReadingCreateDTO;
use crate::db::electricity_readings::create_electricity_reading;
use crate::types::CEResult;

pub async fn initialise_database(pool: &Pool<Sqlite>) -> CEResult<()> {
    debug!("initialise_database() called");
    run_pending_migrations(pool).await?;
    add_dummy_data(pool).await?; // TODO: DEV ONLY
    Ok(())
}

async fn run_pending_migrations(pool: &Pool<Sqlite>) -> CEResult<()> {
    debug!("run_pending_migrations() called");
    sqlx::migrate!("./migrations").run(pool).await?;
    Ok(())
}

async fn add_dummy_data(pool: &Pool<Sqlite>) -> CEResult<()> {
    debug!("add_dummy_data() called");
    let readings = vec![
        #[allow(clippy::approx_constant)]
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
        create_electricity_reading(pool, reading).await?;
    }
    Ok(())
}
