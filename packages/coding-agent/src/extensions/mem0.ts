/**
 * Mem0 Memory Extension
 *
 * Provides persistent memory capabilities via Mem0 API.
 * Activates only when MEM0_API_KEY environment variable is set.
 *
 * Configuration:
 * - MEM0_API_KEY: API key for Mem0 (required)
 * - MEM0_BASE_URL: Base URL for self-hosted Mem0 (optional)
 * - MEM0_USER_ID: User ID to scope memories (optional)
 * - MEM0_AGENT_ID: Agent ID to scope memories (optional)
 */

import type { ExtensionFactory } from "../core/extensions/types.ts";
import { getMem0Config, isMem0Configured } from "../core/mem0-config.ts";
import {
	createMemoryAddToolDefinition,
	createMemoryGetAllToolDefinition,
	createMemorySearchToolDefinition,
} from "../core/tools/index.ts";

/**
 * Create a Mem0 memory extension factory for a specific cwd.
 *
 * Registers memory tools (memory_add, memory_search, memory_get_all)
 * only when Mem0 API is configured via environment variables.
 */
export function createMem0Extension(cwd: string): ExtensionFactory {
	return (pi) => {
		// Check if Mem0 is configured
		if (!isMem0Configured()) {
			// Mem0 not configured, skip registration
			return;
		}

		// Get Mem0 configuration
		const config = getMem0Config({
			userId: process.env.MEM0_USER_ID,
			agentId: process.env.MEM0_AGENT_ID,
		});

		if (!config.client) {
			return;
		}

		// Register memory tools
		pi.registerTool(
			createMemoryAddToolDefinition(cwd, {
				client: config.client,
				userId: config.scope.userId,
				agentId: config.scope.agentId,
			}),
		);

		pi.registerTool(
			createMemorySearchToolDefinition(cwd, {
				client: config.client,
				userId: config.scope.userId,
				agentId: config.scope.agentId,
			}),
		);

		pi.registerTool(
			createMemoryGetAllToolDefinition(cwd, {
				client: config.client,
				userId: config.scope.userId,
				agentId: config.scope.agentId,
			}),
		);

		// Log activation
		console.log("[mem0] Memory tools enabled (MEM0_API_KEY detected)");
	};
}

export default createMem0Extension;
