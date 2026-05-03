# Events Handler
Technologies are supposed to help us meet new people, this webapp is perfectly designed for it. 
Choose interests, join groups, open locations and meet real people.
Get bonuses for interacting with the outer world and form new groups to get more people involved.

## Tech Stack ##
- **Frontend:** Vue, TypeScript, Vite
- **Backend:** Node.js, TypeScript, GraphQL
- **Database:** PostgreSQL (via Docker), Prisma ORM
- **Package Manager:** pnpm
- **AI:** Groq API

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version 23 or later (includes Corepack for `pnpm`)
- [Docker](https://www.docker.com/) and Docker Compose

### Setup and Running the Application

1.  **Start the database:**
    Windows:
    ensure to have installed Docker Desktop
    Run in powershell or cmd line
    ```
    docker compose -f docker-compose.dev.yaml up -d
    ```

    Linux:
    Open a terminal and run the following command from the project root directory:
    ```bash
    sudo docker compose -f docker-compose.dev.yaml up -d
    ```

2.  **Install dependencies:**
    `pnpm` is automatically available via Corepack in Node.js v23+. Run:

    ```bash
    pnpm install
    ```

3. **Initiate DataBase**
    ```
    cd packages/server
    pnpm prisma migrate dev
    ```
    then
    ```
    pnpm prisma generate
    ```

   >**Note:** Everytime graphql is changed re-run "pnpm codegen"
    ```
    pnpm codegen
    ```

4. **Load crates/badges, missions, locations**
    while in packages/server run
    ```
    npx ts-node src/seed.ts
    npx ts-node src/seedLocations.ts
    npx ts-node src/seedMissions.ts
    ```

5.  **.env file**
    Before changin the directory
    Rename `.env_example` file into `.env` and replace the text between quotes with your API key 
    generated from https://console.groq.com/docs/api-reference#chat.
    DataBase credentials are already filled in.

    Afeter renaming it move to client directory in packets
    ```
    cd ../client
    ```
    As previous, rename `.env_example` file into `.env` and fill the API_KEYS as needed 
    from https://pusher.com/

6.  **Start the development servers:**
    return to root directory
    ```
    cd ../..
    ```

    This command will start the backend server, the frontend client, and the GraphQL code generator in watch mode.
    ```bash
    pnpm dev
    ```

    After starting, run "u" in terminal would be printed the local URL port where the WebApp will run
    ```
    u
    ```

The application should now be running.

