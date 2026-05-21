import type { AgentTool, AgentToolResult } from "@earendil-works/pi-agent-core";
import { Text } from "@earendil-works/pi-tui";
import { type Static, Type } from "typebox";
import type { Mem0Client, Memory } from "@earendil-works/pi-mem0";
import type { Theme } from "../../modes/interactive/theme/theme.ts";
import type { ToolDefinition, ToolRenderContext, ToolRenderResultOptions } from "../extensions/types.ts";
import { wrapToolDefinition } from "./tool-definition-wrapper.ts";

const memorySearchSchema = Type.Object({
	query: Type.String({ description: "Natural language query to search memories" }),
	top_k: Type.Optional(Type.Number({ description: "Number of results to return (default: 10)" })),
});

export type MemorySearchToolInput = Static<typeof memorySearchSchema>;

export interface MemorySearchToolDetails {
	results: Memory[];
}

/**
 * Pluggable operations for the memory_search tool.
 */
export interface MemorySearchOperations {
	/** Search memories */
	searchMemories: (query: string, topK?: number) => Promise<Memory[]>;
}

export interface MemorySearchToolOptions {
	/** Mem0 client instance */
	client: Mem0Client;
	/** User ID to filter memories by */
	userId?: string;
	/** Agent ID to filter memories by */
	agentId?: string;
	/** Run ID to filter memories by */
	runId?: string;
	/** Custom operations for memory search */
	operations?: MemorySearchOperations;
}

function createDefaultOperations(client: Mem0Client, options: { userId?: string; agentId?: string; runId?: string }): MemorySearchOperations {
	return {
		searchMemories: async (query, topK = 10) => {
			const result = await client.searchMemories({
				query,
				filters: {
					user_id: options.userId,
					agent_id: options.agentId,
					run_id: options.runId,
				},
				top_k: topK,
			});
			return result.results;
		},
	};
}

export function createMemorySearchToolDefinition(
	cwd: string,
	options: MemorySearchToolOptions,
): ToolDefinition<typeof memorySearchSchema, MemorySearchToolDetails> {
	const operations = options.operations ?? createDefaultOperations(options.client, options);

	return {
		name: "memory_search",
		label: "Search Memories",
		description: "Search persistent memories using natural language. Returns relevant memories ranked by relevance. Use this to recall facts, preferences, or past context.",
		parameters: memorySearchSchema,
		renderCall(args: MemorySearchToolInput, _theme: Theme, _context: ToolRenderContext) {
			return new Text(`memory_search: "${args.query}"`, 0, 0);
		},
		renderResult(
			result: AgentToolResult<MemorySearchToolDetails>,
			_options: ToolRenderResultOptions,
			_theme: Theme,
			_context: ToolRenderContext,
		) {
			if (!result.details || result.details.results.length === 0) {
				return new Text("No memories found", 0, 0);
			}
			
			const lines = result.details.results.map((mem, i) => {
				const score = mem.score !== undefined ? ` (${mem.score.toFixed(2)})` : "";
				return `${i + 1}. ${mem.memory}${score}`;
			});
			
			return new Text(lines.join("\n"), 0, 0);
		},
		async execute(_toolCallId, args, _signal, _onUpdate, _ctx): Promise<AgentToolResult<MemorySearchToolDetails>> {
			const results = await operations.searchMemories(args.query, args.top_k);
			return {
				content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
				details: { results },
			};
		},
	};
}

export function createMemorySearchTool(cwd: string, options: MemorySearchToolOptions): AgentTool<typeof memorySearchSchema, MemorySearchToolDetails> {
	return wrapToolDefinition(createMemorySearchToolDefinition(cwd, options));
}
