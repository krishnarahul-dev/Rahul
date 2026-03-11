const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Fetch (or create) the conversation for a workflow. */
export function getConversation(workflowId) {
  return request(`/conversations/${workflowId}`);
}

/** Fetch messages for a conversation. */
export function getMessages(conversationId, { limit, offset } = {}) {
  const params = new URLSearchParams();
  if (limit)  params.set("limit", limit);
  if (offset) params.set("offset", offset);
  const qs = params.toString();
  return request(`/messages/${conversationId}${qs ? `?${qs}` : ""}`);
}

/** Send a message via REST (fallback when WS is unavailable). */
export function sendMessage({ conversation_id, sender_id, message }) {
  return request("/messages", {
    method: "POST",
    body: JSON.stringify({ conversation_id, sender_id, message }),
  });
}

/** Search users for @mention autocomplete. */
export function searchUsers(query) {
  return request(`/users/search?q=${encodeURIComponent(query)}`);
}
