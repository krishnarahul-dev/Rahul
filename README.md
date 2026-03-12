# Cflow Workflow Chat System

A lightweight **real-time workflow chat platform** designed to integrate directly inside **Cflow workflow request pages**.

The system enables workflow participants to communicate, discuss approvals, and collaborate without leaving the workflow interface.

Supports **Direct Messages, Group Chats, and Workflow Conversations** with persistent message storage and real-time communication.

---

# Deployment Infrastructure

## Frontend

**Hosting Platform:** Vercel  

**Technology Stack**

- Angular
- TypeScript
- HTML
- CSS
- Socket.io Client
- REST API Integration

**Frontend URL**


https://rahul-green.vercel.app


**Responsibilities**

- Chat interface rendering
- Conversation sidebar management
- Direct and group chat creation
- Real-time message updates
- Presence indicators
- Unread message badges

---

## Backend

**Hosting Platform:** Render Web Service  

**Technology Stack**

- Node.js
- Express.js
- Socket.io
- node-postgres (pg)
- dotenv
- cors

**Backend API**


https://cflow-chat-server.onrender.com


**Responsibilities**

- REST API endpoints
- WebSocket event handling
- Message persistence
- Conversation participant management
- User presence tracking
- Real-time messaging

---

## Database

**Provider:** Render PostgreSQL  

**Database Engine**


PostgreSQL


**Connection Method**


DATABASE_URL
pg.Pool connection pooling


---

# Repository

**GitHub Repository**


https://github.com/krishnarahul-dev/Rahul


**Detailed Documentation**


https://github.com/krishnarahul-dev/Rahul/blob/main/README.md


Contains

- Upgrade instructions
- System architecture
- API reference
- Deployment guide
- Folder structure

---

# System Architecture


Browser (Angular Frontend)
│
│ REST API + WebSocket
▼
Node.js / Express Backend (Render)
│
│ PostgreSQL Driver (pg)
▼
PostgreSQL Database (Render)


---

# Core Features

## Workflow Conversations
Each workflow request automatically creates a dedicated conversation where workflow participants can discuss approvals and decisions.

## Direct Messaging
Users can start private one-to-one conversations independent of workflow requests.

## Group Chats
Multiple users can collaborate in shared chat groups.

## Real-Time Messaging
Socket.io enables real-time message delivery between participants.

## Persistent Message Storage
All messages are stored in PostgreSQL so chat history remains available even after page refresh.

## User Mentions


@username


Mention suggestions appear in the UI.

## Typing Indicators
Participants can see when another user is typing.

## Presence Indicators


Online
Away
Offline


## Unread Message Counters
Each conversation shows unread message badges.

---

# Folder Structure
client-angular/
src/app/
chat/
components/
services/
models/
utilities/

server/
controllers/
models/
routes/
socket.js
server.js

sql/
migration-v2.sql
---

# Core Capability Summary

- Workflow-based chat conversations
- Direct user messaging
- Group collaboration chats
- Real-time communication via WebSocket
- Persistent chat history
- User presence indicators
- Typing indicators
- Mention support
- Unread message tracking
