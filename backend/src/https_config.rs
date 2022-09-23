use std::{fs::File, io::BufReader};

use rustls::{Certificate, PrivateKey, ServerConfig};
use rustls_pemfile::{certs, pkcs8_private_keys};

use crate::app_env_config::AppEnvConfig;

// From https://github.com/actix/examples/blob/master/https-tls/rustls/src/main.rs
#[allow(clippy::unwrap_used)]
pub fn load_rustls_config() -> ServerConfig {
    let aec = AppEnvConfig::read_from_dot_env();

    // init server config builder with safe defaults
    let config = ServerConfig::builder()
        .with_safe_defaults()
        .with_no_client_auth();

    // load TLS key/cert files
    let cert_file = &mut BufReader::new(
        File::open(&aec.tls_cert_path)
            .unwrap_or_else(|_| panic!("Unable to find cert file at {}", aec.tls_cert_path)),
    );
    let key_file = &mut BufReader::new(
        File::open(&aec.tls_key_path)
            .unwrap_or_else(|_| panic!("Unable to find key file at {}", aec.tls_key_path)),
    );

    // convert files to key/cert objects
    let cert_chain = certs(cert_file)
        .unwrap()
        .into_iter()
        .map(Certificate)
        .collect();
    let mut keys: Vec<PrivateKey> = pkcs8_private_keys(key_file)
        .unwrap()
        .into_iter()
        .map(PrivateKey)
        .collect();

    // exit if no keys could be parsed
    if keys.is_empty() {
        eprintln!("Could not locate PKCS 8 private keys.");
        std::process::exit(1);
    }

    config.with_single_cert(cert_chain, keys.remove(0)).unwrap()
}
