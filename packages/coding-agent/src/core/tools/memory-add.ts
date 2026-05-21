import type { AgentTool, AgentToolResult } from "@earendil-works/pi-agent-core";
import { Text } from "@earendil-works/pi-tui";
import { type Static, Type } from "typebox";
import type { Mem0Client } from "@earendil-works/pi-mem0";
import type { Theme } from "../../modes/interactive/theme/theme.ts";
import type { ToolDefinition, ToolRenderContext, ToolRenderResultOptions } from "../extensions/types.ts";
import { wrapToolDefinition } from "./tool-definition-wrapper.ts";

const memoryAddSchema = Type.Object({
	content: Type.String({ description: "Information to remember" }),
	metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: "Optional metadata to attach" })),
});

export type MemoryAddToolInput = Static<typeof memoryAddSchema>;

export interface MemoryAddToolDetails {
	event_id: string;
	status: string;
}

/**
 * Pluggable operations for the memory_add tool.
 */
export interface MemoryAddOperations {
	/** Add a memory */
	addMemory: (content: string, metadata?: Record<string, unknown>) => Promise<{ event_id: string; status: string }>;
}

export interface MemoryAddToolOptions {
	/** Mem0 client instance */
	client: Mem0Client;
	/** User ID to scope memories to */
	userId?: string;
	/** Agent ID to scope memories to */
	agentId?: string;
	/** Run ID to scope memories to */
	runId?: string;
	/** Custom operations for memory */
	operations?: MemoryAddOperations;
}

function createDefaultOperations(client: Mem0Client, options: { userId?: string; agentId?: string; runId?: string }): MemoryAddOperations {
	return {
		addMemory: async (content, metadata) => {
			const result = await client.addMemories({
				messages: [{ role: "user", content }],
				user_id: options.userId,
				agent_id: options.agentId,
				run_id: options.runId,
				metadata,
			});
			return { event_id: result.event_id, status: result.status };
		},
	};
}

export function createMemoryAddToolDefinition(
	cwd: string,
	options: MemoryAddToolOptions,
): ToolDefinition<typeof memoryAddSchema, MemoryAddToolDetails> {
	const operations = options.operations ?? createDefaultOperations(options.client, options);

	return {
		name: "memory_add",
		label: "Add Memory",
		description: "Store information in persistent memory for later recall. Use this to remember facts, preferences, or context about users, projects, or conversations.",
		parameters: memoryAddSchema,
		renderCall(args: MemoryAddToolInput, _theme: Theme, _context: ToolRenderContext) {
			const preview = args.content?.slice(0, 100) ?? "";
			const ellipsis = (args.content?.length ?? 0) > 100 ? "..." : "";
			return new Text(`memory_add: ${preview}${ellipsis}`, 0, 0);
		},
		renderResult(
			result: AgentToolResult<MemoryAddToolDetails>,
			_options: ToolRenderResultOptions,
			_theme: Theme,
			_context: ToolRenderContext,
		) {
			if (!result.details) {
				return new Text("Memory added", 0, 0);
			}
			return new Text(`Memory queued (event_id: ${result.details.event_id}, status: ${result.details.status})`, 0, 0);
		},
		async execute(_toolCallId, args, _signal, _onUpdate, _ctx): Promise<AgentToolResult<MemoryAddToolDetails>> {
			const result = await operations.addMemory(args.content, args.metadata);
			return {
				content: [{ type: "text", text: JSON.stringify({ success: true, event_id: result.event_id, status: result.status }) }],
				details: { event_id: result.event_id, status: result.status },
			};
		},
	};
}

export function createMemoryAddTool(cwd: string, options: MemoryAddToolOptions): AgentTool<typeof memoryAddSchema, MemoryAddToolDetails> {
	return wrapToolDefinition(createMemoryAddToolDefinition(cwd, options));
}
