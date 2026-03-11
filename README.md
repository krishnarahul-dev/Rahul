# Cflow Internal Chat System

A lightweight, real-time chat system designed to be embedded inside Cflow workflow request pages. Users participating in a workflow can communicate through a dedicated conversation tied to each workflow request.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Cflow Workflow Page (Host)                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  <ChatWindow workflowId="1023" currentUser={…} /> │  │
│  └───────────────────────────────────────────────────┘  │
│         │  REST + WebSocket                             │
│         ▼                                               │
│  ┌─────────────────────────┐                            │
│  │  Express + Socket.io    │◄── Node.js server          │
│  │  /api/*  (REST)         │                            │
│  │  ws://   (real-time)    │                            │
│  └───────────┬─────────────┘                            │
│              │                                          │
│              ▼                                          │
│  ┌─────────────────────────┐                            │
│  │  PostgreSQL             │                            │
│  │  users, conversations,  │                            │
│  │  messages, mentions     │                            │
│  └─────────────────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Backend  | Node.js, Express, Socket.io   |
| Database | PostgreSQL                    |
| Frontend | React 18, Tailwind CSS, Vite  |
| Realtime | Socket.io (WebSocket)         |

---

## Folder Structure

```
cflow-chat/
├── sql/
│   └── schema.sql                 # DB schema + seed data
├── server/
│   ├── config/
│   │   └── db.js                  # PostgreSQL pool
│   ├── controllers/
│   │   ├── conversationController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── conversations.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── socket.js                  # Socket.io event handlers
│   ├── server.js                  # Entry point
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx     # Main chat component
│   │   │   ├── MessageBubble.jsx  # Individual message
│   │   │   └── MentionDropdown.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js       # Socket.io React hook
│   │   ├── services/
│   │   │   └── api.js             # REST client
│   │   ├── App.jsx                # Demo wrapper
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Create the database
createdb cflow_chat

# Run the schema (creates tables + seed data)
psql -U postgres -d cflow_chat -f sql/schema.sql
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env from template
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Start the server
npm run dev     # development (with hot reload)
npm start       # production
```

The server starts at `http://localhost:4000`.

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend starts at `http://localhost:5173` with API requests proxied to the backend.

### 4. Test It

1. Open `http://localhost:5173` in **two browser tabs**
2. Select a different user in each tab
3. Start chatting — messages appear in real-time

---

## API Reference

### Conversations

| Method | Endpoint                                    | Description                       |
|--------|---------------------------------------------|-----------------------------------|
| GET    | `/api/conversations/:workflowId`            | Get or create conversation        |
| POST   | `/api/conversations/:id/participants`       | Add participant                   |

### Messages

| Method | Endpoint                              | Description                     |
|--------|---------------------------------------|---------------------------------|
| POST   | `/api/messages`                       | Send a message                  |
| GET    | `/api/messages/:conversationId`       | Get messages (paginated)        |
| GET    | `/api/messages/mentions/:userId`      | Get mentions for a user         |

### Users

| Method | Endpoint                | Description                    |
|--------|-------------------------|--------------------------------|
| POST   | `/api/users`            | Upsert user from Cflow         |
| GET    | `/api/users/search?q=`  | Search users (mention autocomplete) |

---

## Socket.io Events

### Client → Server

| Event            | Payload                                          | Description            |
|------------------|--------------------------------------------------|------------------------|
| `join_workflow`  | `{ workflow_id, user: { cflow_id, name, email }}` | Join a workflow room  |
| `send_message`   | `{ message }`                                    | Send a chat message    |
| `typing`         | —                                                | Typing indicator start |
| `stop_typing`    | —                                                | Typing indicator stop  |

### Server → Client

| Event              | Payload                           | Description              |
|--------------------|-----------------------------------|--------------------------|
| `receive_message`  | Full message object with sender   | New message broadcast    |
| `user_joined`      | `{ user, workflow_id }`           | Participant joined       |
| `user_left`        | `{ user, workflow_id }`           | Participant disconnected |
| `user_typing`      | `{ user_id, name }`              | Someone is typing        |
| `user_stop_typing` | `{ user_id }`                    | Someone stopped typing   |
| `error_event`      | `{ message }`                    | Error notification       |

---

## Embedding in Cflow

To embed the chat component inside a Cflow workflow page, import `ChatWindow` and pass the workflow context:

```jsx
import ChatWindow from "./components/ChatWindow";

// Inside your Cflow workflow request page:
<ChatWindow
  workflowId="1023"
  currentUser={{
    id: "uuid-from-db",
    cflow_id: "cflow_1001",
    name: "Arjun Mehta",
    email: "arjun@cflow.dev"
  }}
/>
```

The component is self-contained — it manages its own WebSocket connection, message history, typing indicators, and @mention autocomplete.

---

## Features

- **Per-workflow conversations** — each workflow request gets its own chat room
- **Real-time messaging** — Socket.io with WebSocket transport
- **@Mentions** — type `@` to search and mention participants; mentions stored in DB
- **Typing indicators** — see who is currently typing
- **Message persistence** — all messages stored in PostgreSQL
- **Auto-sync users** — users upserted from Cflow session on every connection
- **Participant tracking** — automatic join on first connection
- **Responsive UI** — works in sidebars, panels, and full-page layouts
