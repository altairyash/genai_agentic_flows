import express from "express";
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import {LangGraphAgent} from "@copilotkit/runtime/langgraph"

import dotenv from "dotenv";
dotenv.config();

const app = express();

const serviceAdapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY || "",
});

app.use("/copilotkit", (req, res, next) => {
  (async () => {
    const runtime = new CopilotRuntime({
      agents: {
        starterAgent: new LangGraphAgent({
          deploymentUrl: "http://localhost:8123",
          graphId: "agent",
          langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
        }),
      },
    });
    const handler = copilotRuntimeNodeHttpEndpoint({
      endpoint: "/copilotkit",
      runtime,
      serviceAdapter,
    });

    return handler(req, res);
  })().catch(next);
});

app.listen(4000, () => {
  console.log("Listening at http://localhost:4000/copilotkit");
});
