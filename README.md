# [Backend] API Integration Documentation

## Folder Structure

```
|--- config
|---prisma
|--- src
|    |--- exception-filter
|    |---guards
|    |--- interceptors
|    |--- modules
|    |--- prisma
|    |--- utils
|    |--- app.controller.ts
|    |--- app.module.ts
|    |--- app.service.ts
|    |--- main.ts
|--- test
|--- .env.sample
|--- .eslintrc.js
|---.prettierrc
|---nest-cli.json
|--- .gitignore
|--- package.json
|--- tsconfig.json
|--- tcsonfig.build.json
|--- yarn.lock
```

## Dependencies (Dev)

- Node.js
- TypeScript

## Setup Guides

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or later)
- [yarn](https://yarnpkg.com/) (Yarn Package Manager, included with Node.js)
- [Git](https://git-scm.com/)


#### If you don't have git on your machine, [install it](https://docs.github.com/en/get-started/quickstart/set-up-git).

## Fork this repository

Fork this repository by clicking on the fork button on the top of this page.
This will create a copy of this repository in your account.

## Clone the repository

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/clone.png" alt="clone this repository" />

Now clone the forked repository to your machine. Go to your GitHub account, open the forked repository, click on the code button and then click the _copy to clipboard_ icon based on the clone method you want to use (SSH, HTTPS and GitHub CLI).

Open a terminal and run the following git command:

```bash
git clone "url you just copied"
```

where "url you just copied" (without the quotation marks) is the url to this repository (your fork of this project). See the previous steps to obtain the url.

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/copy-to-clipboard.png" alt="copy URL to clipboard" />

For example:

```bash
git clone git@github.com:this-is-you/order-chat_management.git
```

where `this-is-you` is your GitHub username. Here you're copying the contents of the first-contributions repository on GitHub to your computer.

## Create a branch

Change to the repository directory on your computer (if you are not already there):

```bash
cd order-chat_management
```

Now create a branch using the `git switch` command:

```bash
git switch -c your-new-branch-name
```

For example:

```bash
git switch -c your-branch
```

## Install dependencies

```bash
yarn install
```

## Setup Environment Variables

Create a .env file in the root directory of the project. This file will contain the environment variables needed for the application to run as seen in the .env.example file.

Make sure that all variables are valid as this will determine if the setup will function or not.

## Setup Database

Run the following command to generate the Prisma Client, which will allow you to interact with the database:

```bash
yarn prisma generate
```

To apply the database schema and existing migrations to your local database, run:

```bash
yarn prisma migrate deploy
```

To check if your database schema is in sync with your Prisma schema, run:

```bash
yarn prisma migrate status
```

## Run the Application
Now, the application is ready to be run and tested locally, run:

```bash
yarn start:dev
```

# Testing Guides

Now that the application setup is complete and successful, proceed to the OPENAPI(Swagger) documentation to test the various endpoints.

To access the docs, open your browser and enter the following url;

```
http://localhost:PORT/api-docs
```

A valid user and admin can the be created using the endpoints for the Authentication resource.

These user details can then be used to create order(also perform other functionalities).

Make sure to signin the user after registering by copying the `access_token` and filling it in the `Authorize` box.




## Testing the chat functionality via websocket on postman

### Prerequisites

- **Postman**: Make sure you have Postman installed on your machine.
- **Backend running**: Ensure that the NestJS application (with the WebSocket Gateway) is up and running.

### 1. Establishing a WebSocket Connection

The first step is to open a WebSocket connection to the server using Postman.

1. Open **Postman**.
2. Create a **New Request**.
3. Set the request type to **WebSocket** by clicking on the WebSocket icon (on the left of the URL input bar).
4. In the **URL** field, enter the WebSocket URL of your server. For example:

```
ws://localhost:PORT
```


### 2. Handle Connection (Authentication)

The WebSocket connection needs to pass a `userId` parameter to authenticate the user. This is done via the connection query parameters.

- **userId**: This will be used to authenticate the user and join them to a specific room.


Example WebSocket connection URL with the `userId` query parameter:

```
ws://localhost:PORT?userId=USER_ID_HERE
```

Replace `USER_ID_HERE` with the actual user ID for testing.

### 3. Join a Chat Room

To join a chat room, you need to emit the `join_chat_room` event with the `chatRoomId`.

1. Once the WebSocket connection is established, you can send the `join_chat_room` event.
2. In Postman, go to the **Body** section and select **Raw**. Then enter the JSON payload to join a chat room:

```json
{
  "chatRoomId": "YOUR_CHAT_ROOM_ID"
}
```

3. Click send and the server will emit a response like this

```json
{
  "event": "joined_room",
  "data": {
    "chatRoomId": "YOUR_CHAT_ROOM_ID"
  }
}
```

### 4. Send a Message to a Chat Room

To send a message in the chat room, you need to emit the `message` event with the `chatRoomId` and the message `content`.

1. In the body section of postman, use the following JSON format

```json
{
  "chatRoomId": "YOUR_CHAT_ROOM_ID",
  "content": "Hello, this is a test message!"
}
```

2. Click `send` to emit the message

The server will the broadcast messages to users in the chat room

```json
{
  "event": "new_message",
  "data": {
    "chatRoomId": "YOUR_CHAT_ROOM_ID",
    "content": "Hello, this is a test message!",
    "senderId": "USER_ID_HERE",
    "timestamp": "2024-12-30T12:22:33.222Z"
  }
}
```

3. If an error occurs (e.g., invalid access to a chat room or sending a message to a non-existent chat room), the server will emit an error message. You can catch this error using Postman by listening on the `error` event

```json
{
  "event": "error",
  "data": "Access denied to chat room"
}
```

### 5. Disconnect
To disconnect from the WebSocket server:

1. Simply close the WebSocket connection in Postman by clicking Disconnect.
2. The handleDisconnect method in the gateway will be triggered on the server, removing the user from the room.


## 6. Running the test files

After performing tests on the system, the test files can be run using:

```bash
yarn test:e2e
```


### Important notice:

```bash
  console.log
```

is not allowed

Instantiate the system logger using the class name of the class you want to use it in.

```bash
  import { Logger } from "@nestjs/common";
  private readonly logger = new Logger(ClassName.name);
  this.logger.log("Content to be logged");
```


## commit changes

If you go to the project directory and execute the command `git status`, you'll see there are changes.

Add those changes to the branch you just created using the `git add .` command:

Commit the changes `git commit -m "commit message"`

## Push changes to GitHub

Push your changes using the command `git push`:

```bash
git push -u origin your-branch-name
```

replacing `your-branch-name` with the name of the branch you created earlier.

