# @earendil-works/pi-mem0

Mem0 API client for persistent memory management in AI agents.

## Installation

```bash
npm install @earendil-works/pi-mem0
```

## Usage

```typescript
import { createMem0Client } from "@earendil-works/pi-mem0";

const client = createMem0Client({
  apiKey: process.env.MEM0_API_KEY!,
});

// Add memories from a conversation
const result = await client.addMemories({
  messages: [
    { role: "user", content: "I just moved to San Francisco." },
    { role: "assistant", content: "Got it, I'll remember that." },
  ],
  user_id: "alice",
});

// Wait for async processing to complete
const memories = await client.addMemoriesAndWait({
  messages: [
    { role: "user", content: "I prefer dark mode." },
  ],
  user_id: "alice",
});

// Search memories
const searchResults = await client.searchMemories({
  query: "Where does the user live?",
  filters: { user_id: "alice" },
  top_k: 10,
});

// Get all memories for a user
const allMemories = await client.getMemories({
  user_id: "alice",
});

// Update a memory
const updated = await client.updateMemory({
  memory_id: "memory-id",
  data: {
    memory: "User lives in San Francisco, CA",
  },
});

// Delete a memory
await client.deleteMemory({ memory_id: "memory-id" });
```

## Configuration

Set the `MEM0_API_KEY` environment variable with your API key from [app.mem0.ai](https://app.mem0.ai).

You can also specify a custom base URL:

```typescript
const client = createMem0Client({
  apiKey: "your-api-key",
  baseUrl: "http://localhost:8080/v3", // For self-hosted instances
});
```

## API Reference

### `createMem0Client(options)`

Creates a new Mem0 client instance.

### `client.addMemories(options)`

Adds memories from conversation messages. Returns an event ID for async tracking.

### `client.addMemoriesAndWait(options, timeout?)`

Adds memories and waits for processing to complete.

### `client.searchMemories(options)`

Searches memories with semantic and keyword matching.

### `client.getMemories(options)`

Gets all memories for an entity (user, agent, app, or run).

### `client.getMemory(memoryId)`

Gets a specific memory by ID.

### `client.updateMemory(options)`

Updates a specific memory.

### `client.deleteMemory(options)`

Deletes a specific memory.

### `client.getEvent(eventId)`

Gets the status of an async operation.

### `client.waitForEvent(eventId, options?)`

Waits for an async operation to complete.

## License

MIT
