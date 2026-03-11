<h1>Cflow Internal Chat System</h1>

<p>
A lightweight real-time workflow chat system designed to integrate directly inside Cflow workflow request pages.
</p>

<p>
Each workflow request automatically gets a dedicated conversation room where participants can collaborate, discuss approvals, and exchange messages.
</p>

<p>
The system supports persistent chat history, user mentions, typing indicators, and real-time message delivery.
</p>

<hr>

<h2>System Architecture</h2>

<pre>
Browser (Workflow Page)
        │
        │ REST API + WebSocket
        ▼
Frontend Application (Vercel)
        │
        ▼
Node.js Backend (Render Web Service)
        │
        ▼
PostgreSQL Database (Render Managed DB)
</pre>

<h2>Architecture Diagram</h2>

<pre>
┌──────────────────────────────────────────────────────────┐
│ Cflow Workflow Page                                      │
│                                                          │
│   Chat Component                                         │
│   &lt;ChatWindow workflowId="1023" currentUser={...} /&gt;     │
│                                                          │
└───────────────▲──────────────────────────────────────────┘
                │
                │ REST + WebSocket
                │
┌───────────────┴──────────────────────────────────────────┐
│ Backend API Server                                       │
│ Node.js + Express + Socket.io                            │
│                                                          │
│ REST Endpoints                                           │
│ /api/conversations                                       │
│ /api/messages                                            │
│ /api/users                                               │
│                                                          │
│ WebSocket Events                                         │
│ join_workflow                                            │
│ send_message                                             │
│ typing indicators                                        │
└───────────────▲──────────────────────────────────────────┘
                │
                │ PostgreSQL connection
                ▼
┌──────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                      │
│                                                          │
│ users                                                    │
│ conversations                                            │
│ conversation_participants                                │
│ messages                                                 │
└──────────────────────────────────────────────────────────┘
</pre>

<hr>

<h2>Hosting Infrastructure</h2>

<h3>Frontend</h3>
<p><strong>Hosted on:</strong> Vercel</p>
<p><strong>Frontend URL:</strong></p>

<pre>https://rahul-green.vercel.app</pre>

<p><strong>Responsibilities:</strong></p>
<ul>
  <li>Chat UI rendering</li>
  <li>WebSocket client connection</li>
  <li>REST API communication</li>
  <li>Message display and input</li>
</ul>

<h3>Backend</h3>
<p><strong>Hosted on:</strong> Render Web Service</p>
<p><strong>Backend API:</strong></p>

<pre>https://cflow-chat-server.onrender.com</pre>

<p><strong>Responsibilities:</strong></p>
<ul>
  <li>REST API handling</li>
  <li>WebSocket server</li>
  <li>Conversation management</li>
  <li>Message storage</li>
  <li>User management</li>
</ul>

<h3>Database</h3>
<p><strong>Hosted on:</strong> Render Managed PostgreSQL</p>
<p><strong>Database Engine:</strong></p>

<pre>PostgreSQL</pre>

<p><strong>Connection handled using:</strong></p>

<pre>
node-postgres (pg)
pg.Pool connection pooling
DATABASE_URL environment variable
</pre>

<hr>

<h2>Technology Stack</h2>

<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technology</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Frontend</td>
      <td>Angular / TypeScript / HTML / CSS</td>
    </tr>
    <tr>
      <td>Backend</td>
      <td>Node.js / Express.js</td>
    </tr>
    <tr>
      <td>Realtime</td>
      <td>Socket.io</td>
    </tr>
    <tr>
      <td>Database</td>
      <td>PostgreSQL</td>
    </tr>
    <tr>
      <td>Hosting</td>
      <td>Vercel (Frontend), Render (Backend + DB)</td>
    </tr>
    <tr>
      <td>API</td>
      <td>REST API</td>
    </tr>
    <tr>
      <td>Communication</td>
      <td>HTTP + WebSocket</td>
    </tr>
  </tbody>
</table>

<hr>

<h2>Project Folder Structure</h2>

<pre>
cflow-chat/

server/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── conversationController.js
│   ├── messageController.js
│   └── userController.js
│
├── models/
│   ├── Conversation.js
│   ├── Message.js
│   └── User.js
│
├── routes/
│   ├── conversations.js
│   ├── messages.js
│   └── users.js
│
├── socket.js
├── server.js
├── package.json
└── .env

client/
│
├── components/
│   ├── ChatWindow
│   ├── MessageBubble
│   └── MentionDropdown
│
├── services/
│   ├── chat-api.service.ts
│   └── chat-socket.service.ts
│
└── application files

README.md
</pre>

<hr>

<h2>Database Schema</h2>

<h3>conversations</h3>
<p>Stores one conversation per workflow request.</p>

<pre>
id UUID
workflow_id VARCHAR
title TEXT
created_at TIMESTAMP
</pre>

<h3>users</h3>
<p>Stores users participating in chat.</p>

<pre>
id UUID
cflow_id VARCHAR
name TEXT
email TEXT
</pre>

<h3>conversation_participants</h3>
<p>Tracks participants inside a conversation.</p>

<pre>
conversation_id UUID
user_id UUID
</pre>

<h3>messages</h3>
<p>Stores chat message history.</p>

<pre>
id UUID
conversation_id UUID
sender_id UUID
message TEXT
created_at TIMESTAMP
</pre>

<hr>

<h2>API Reference</h2>

<h3>Conversation API</h3>

<p><strong>Get or create workflow conversation</strong></p>
<pre>GET /api/conversations/:workflowId</pre>

<p><strong>Add participant</strong></p>
<pre>POST /api/conversations/:conversationId/participants</pre>

<h3>Message API</h3>

<p><strong>Send message</strong></p>
<pre>POST /api/messages</pre>

<p><strong>Get messages</strong></p>
<pre>GET /api/messages/:conversationId</pre>

<p><strong>Mention notifications</strong></p>
<pre>GET /api/messages/mentions/:userId</pre>

<h3>User API</h3>

<p><strong>User search for mentions</strong></p>
<pre>GET /api/users/search?q=</pre>

<hr>

<h2>WebSocket Events</h2>

<h3>Client → Server</h3>

<table>
  <thead>
    <tr>
      <th>Event</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>join_workflow</td>
      <td>Join workflow chat room</td>
    </tr>
    <tr>
      <td>send_message</td>
      <td>Send message</td>
    </tr>
    <tr>
      <td>typing</td>
      <td>User typing</td>
    </tr>
    <tr>
      <td>stop_typing</td>
      <td>Stop typing</td>
    </tr>
  </tbody>
</table>

<h3>Server → Client</h3>

<table>
  <thead>
    <tr>
      <th>Event</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>receive_message</td>
      <td>New message broadcast</td>
    </tr>
    <tr>
      <td>user_joined</td>
      <td>Participant joined</td>
    </tr>
    <tr>
      <td>user_left</td>
      <td>Participant left</td>
    </tr>
    <tr>
      <td>user_typing</td>
      <td>Typing indicator</td>
    </tr>
    <tr>
      <td>user_stop_typing</td>
      <td>Typing stopped</td>
    </tr>
    <tr>
      <td>error_event</td>
      <td>Error notification</td>
    </tr>
  </tbody>
</table>

<hr>

<h2>Setup Instructions</h2>

<h3>Prerequisites</h3>

<pre>
Node.js 18+
PostgreSQL
npm
</pre>

<h3>Backend Setup</h3>

<pre>
cd server
npm install
npm start
</pre>

<p><strong>Server runs at:</strong></p>
<pre>http://localhost:4000</pre>

<h3>Frontend Setup</h3>

<pre>
cd client
npm install
npm run dev
</pre>

<p><strong>Frontend runs at:</strong></p>
<pre>http://localhost:5173</pre>

<hr>

<h2>Deployment</h2>

<h3>Backend</h3>
<p>Hosted on <strong>Render Web Service</strong></p>
<p>Deployment triggered via Git push.</p>

<h3>Frontend</h3>
<p>Hosted on <strong>Vercel</strong></p>
<p>Automatic deployment through GitHub integration.</p>

<hr>

<h2>Core Features</h2>

<h3>Workflow-Based Conversations</h3>
<p>Each workflow request automatically creates its own chat room.</p>

<h3>Real-Time Messaging</h3>
<p>Socket.io enables instant message delivery between participants.</p>

<h3>User Mentions</h3>
<p>Typing <code>@</code> triggers user search and allows mentioning participants.</p>

<h3>Typing Indicators</h3>
<p>Users can see who is currently typing in the conversation.</p>

<h3>Message Persistence</h3>
<p>All messages are stored permanently in PostgreSQL.</p>

<h3>Participant Management</h3>
<p>Participants are automatically tracked when they join a workflow chat.</p>

<hr>

<h2>System Status</h2>

<p><strong>Frontend</strong></p>
<pre>Running on Vercel</pre>

<p><strong>Backend</strong></p>
<pre>Running on Render Web Service</pre>

<p><strong>Database</strong></p>
<pre>Render PostgreSQL</pre>

<p><strong>Communication</strong></p>
<pre>REST API + WebSocket</pre>

<p>
The system provides a fully functional real-time workflow chat platform integrated with Cflow workflows.
</p>
