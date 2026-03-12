<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cflow Workflow Chat System</title>
  <style>
    :root{
      --bg:#f6f8fc;
      --card:#ffffff;
      --text:#172033;
      --muted:#5f6b85;
      --line:#e7ebf3;
      --primary:#2f6fed;
      --primary-soft:#eef4ff;
      --code:#0f172a;
      --shadow:0 10px 30px rgba(15,23,42,.06);
      --radius:18px;
    }

    *{box-sizing:border-box}
    body{
      margin:0;
      font-family:Inter,Segoe UI,Arial,sans-serif;
      background:var(--bg);
      color:var(--text);
      line-height:1.65;
    }

    .wrap{
      max-width:1100px;
      margin:0 auto;
      padding:40px 20px 70px;
    }

    .hero{
      background:linear-gradient(135deg,#1f56d8,#3a7bff);
      color:#fff;
      border-radius:24px;
      padding:38px 34px;
      box-shadow:var(--shadow);
      margin-bottom:28px;
    }

    .hero h1{
      margin:0 0 12px;
      font-size:clamp(28px,4vw,44px);
      line-height:1.15;
      letter-spacing:-0.03em;
    }

    .hero p{
      margin:0;
      max-width:820px;
      color:rgba(255,255,255,.9);
      font-size:16px;
    }

    .section{
      background:var(--card);
      border:1px solid var(--line);
      border-radius:var(--radius);
      padding:28px;
      margin-bottom:22px;
      box-shadow:var(--shadow);
    }

    .section h2{
      margin:0 0 18px;
      font-size:26px;
      letter-spacing:-0.02em;
    }

    .section h3{
      margin:22px 0 10px;
      font-size:19px;
      letter-spacing:-0.01em;
    }

    .section p{
      margin:0 0 12px;
      color:var(--muted);
    }

    .meta{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
      gap:16px;
    }

    .meta-card{
      border:1px solid var(--line);
      border-radius:16px;
      padding:18px;
      background:#fff;
    }

    .meta-card h4{
      margin:0 0 10px;
      font-size:16px;
      color:var(--text);
    }

    .label{
      font-weight:700;
      color:var(--text);
    }

    ul{
      margin:10px 0 0 20px;
      padding:0;
      color:var(--muted);
    }

    li{margin:6px 0}

    .codebox{
      background:var(--code);
      color:#e5edf9;
      border-radius:14px;
      padding:16px 18px;
      overflow:auto;
      font-family:Consolas,Monaco,monospace;
      font-size:14px;
      line-height:1.6;
      margin:12px 0 0;
      white-space:pre-wrap;
      word-break:break-word;
    }

    .pill-row{
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      margin-top:10px;
    }

    .pill{
      padding:8px 12px;
      border-radius:999px;
      background:var(--primary-soft);
      color:var(--primary);
      font-weight:600;
      font-size:13px;
      border:1px solid #d9e6ff;
    }

    .grid-2{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
      gap:18px;
    }

    .subcard{
      border:1px solid var(--line);
      border-radius:16px;
      padding:18px;
      background:#fff;
    }

    .subcard h4{
      margin:0 0 10px;
      font-size:17px;
    }

    .divider{
      height:1px;
      background:var(--line);
      margin:22px 0;
    }

    .foot{
      text-align:center;
      color:var(--muted);
      font-size:14px;
      margin-top:10px;
    }

    @media (max-width:640px){
      .wrap{padding:22px 14px 50px}
      .hero,.section{padding:22px}
    }
  </style>
</head>
<body>
  <div class="wrap">

    <section class="hero">
      <h1>Cflow Workflow Chat System</h1>
      <p>
        A lightweight real-time workflow chat platform designed to integrate directly inside Cflow workflow request pages.
        The system enables workflow participants to communicate, discuss approvals, and collaborate without leaving the workflow interface.
        It supports Direct Messages, Group Chats, and Workflow Conversations with persistent message storage and real-time communication.
      </p>
    </section>

    <section class="section">
      <h2>Deployment Infrastructure</h2>

      <div class="meta">
        <div class="meta-card">
          <h4>Frontend</h4>
          <p><span class="label">Hosting Platform:</span> Vercel</p>
          <p><span class="label">Technology Stack:</span></p>
          <div class="pill-row">
            <span class="pill">Angular</span>
            <span class="pill">TypeScript</span>
            <span class="pill">HTML</span>
            <span class="pill">CSS</span>
            <span class="pill">Socket.io Client</span>
            <span class="pill">REST API Integration</span>
          </div>
          <p style="margin-top:14px;"><span class="label">Frontend URL:</span></p>
          <div class="codebox">https://rahul-green.vercel.app</div>
          <p style="margin-top:14px;"><span class="label">Responsibilities:</span></p>
          <ul>
            <li>Chat interface rendering</li>
            <li>Conversation sidebar management</li>
            <li>Direct and group chat creation</li>
            <li>Real-time message updates</li>
            <li>Presence indicators</li>
            <li>Unread message badges</li>
          </ul>
        </div>

        <div class="meta-card">
          <h4>Backend</h4>
          <p><span class="label">Hosting Platform:</span> Render Web Service</p>
          <p><span class="label">Technology Stack:</span></p>
          <div class="pill-row">
            <span class="pill">Node.js</span>
            <span class="pill">Express.js</span>
            <span class="pill">Socket.io</span>
            <span class="pill">node-postgres (pg)</span>
            <span class="pill">dotenv</span>
            <span class="pill">cors</span>
          </div>
          <p style="margin-top:14px;"><span class="label">Backend API:</span></p>
          <div class="codebox">https://cflow-chat-server.onrender.com</div>
          <p style="margin-top:14px;"><span class="label">Responsibilities:</span></p>
          <ul>
            <li>REST API endpoints</li>
            <li>WebSocket event handling</li>
            <li>Message persistence</li>
            <li>Conversation participant management</li>
            <li>User presence tracking</li>
            <li>Real-time messaging</li>
          </ul>
        </div>

        <div class="meta-card">
          <h4>Database</h4>
          <p><span class="label">Provider:</span> Render PostgreSQL</p>
          <p><span class="label">Database Engine:</span></p>
          <div class="codebox">PostgreSQL</div>
          <p style="margin-top:14px;"><span class="label">Connection Method:</span></p>
          <div class="codebox">DATABASE_URL
pg.Pool connection pooling</div>
          <p style="margin-top:14px;"><span class="label">Responsibilities:</span></p>
          <ul>
            <li>Store users</li>
            <li>Store conversations</li>
            <li>Store messages</li>
            <li>Track conversation participants</li>
            <li>Maintain unread counts</li>
            <li>Track user presence</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Repository</h2>
      <p><span class="label">GitHub Repository</span></p>
      <div class="codebox">https://github.com/krishnarahul-dev/Rahul</div>

      <p style="margin-top:16px;"><span class="label">Detailed Documentation</span></p>
      <div class="codebox">https://github.com/krishnarahul-dev/Rahul/blob/main/README.md</div>

      <p style="margin-top:16px;"><span class="label">Contains:</span></p>
      <ul>
        <li>Upgrade instructions</li>
        <li>System architecture</li>
        <li>API reference</li>
        <li>Deployment guide</li>
        <li>Folder structure</li>
      </ul>
    </section>

    <section class="section">
      <h2>System Architecture</h2>
      <div class="codebox">Browser (Angular Frontend)
        │
        │ REST API + WebSocket
        ▼
Node.js / Express Backend (Render)
        │
        │ PostgreSQL Driver (pg)
        ▼
PostgreSQL Database (Render)</div>
    </section>

    <section class="section">
      <h2>Core Features</h2>

      <h3>Workflow Conversations</h3>
      <p>Each workflow request automatically creates a dedicated conversation where workflow participants can discuss approvals and decisions.</p>

      <h3>Direct Messaging</h3>
      <p>Users can start private one-to-one conversations independent of workflow requests.</p>

      <h3>Group Chats</h3>
      <p>Multiple users can collaborate in shared chat groups.</p>

      <h3>Real-Time Messaging</h3>
      <p>Socket.io enables real-time message delivery between participants.</p>

      <h3>Persistent Message Storage</h3>
      <p>All messages are stored in PostgreSQL so chat history remains available even after page refresh.</p>

      <h3>User Mentions</h3>
      <p>Users can mention other participants using:</p>
      <div class="codebox">@username</div>
      <p>Mention suggestions appear in the UI.</p>

      <h3>Typing Indicators</h3>
      <p>Participants can see when another user is typing.</p>

      <h3>Presence Indicators</h3>
      <p>User status is tracked and displayed as:</p>
      <div class="codebox">Online
Away
Offline</div>

      <h3>Unread Message Counters</h3>
      <p>Each conversation shows unread message badges to notify users about new messages.</p>
    </section>

    <section class="section">
      <h2>Frontend Architecture</h2>

      <div class="grid-2">
        <div class="subcard">
          <h4>Main Layout</h4>
          <div class="codebox">ChatLayoutComponent</div>
          <ul>
            <li>Sidebar conversation list</li>
            <li>Chat panel rendering</li>
            <li>Dialog windows for new chats and groups</li>
          </ul>
        </div>

        <div class="subcard">
          <h4>Conversation Sidebar</h4>
          <div class="codebox">ConversationListComponent
ConversationItemComponent</div>
          <ul>
            <li>Direct messages</li>
            <li>Group chats</li>
            <li>Workflow chats</li>
            <li>Last message preview</li>
            <li>Unread badge</li>
            <li>Online status</li>
          </ul>
        </div>

        <div class="subcard">
          <h4>Chat Window</h4>
          <div class="codebox">ChatPanelComponent
ChatWindowComponent
MessageBubbleComponent
MentionDropdownComponent</div>
          <ul>
            <li>Display message history</li>
            <li>Real-time message updates</li>
            <li>Mention dropdown suggestions</li>
            <li>Typing indicators</li>
          </ul>
        </div>

        <div class="subcard">
          <h4>Dialog Components</h4>
          <div class="codebox">NewChatDialogComponent
GroupCreateDialogComponent</div>
          <ul>
            <li>Create new direct messages</li>
            <li>Create group conversations</li>
            <li>Add members</li>
          </ul>
        </div>
      </div>

      <div class="divider"></div>

      <h3>Frontend Services</h3>
      <div class="codebox">chat-api.service.ts
chat-socket.service.ts
avatar.util.ts</div>
      <ul>
        <li><strong>API Service:</strong> Fetch conversations, create direct messages, create group chats, mark messages as read, retrieve unread counts</li>
        <li><strong>Socket Service:</strong> Authenticate socket connection, join conversation rooms, listen for new messages, broadcast typing events</li>
        <li><strong>Utility Service:</strong> Generate user initials, manage avatar colors</li>
      </ul>
    </section>

    <section class="section">
      <h2>Backend Architecture</h2>

      <h3>Core Models</h3>
      <div class="codebox">User.js
Conversation.js
Message.js</div>
      <ul>
        <li><strong>User Model:</strong> name, email, presence status, last seen timestamp</li>
        <li><strong>Conversation Model:</strong> conversation type, workflow association, conversation name, participant relationships</li>
        <li><strong>Message Model:</strong> sender, message content, timestamp, conversation reference</li>
      </ul>

      <h3>Controllers</h3>
      <div class="codebox">conversationController.js
messageController.js
userController.js</div>
      <ul>
        <li><strong>Conversation Controller:</strong> List conversations, create direct chats, create group chats, mark conversations as read</li>
        <li><strong>Message Controller:</strong> Send messages, retrieve conversation history</li>
        <li><strong>User Controller:</strong> Retrieve user list, track presence</li>
      </ul>
    </section>

    <section class="section">
      <h2>API Endpoints</h2>

      <h3>Conversation APIs (v2)</h3>
      <div class="codebox">GET  /api/conversations/v2/list
GET  /api/conversations/v2/unread
POST /api/conversations/v2/direct
POST /api/conversations/v2/group
GET  /api/conversations/v2/:id
POST /api/conversations/v2/:id/read</div>

      <h3>User API</h3>
      <div class="codebox">GET /api/users</div>
      <p>Returns all system users for chat participants.</p>

      <h3>Legacy APIs (v1 Compatibility)</h3>
      <div class="codebox">GET  /api/conversations/:workflowId
POST /api/conversations/:id/participants</div>
      <p>These endpoints remain active to maintain compatibility with v1 workflow chat.</p>
    </section>

    <section class="section">
      <h2>Version Evolution</h2>

      <div class="grid-2">
        <div class="subcard">
          <h4>Version 1</h4>
          <p><strong>Capabilities</strong></p>
          <ul>
            <li>Workflow-based conversations</li>
            <li>Real-time messaging</li>
            <li>Socket rooms based on workflow ID</li>
            <li>Basic Angular chat window</li>
          </ul>
          <p><strong>Limitations</strong></p>
          <ul>
            <li>No direct messages</li>
            <li>No group chats</li>
            <li>No presence indicators</li>
            <li>No unread message tracking</li>
          </ul>
        </div>

        <div class="subcard">
          <h4>Version 2</h4>
          <p><strong>Enhancements</strong></p>
          <ul>
            <li>Unified chat system</li>
            <li>Direct messages</li>
            <li>Group conversations</li>
            <li>User presence tracking</li>
            <li>Unread message counters</li>
            <li>Modular Angular architecture</li>
            <li>Expanded database schema</li>
            <li>Backward compatibility with v1 APIs</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Folder Structure</h2>
      <div class="codebox">client-angular
 ├── src/app
 │   ├── chat
 │   │   ├── components
 │   │   ├── services
 │   │   ├── models
 │   │   └── utilities

server
 ├── controllers
 ├── models
 ├── routes
 ├── socket.js
 └── server.js

sql
 └── migration-v2.sql</div>
    </section>

    <section class="section">
      <h2>Core Capability Summary</h2>
      <ul>
        <li>Workflow-based chat conversations</li>
        <li>Direct user messaging</li>
        <li>Group collaboration chats</li>
        <li>Real-time communication via WebSocket</li>
        <li>Persistent chat history</li>
        <li>User presence indicators</li>
        <li>Typing indicators</li>
        <li>Mention support</li>
        <li>Unread message tracking</li>
        <li>Fully integrated workflow communication system</li>
      </ul>
    </section>

    <div class="foot">Cflow Workflow Chat System Documentation</div>
  </div>
</body>
</html>
