import { useState } from "react";
import ChatWindow from "./components/ChatWindow";

/**
 * Demo wrapper for local development.
 * In production, currentUser and workflowId come from the Cflow host page
 * via props, postMessage, or URL params.
 */

const DEMO_USERS = [
  { id: "a1b2c3d4-0001-4000-8000-000000000001", cflow_id: "cflow_1001", name: "Arjun Mehta",  email: "arjun@cflow.dev" },
  { id: "a1b2c3d4-0002-4000-8000-000000000002", cflow_id: "cflow_1002", name: "Priya Sharma", email: "priya@cflow.dev" },
  { id: "a1b2c3d4-0003-4000-8000-000000000003", cflow_id: "cflow_1003", name: "Ravi Kumar",   email: "ravi@cflow.dev" },
];

export default function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [workflowId, setWorkflowId]     = useState("1023");

  if (!selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-cflow-600 to-cflow-700">
            <h1 className="text-lg font-semibold text-white">Cflow Chat</h1>
            <p className="text-xs text-white/60 mt-0.5">Select a user to join the workflow conversation</p>
          </div>

          {/* Workflow selector */}
          <div className="px-6 pt-5">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Workflow Request ID
            </label>
            <input
              type="text"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cflow-400 focus:ring-2 focus:ring-cflow-100"
            />
          </div>

          {/* User list */}
          <div className="px-6 pt-5 pb-6">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Sign in as
            </label>
            <div className="space-y-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-cflow-300 hover:bg-cflow-50 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-cflow-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-800">{selectedUser.name}</span>
          <span className="text-gray-300">·</span>
          <span>Workflow #{workflowId}</span>
        </div>
        <button
          onClick={() => setSelectedUser(null)}
          className="text-xs text-cflow-600 hover:text-cflow-700 font-medium"
        >
          Switch user
        </button>
      </div>

      {/* Chat panel */}
      <div className="flex-1 p-4 overflow-hidden">
        <ChatWindow
          key={`${workflowId}-${selectedUser.id}`}
          workflowId={workflowId}
          currentUser={selectedUser}
        />
      </div>
    </div>
  );
}
