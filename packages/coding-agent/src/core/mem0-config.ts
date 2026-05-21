import { createMem0Client, type Mem0Client, type Mem0ClientOptions } from "@earendil-works/pi-mem0";

/**
 * Environment variable for Mem0 API key
 */
export const MEM0_API_KEY_ENV = "MEM0_API_KEY";

/**
 * Environment variable for Mem0 base URL (optional, for self-hosted)
 */
export const MEM0_BASE_URL_ENV = "MEM0_BASE_URL";

/**
 * Check if Mem0 is configured
 */
export function isMem0Configured(): boolean {
	return !!process.env[MEM0_API_KEY_ENV];
}

/**
 * Get Mem0 API key from environment
 */
export function getMem0ApiKey(): string | undefined {
	return process.env[MEM0_API_KEY_ENV];
}

/**
 * Get Mem0 base URL from environment (for self-hosted instances)
 */
export function getMem0BaseUrl(): string | undefined {
	return process.env[MEM0_BASE_URL_ENV];
}

/**
 * Configuration for Mem0 memory scope
 */
export interface Mem0ScopeConfig {
	/** User ID to scope memories to */
	userId?: string;
	/** Agent ID to scope memories to */
	agentId?: string;
	/** Run ID to scope memories to */
	runId?: string;
	/** App ID to scope memories to */
	appId?: string;
}

/**
 * Create a Mem0 client from environment variables
 */
export function createMem0ClientFromEnv(): Mem0Client | undefined {
	const apiKey = getMem0ApiKey();
	if (!apiKey) {
		return undefined;
	}

	const options: Mem0ClientOptions = {
		apiKey,
	};

	const baseUrl = getMem0BaseUrl();
	if (baseUrl) {
		options.baseUrl = baseUrl;
	}

	return createMem0Client(options);
}

/**
 * Mem0 configuration for the coding agent
 */
export interface Mem0Config {
	/** Whether Mem0 is enabled */
	enabled: boolean;
	/** Mem0 client instance */
	client?: Mem0Client;
	/** Scope configuration for memories */
	scope: Mem0ScopeConfig;
}

/**
 * Get Mem0 configuration from environment and options
 */
export function getMem0Config(scope?: Mem0ScopeConfig): Mem0Config {
	const client = createMem0ClientFromEnv();
	return {
		enabled: !!client,
		client,
		scope: scope ?? {},
	};
}
