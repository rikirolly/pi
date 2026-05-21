import type { AgentTool, AgentToolResult } from "@earendil-works/pi-agent-core";
import { Text } from "@earendil-works/pi-tui";
import { type Static, Type } from "typebox";
import type { Mem0Client, Memory } from "@earendil-works/pi-mem0";
import type { Theme } from "../../modes/interactive/theme/theme.ts";
import type { ToolDefinition, ToolRenderContext, ToolRenderResultOptions } from "../extensions/types.ts";
import { wrapToolDefinition } from "./tool-definition-wrapper.ts";

const memoryGetAllSchema = Type.Object({});

export type MemoryGetAllToolInput = Static<typeof memoryGetAllSchema>;

export interface MemoryGetAllToolDetails {
	results: Memory[];
	count: number;
}

/**
 * Pluggable operations for the memory_get_all tool.
 */
export interface MemoryGetAllOperations {
	/** Get all memories */
	getAllMemories: () => Promise<Memory[]>;
}

export interface MemoryGetAllToolOptions {
	/** Mem0 client instance */
	client: Mem0Client;
	/** User ID to filter memories by */
	userId?: string;
	/** Agent ID to filter memories by */
	agentId?: string;
	/** Run ID to filter memories by */
	runId?: string;
	/** Custom operations for memory retrieval */
	operations?: MemoryGetAllOperations;
}

function createDefaultOperations(client: Mem0Client, options: { userId?: string; agentId?: string; runId?: string }): MemoryGetAllOperations {
	return {
		getAllMemories: async () => {
			const result = await client.getMemories({
				user_id: options.userId,
				agent_id: options.agentId,
				run_id: options.runId,
			});
			return result.results;
		},
	};
}

export function createMemoryGetAllToolDefinition(
	cwd: string,
	options: MemoryGetAllToolOptions,
): ToolDefinition<typeof memoryGetAllSchema, MemoryGetAllToolDetails> {
	const operations = options.operations ?? createDefaultOperations(options.client, options);

	return {
		name: "memory_get_all",
		label: "Get All Memories",
		description: "Retrieve all stored memories for the current context. Use this to review everything that has been remembered about a user, project, or session.",
		parameters: memoryGetAllSchema,
		renderCall(_args: MemoryGetAllToolInput, _theme: Theme, _context: ToolRenderContext) {
			return new Text("memory_get_all: retrieving all memories", 0, 0);
		},
		renderResult(
			result: AgentToolResult<MemoryGetAllToolDetails>,
			_options: ToolRenderResultOptions,
			_theme: Theme,
			_context: ToolRenderContext,
		) {
			if (!result.details || result.details.results.length === 0) {
				return new Text("No memories stored", 0, 0);
			}
			
			const lines = result.details.results.map((mem, i) => `${i + 1}. ${mem.memory}`);
			return new Text(`Found ${result.details.count} memories:\n${lines.join("\n")}`, 0, 0);
		},
		async execute(_toolCallId, _args, _signal, _onUpdate, _ctx): Promise<AgentToolResult<MemoryGetAllToolDetails>> {
			const results = await operations.getAllMemories();
			return {
				content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
				details: { results, count: results.length },
			};
		},
	};
}

export function createMemoryGetAllTool(cwd: string, options: MemoryGetAllToolOptions): AgentTool<typeof memoryGetAllSchema, MemoryGetAllToolDetails> {
	return wrapToolDefinition(createMemoryGetAllToolDefinition(cwd, options));
}
