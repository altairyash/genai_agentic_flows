import "dotenv/config";
import express from "express";
import cors from "cors";
import { createAgent, tool, SystemMessage } from "langchain";
import * as z from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearch } from "@langchain/tavily";

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const llm = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
});

const mem = new MemorySaver();

const getWeather = tool(
  (input) => `It's always sunny in ${input.city}!`,
  {
    name: "get_weather",
    schema: z.object({
      city: z.string(),
    }),
  }
);

const tavilySearch = tool(
  async (input) => {
    const tavily = new TavilySearch({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 5,
    });
    return await tavily.invoke({ query: input.query });
  },
  {
    name: "search",
    description: "Search the web using Tavily API",
    schema: z.object({
      query: z.string(),
    }),
  }
);

const agent = createAgent({
  model: llm,
  tools: [getWeather, tavilySearch],
  checkpointer: mem,
  prompt: (state, config) => [
    new SystemMessage(
      `You are a helpful assistant. Address the user as ${config.context?.userName || "User"}.`
    ),
    ...state.messages,
  ],
});

app.post("/agent", async (req, res) => {
  try {
    const { messages, threadId = "default", userName = "User" } = req.body;
    if (!messages) return res.status(400).json({ error: "Messages missing" });

    const result = await agent.invoke(
      { messages },
      { configurable: { thread_id: threadId }, context: { userName } }
    );


    // Directly take the last AIMessage
    const lastMessage = result.messages[result.messages.length - 1];
    let outputText = lastMessage?.content || "No response";
    console.log("memory:", mem.storage);
    res.json({ output: outputText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Agent API running at http://localhost:${port}`);
});
