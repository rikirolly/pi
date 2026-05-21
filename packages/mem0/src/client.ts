import type {
	AddMemoryOptions,
	AddMemoryResponse,
	DeleteMemoryOptions,
	Event,
	GetMemoriesOptions,
	GetMemoriesResponse,
	Mem0ApiError,
	Mem0ClientOptions,
	Memory,
	SearchMemoryOptions,
	SearchMemoryResponse,
	UpdateMemoryOptions,
} from "./types.js";

export { Mem0ApiError } from "./types.js";
export type {
	AddMemoryOptions,
	AddMemoryResponse,
	DeleteMemoryOptions,
	Event,
	GetMemoriesOptions,
	GetMemoriesResponse,
	Mem0ClientOptions,
	Memory,
	MemoryFilters,
	MemoryMessage,
	SearchMemoryOptions,
	SearchMemoryResponse,
	UpdateMemoryOptions,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.mem0.ai/v3";

/**
 * Mem0 API client for managing persistent memories
 */
export class Mem0Client {
	private readonly apiKey: string;
	private readonly baseUrl: string;

	constructor(options: Mem0ClientOptions) {
		this.apiKey = options.apiKey;
		this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
	}

	/**
	 * Add memories from conversation messages
	 */
	async addMemories(options: AddMemoryOptions): Promise<AddMemoryResponse> {
		return this.request<AddMemoryResponse>("POST", "/memories/add/", options);
	}

	/**
	 * Search memories with semantic and keyword matching
	 */
	async searchMemories(options: SearchMemoryOptions): Promise<SearchMemoryResponse> {
		return this.request<SearchMemoryResponse>("POST", "/memories/search/", options);
	}

	/**
	 * Get all memories for an entity
	 */
	async getMemories(options: GetMemoriesOptions): Promise<GetMemoriesResponse> {
		return this.request<GetMemoriesResponse>("POST", "/memories/", options);
	}

	/**
	 * Get a specific memory by ID
	 */
	async getMemory(memoryId: string): Promise<Memory> {
		return this.request<Memory>("GET", `/memories/${memoryId}/`);
	}

	/**
	 * Update a specific memory
	 */
	async updateMemory(options: UpdateMemoryOptions): Promise<Memory> {
		return this.request<Memory>("PUT", `/memories/${options.memory_id}/`, options.data);
	}

	/**
	 * Delete a specific memory
	 */
	async deleteMemory(options: DeleteMemoryOptions): Promise<void> {
		await this.request<void>("DELETE", `/memories/${options.memory_id}/`);
	}

	/**
	 * Get event status for async operations
	 */
	async getEvent(eventId: string): Promise<Event> {
		return this.request<Event>("GET", `/events/${eventId}/`);
	}

	/**
	 * Wait for an async operation to complete
	 */
	async waitForEvent(
		eventId: string,
		options?: { timeout?: number; interval?: number },
	): Promise<Event> {
		const timeout = options?.timeout ?? 30000;
		const interval = options?.interval ?? 1000;
		const startTime = Date.now();

		while (Date.now() - startTime < timeout) {
			const event = await this.getEvent(eventId);
			if (event.status === "SUCCEEDED" || event.status === "FAILED") {
				return event;
			}
			await new Promise((resolve) => setTimeout(resolve, interval));
		}

		throw new Error(`Event ${eventId} did not complete within ${timeout}ms`);
	}

	/**
	 * Add memories and wait for completion
	 */
	async addMemoriesAndWait(options: AddMemoryOptions, timeout?: number): Promise<Memory[]> {
		const response = await this.addMemories(options);
		const event = await this.waitForEvent(response.event_id, { timeout });
		
		if (event.status === "FAILED") {
			throw new Error(`Memory addition failed: ${JSON.stringify(event.data)}`);
		}

		// Get the created memories
		const entityFilter: GetMemoriesOptions = {};
		if (options.user_id) entityFilter.user_id = options.user_id;
		if (options.agent_id) entityFilter.agent_id = options.agent_id;
		if (options.run_id) entityFilter.run_id = options.run_id;
		if (options.app_id) entityFilter.app_id = options.app_id;

		return (await this.getMemories(entityFilter)).results;
	}

	private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const headers: Record<string, string> = {
			Authorization: `Token ${this.apiKey}`,
			"Content-Type": "application/json",
		};

		const response = await fetch(url, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			let errorBody: unknown;
			try {
				errorBody = await response.json();
			} catch {
				errorBody = await response.text();
			}
			throw new (await import("./types.js")).Mem0ApiError(
				response.status,
				`Mem0 API error: ${response.statusText}`,
				errorBody,
			);
		}

		if (response.status === 204) {
			return undefined as T;
		}

		return response.json() as Promise<T>;
	}
}

/**
 * Create a Mem0 client instance
 */
export function createMem0Client(options: Mem0ClientOptions): Mem0Client {
	return new Mem0Client(options);
}
