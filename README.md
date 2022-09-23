# St House Utilities
Repository made public for transparency.

# Environment Variables
There are 2 `.env` files which contain runtime environment variables, one each for backend and frontend. Templates are provided in the `.env.example` files.

It turns out:
- For development, the `.env` file for both backend and frontend are necessary.
- For production, only the `.env` file for backned is necessary. The environment variable values used in production will be taken into account when building the production files (`npm run build`), as described [here](https://create-react-app.dev/docs/adding-custom-environment-variables/).

# README Bash Convention
Because we deal with 2 machines (development and production), I'll refer to them using bash prefixes:
- Development machine: `_@dev:<pwd>$`
- Production machine: `_@prod:<pwd>$`

For convention, this repository's parent on the file systems is assumed to be the home directory `~`.

# Development Notes
## Development Incremental Building
- For backend:
  - `_@dev:~/sthouse/backend$ bacon clippy` to check
  - `_@dev:~/sthouse/backend$ bacon run` to run
- For frontend:
  - `_@dev:~/sthouse/frontend$ npm start` to run

## Development TLS
1. `_@dev:~/sthouse$ mkcert 127.0.0.1 localhost`

Development `cert.pem` and `key.pem` files are stored in the repository root and can be generated via steps outlined [here](https://github.com/actix/examples/tree/master/https-tls/rustls).

# Deployment Notes
These instructions are for a production machine that runs Ubuntu.

## Production Building (Full Flow)
1. Ensure dependencies. Mainly, ensure that Node is recent enough (Node is the JavaScript runtime; so that modern JavaScript syntax is accepted; the specific one that failed with Nodev12 was the null coalescing operator):
   1. ~`_@prod:~$ sudo apt purge nodejs`~
      This step is not necessary on a fresh setup. Only necessary if `nodejs` or `npm` was previously installed via `apt`.
   2. ~`_@prod:~$ sudo rm -r /etc/apt/sources.list.d/nodesource.list`~\
      This step is not necessary on a fresh setup. Only necessary if `nodejs` or `npm` was previously installed via `apt`.
   3. `_@prod:~$ curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -`
   4. `_@prod:~$ sudo apt-get install -y nodejs`
   5. `_@prod:~$ sudo npm install -g serve`\
      This is used to deploy the frontend. We aren't cloning this repository onto the production machine, so we install this npm package globally with `-g`. Command may fail without `sudo`.
   
   A system restart is recommended after performing steps iv: `sudo shutdown -r now`.\
   Original instructions from [here](https://github.com/nodesource/distributions/blob/master/README.md#debinstall).

2. `_@prod:~$ mkdir -p sthouse/backend sthouse/frontend`\
   This creates the appropriate folder structure for deployment. `-p` ignores if exists, and creates intermediate parents.
   
3. TLS:
   1. `_@prod:~/sthouse$ openssl req -new -nodes -keyout production.key -out production.csr`\
      `production.key` is the key file.
      - The non-crossed out values were provided. Those crossed out, `.` is provided.
        - Country Name (2 letter code)
        - State or Province Name (full name)
        - Locality Name (eg, city)
        - ~Organization Name (eg, company)~
        - ~Organizational Unit Name (eg, section)~
        - Common Name (e.g. server FQDN or YOUR name): `stpaulswalk-jswz.servehttp.com`
        - ~Email Address~
        - ~A challenge password~
        - ~An optional company name~
   2. `_@prod:~/sthouse$ cat production.csr` and provide these values to NoIP.
   3. After some delay, NoIP will email you the cert file. Transfer that to `_@prod:~/sthouse`.
   
   Original instructions from [here](https://www.noip.com/support/knowledgebase/apache-openssl/).

4. Environment variables:
   1. `_@prod:~/sthouse/backend$ wget --no-cache https://raw.githubusercontent.com/jackykwe/sthouse/main/backend/.env.example`
   2. `_@prod:~/sthouse/backend$ mv .env.example .env`
   3. `_@prod:~/sthouse/backend$ nano .env` and fill in the necessary values.

   No setting up environment variables for frontend is required as explained [above](#environment-variables).

5. For backend, because we deploy onto a different architecture, cross-compilation may be necessary _(compilation on production machine was prohibitively slow)_:
   1. `_@prod:~$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`\
      This attempts to installs Rust. No need to follow through, just note the "Current installation options: default host triple" value. I'll refer to this as `<prod_arch>`.
      
      This command comes from [here](https://www.rust-lang.org/tools/install).
   2. `_@dev:~$ rustup target add <prod_arch>` **(Remember to fill in the gaps)**\
      This installs cross-compilation tools.
   3. `_@dev:~/sthouse/backend$ CARGO_TARGET_<PROD_ARCH_ALL_CAPS_HYPHENS_INTO_UNDERSCORES>_LINKER=arm-linux-gnueabihf-gcc cargo build --release --target <prod_arch>` **(Remember to fill in the gaps)**
      - There was a massive rabbit hole that I went through to install the pre-requisite dependencies at this stage. The one needed was `arm-linux-gnueabihf-gcc`. The installation order was, iirc:
        - `arm-linux-gnueabihf-binutils` (needed by stage1)
        - `arm-linux-gnueabihf-gcc-stage1`
        - `arm-linux-gnueabihf-linux-api-headers` (needed by glibc-headers)
        - `arm-linux-gnueabihf-glibc-headers` (needed by stage2)
        - `arm-linux-gnueabihf-gcc-stage2` (conflicts with and will remove stage1)
        - `arm-linux-gnueabihf-glibc` (needed by gcc)
        - `arm-linux-gnueabihf-gcc` (conflicts with and will remove stage2)
      - Since I'm on an Arch-based OS, `makepkg -sri` was a common command to build these.
      - Sometimes, public key verification fails when building these packages (obtained from AUR). `gpg --recv-key <ID>` resolved these, where `<ID>` is obtained from the error message following verification error
   4. `_@dev:~/sthouse/backend$ scp target/<prod_arch>/release/backend _@prod:~/sthouse/backend` **(Remember to fill in the gaps)**
   5. `_@prod~/sthouse/backend$ ./backend` to serve the backend.

6. For frontend:
   1. `_@dev:~/sthouse/frontend$ npm run build`
   2. `_@dev:~/sthouse/frontend$ tar cvzf build.tar.gz build`
   3. `_@dev:~/sthouse/frontend$ scp build.tar.gz _@prod:~/sthouse/frontend`
   4. `_@prod:~/sthouse/frontend$ tar xvzf build.tar.gz`
   5. `_@prod:~/sthouse/frontend$ serve -s build -l <port> --ssl-cert=<path to cert file> --ssl-key=<path to key file>` to serve the frontend. **(Remember to fill in the gaps)**

7. To automate the above during startup, we use `systemd`:
   1. ```
      _@prod:~/sthouse$ cat <<EOF > startup.sh
      #!/bin/bash
      cd ~/sthouse/backend
      ./backend &
      cd ~/sthouse/frontend
      serve -s build -l <port> --ssl-cert=<path to cert file> --ssl-key=<path to key file> &
      EOF
      ```
      **(Remember to fill in the gaps)**
   2. `_@prod:~/sthouse$ chmod +x startup.sh`
   3. `_@prod:~/sthouse$ crontab -e` and append this line: `@reboot sh ~/sthouse/startup.sh`

   Now the backend and frontends should startup automatically on reboot.  
