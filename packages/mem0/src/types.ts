/**
 * Types for Mem0 API
 */

export interface MemoryMessage {
	role: "user" | "assistant";
	content: string;
}

export interface AddMemoryOptions {
	messages: MemoryMessage[];
	user_id?: string;
	agent_id?: string;
	run_id?: string;
	app_id?: string;
	metadata?: Record<string, unknown>;
	infer?: boolean;
	custom_instructions?: string;
}

export interface AddMemoryResponseItem {
	message: string;
	status: "PENDING" | "SUCCEEDED" | "FAILED";
	event_id: string;
}

export type AddMemoryResponse = AddMemoryResponseItem[];

export interface Memory {
	id: string;
	memory: string;
	user_id?: string;
	agent_id?: string;
	run_id?: string;
	app_id?: string;
	metadata?: Record<string, unknown>;
	categories?: string[];
	created_at?: string;
	updated_at?: string;
	score?: number;
}

export interface SearchMemoryOptions {
	query: string;
	filters: MemoryFilters;
	top_k?: number;
	threshold?: number;
	rerank?: boolean;
	reference_date?: string | number;
}

export interface MemoryFilters {
	user_id?: string;
	agent_id?: string;
	run_id?: string;
	app_id?: string;
	AND?: MemoryFilters[];
	OR?: MemoryFilters[];
	NOT?: MemoryFilters;
}

export interface SearchMemoryResponse {
	results: Memory[];
}

export interface GetMemoriesOptions {
	user_id?: string;
	agent_id?: string;
	run_id?: string;
	app_id?: string;
}

export interface GetMemoriesResponse {
	results: Memory[];
}

export interface UpdateMemoryOptions {
	memory_id: string;
	data: {
		memory: string;
		metadata?: Record<string, unknown>;
	};
}

export interface DeleteMemoryOptions {
	memory_id: string;
}

export interface Event {
	event_id: string;
	status: "PENDING" | "SUCCEEDED" | "FAILED";
	event_type: string;
	created_at?: string;
	updated_at?: string;
	data?: Record<string, unknown>;
}

export interface Mem0ClientOptions {
	apiKey: string;
	baseUrl?: string;
}

export class Mem0ApiError extends Error {
	public status: number;
	public response?: unknown;

	constructor(status: number, message: string, response?: unknown) {
		super(message);
		this.status = status;
		this.response = response;
		this.name = "Mem0ApiError";
	}
}
