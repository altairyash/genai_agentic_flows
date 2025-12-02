// Step 1: Define tools and model
import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

const model = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

// Tools
const add = tool(({ a, b }) => a + b, {
  name: "add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

const multiply = tool(({ a, b }) => a * b, {
  name: "multiply",
  description: "Multiply two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

const divide = tool(({ a, b }) => a / b, {
  name: "divide",
  description: "Divide two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

// Bind tools to model
const toolsByName = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
};

const tools = Object.values(toolsByName);
const modelWithTools = model.bindTools(tools);

// Step 2: Define state

import { StateGraph, START, END } from "@langchain/langgraph";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";

import {
  BaseMessage,
  SystemMessage,
  HumanMessage,
  isAIMessage,
  ToolMessage,
} from "@langchain/core/messages";

// JS can't use generics, so we use z.any()
const MessagesState = z.object({
  messages: z.array(z.any()).register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
});

// Step 3: LLM Node

async function llmCall(state) {
  return {
    messages: await modelWithTools.invoke([
      new SystemMessage(
        "You are a helpful assistant performing arithmetic using provided tools."
      ),
      ...state.messages,
    ]),
    llmCalls: (state.llmCalls ?? 0) + 1,
  };
}

// Step 4: Tool Node

async function toolNode(state) {
  const lastMessage = state.messages.at(-1);

  if (!lastMessage || !isAIMessage(lastMessage)) {
    return { messages: [] };
  }

  const result = [];

  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name];
    const observation = await tool.invoke(toolCall);
    result.push(observation);
  }

  return { messages: result };
}

// Step 5: Conditional logic

async function shouldContinue(state) {
  const lastMessage = state.messages.at(-1);

  if (!lastMessage || !isAIMessage(lastMessage)) return END;

  if (lastMessage.tool_calls?.length) {
    return "toolNode";
  }

  return END;
}

// Step 6: Build Agent Graph

const agent = new StateGraph(MessagesState)
  .addNode("llmCall", llmCall)
  .addNode("toolNode", toolNode)
  .addEdge(START, "llmCall")
  .addConditionalEdges("llmCall", shouldContinue, ["toolNode", END])
  .addEdge("toolNode", "llmCall")
  .compile();

// Step 7: Invoke

const result = await agent.invoke({
  messages: [new HumanMessage("Add 3 and 4, then multiply by 2.")],
});

// Print final output

for (const message of result.messages) {
  console.log(`[${message.getType()}]: ${message.text}`);
}
