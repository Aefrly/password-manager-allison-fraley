# OpenSesame

OpenSesame is a locally hosted password manager for saving website links and their associated usernames and passwords. Website and credential data is stored in SQLite; passwords are encrypted at rest using AES-256-GCM.

> **Use for local development and demonstration only.** The app has no user authentication, and its API can return decrypted passwords. Do not expose it to the internet or use it for real secrets.

## Project status

- **Live deployment:** None configured. After setup, open [http://127.0.0.1:3000](http://127.0.0.1:3000).
- **Repository:** [Aefrly/password-manager-allison-fraley](https://github.com/Aefrly/password-manager-allison-fraley)

## What it does

- Save a website name and URL, then open it in a new tab.
- Save a username and password for a website.
- See saved usernames and reveal or hide passwords in the browser.
- Store data locally in a SQLite database.
- Encrypt saved passwords with AES-256-GCM before database storage.

## Requirements

- Node.js **20.17.0 or later** (required by the installed `sqlite3` version).
- npm.
- Internet access for the Bootstrap stylesheet loaded from jsDelivr.

## Quick start

1. Clone the repository and enter its folder:

   ```sh
   git clone https://github.com/Aefrly/password-manager-allison-fraley.git
   cd password-manager-allison-fraley
   ```

2. Install dependencies:

   ```sh
   npm ci
   ```

3. Generate an encryption key:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

4. Create `documentation/.env` and add the generated value:

   ```dotenv
   CREDENTIALS_ENCRYPTION_KEY=replace_with_your_64_character_hex_key
   ```

   The key must be 64 hexadecimal characters. Keep it private and retain a secure backup: if it is lost or changed, existing passwords cannot be decrypted.

5. Start the server:

   ```sh
   node server/index.js
   ```

6. Visit [http://127.0.0.1:3000](http://127.0.0.1:3000). Keep the server running while using the app; press `Ctrl+C` in its terminal to stop it.

The server creates or updates `server/password-manager.sqlite` on startup. Do not open `source code/index.html` directly from the filesystem; the app needs the server API.

## How to use

1. Select **Add new website**.
2. Enter a name and a URL beginning with `http://` or `https://`, then submit.
3. Enter a username/email and password in the prompt for that website and choose **Save information**.
4. On the saved credential card, select **Show password** to reveal the password or **Hide password** to conceal it.
5. Select the website's **Open ...** link to open it in a new tab.

## Architecture

```text
Browser UI
  source code/index.html, styles.css, script.js
          |
          | fetch (JSON)
          v
Express server
  server/index.js, server/api-routes.js
          |
          | Sequelize models
          v
SQLite database
  server/password-manager.sqlite
```

| Component | Responsibility |
| --- | --- |
| `source code/index.html` and `styles.css` | Page structure and styling. Bootstrap CSS is loaded from jsDelivr. |
| `source code/script.js` | Form interactions and rendering website links and credential cards. |
| `source code/api-service.js` | Centralizes browser requests to the API at `http://127.0.0.1:3000/api`. |
| `server/index.js` | Reads the local environment file, initializes Sequelize, starts Express, and serves the frontend and API. |
| `server/api-routes.js` | Validates website and credential requests and encrypts/decrypts passwords. |
| `server/models.js` | Defines the Sequelize `Website` and `Credential` models and their one-to-many relationship. |
| `tests/` | Jest tests for API-service behavior using mocked `fetch` calls. |

### Design patterns and decisions

- **Layered design:** UI rendering, HTTP calls, request handling, and persistence have separate modules.
- **API service module:** Network access is kept out of the UI event handlers and shared through `api-service.js`.
- **Relational model:** Each credential belongs to one website; a website can have multiple credentials.
- **Local-first storage:** SQLite keeps setup simple and avoids requiring an external database service.
- **Authenticated encryption at rest:** Each password uses AES-256-GCM with a fresh random 12-byte IV and an authentication tag. The key is supplied through `CREDENTIALS_ENCRYPTION_KEY`, not stored in the database.
- **Same-origin local serving:** Express serves both the frontend and API. The server binds to `127.0.0.1`; this keeps the app local but does not replace API authentication.
- **Safe text rendering:** User-entered names and usernames are rendered as text rather than HTML.

## API

Base URL: `http://127.0.0.1:3000/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/websites` | Return saved websites. |
| `POST` | `/websites` | Create a website. Body: `{"name":"Example","url":"https://example.com"}` |
| `GET` | `/credentials` | Return saved credentials, including decrypted passwords. |
| `POST` | `/credentials` | Create a credential. Body: `{"websiteId":1,"username":"name","password":"secret"}` |

The API has no authentication. In particular, `GET /credentials` returns plaintext passwords to its caller. The loopback-only server binding is intentional; do not expose the app to a network without first implementing and reviewing authentication and transport security.

## Tests

Run the Jest suite:

```sh
npm test
```

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Invalid or missing encryption key | Set `CREDENTIALS_ENCRYPTION_KEY` in `documentation/.env`. It must be exactly 64 hexadecimal characters. Restart the server after changing it. |
| Page loads but data does not | Make sure `node server/index.js` is still running and visit `http://127.0.0.1:3000` (not `localhost` or a `file://` URL). Check the browser console and server terminal. |
| Port is already in use | Stop the other process using port 3000. The frontend API URL is hard-coded to this port, so changing only the server's `PORT` will break API requests. |
| Dependency or SQLite install fails | Use Node.js 20.17.0 or later and run `npm ci`. If a native prebuilt package is unavailable, install your platform's compiler/build tools. |
| Bootstrap styling is missing | The Bootstrap stylesheet comes from jsDelivr; check network access. The project's own `styles.css` is served locally. |

## Known limitations

- No user accounts, sign-in, authorization, or master-password workflow.
- Credentials cannot currently be edited or deleted through the interface.
- The encryption key has no built-in rotation or recovery mechanism.
- The frontend API URL is fixed to `127.0.0.1:3000`.
- SQLite and the local-only server are intended for a single-user demo, not shared or concurrent hosting.
- Bootstrap depends on a third-party CDN.
- No production deployment or application screenshots are currently provided.

## Possible future enhancements

- Add authentication and protect credential endpoints.
- Design secure key provisioning, rotation, and recovery.
- Add edit and delete operations for websites and credentials.
- Make the API URL configurable and add backend/browser integration tests.
- Capture and document the running UI using non-sensitive sample data.
- Revisit deployment only after designing a secure multi-user and transport-security model.