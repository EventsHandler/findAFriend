# Events Handler

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version 23 or later (includes Corepack for `pnpm`)
- [Docker](https://www.docker.com/) and Docker Compose

### Setup and Running the Application

1.  **Start the database:**
    Open a terminal and run the following command from the project root directory:

    ```bash
    docker compose -f docker-compose.dev.yaml up -d
    ```

2.  **Install dependencies:**
    `pnpm` is automatically available via Corepack in Node.js v23+. Run:

    ```bash
    pnpm install
    ```

3.  **Start the development servers:**
    This command will start the backend server, the frontend client, and the GraphQL code generator in watch mode.
    ```bash
    pnpm dev
    ```

The application should now be running.
