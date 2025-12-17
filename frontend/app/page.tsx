"use client";

import { useEffect } from "react";
import {
  useCoAgent,
  useCopilotChat,
  useCopilotAction,
} from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import {
  CopilotSidebar,
  CopilotKitCSSProperties,
} from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

type TravelState = {
  itinerary: { day: number; summary: string }[];
  hotels: { name: string; price: string; rating: number }[];
};

export default function Home() {
  const { state, setState, run } = useCoAgent<TravelState>({
    name: "starterAgent",
    initialState: {
      itinerary: [],
      hotels: [],
    },
  });

  const { appendMessage, isLoading } = useCopilotChat();

  // Example: trigger agent run manually
  const handlePlanTrip = () => {
    appendMessage(
      new TextMessage({
        role: MessageRole.User,
        content: "Plan a 5-day trip to New York with hotels and itinerary.",
      })
    );
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full bg-white text-gray-900"
      style={
        {
          "--copilot-kit-primary-color": "#FFFFFF",
          "--copilot-kit-secondary-color": "#6366F1",
          "--copilot-kit-contrast-color": "#000000",
          "--copilot-kit-separator-color": "#E5E7EB",
        } as CopilotKitCSSProperties
      }
    >
      {/* Header */}
      <header className="w-full px-8 py-4 bg-gray-100 shadow-md flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          🌍 Travel AI Assistant
        </h1>

        <button
          onClick={handlePlanTrip}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? "Planning…" : "Plan Trip"}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-8">
        {/* LEFT: Dynamic Travel Panel */}
        <section className="flex-1 bg-gray-50 rounded-lg p-6 shadow-lg overflow-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Travel Plan
          </h2>

          {!state.itinerary?.length && !state.hotels?.length && (
            <p className="text-gray-500">
              Ask the assistant to plan a trip — results will appear here.
            </p>
          )}

          {state.itinerary?.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-gray-700 mt-4">
                🗓️ Itinerary
              </h3>
              {state.itinerary.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 border border-gray-200 rounded-md shadow-sm mb-3"
                >
                  <p className="font-medium text-gray-900">
                    Day {item.day}
                  </p>
                  <p className="text-gray-700">{item.summary}</p>
                </div>
              ))}
            </>
          )}

          {state.hotels?.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-gray-700 mt-8">
                🏨 Hotel Suggestions
              </h3>
              {state.hotels.map((hotel, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 border border-gray-200 rounded-md shadow-sm mb-3"
                >
                  <p className="font-bold text-gray-900">{hotel.name}</p>
                  <p className="text-gray-700">
                    Price: {hotel.price} • ⭐ {hotel.rating}
                  </p>
                </div>
              ))}
            </>
          )}
        </section>

        {/* RIGHT: Copilot Sidebar */}
        <aside className="w-full lg:w-[400px] flex-shrink-0">
          <CopilotSidebar
            defaultOpen
            instructions={`
You are a travel planner agent.
Respond with structured actions like:

{
  "type": "action",
  "action": "addItinerary",
  "payload": { "day": number, "summary": string }
}

or

{
  "type": "action",
  "action": "addHotel",
  "payload": { "name": string, "price": string, "rating": number }
}

Respond ONLY with structured actions.
            `}
            labels={{
              title: "Travel Assistant",
              initial: "Where would you like to go? ✈️",
              submit: "Plan",
            }}
            suggestions={[
              {
                title: "Plan 5-day NYC trip",
                message:
                  "Plan a 5-day trip to New York with itinerary and hotels.",
              },
            ]}
            clickOutsideToClose={true}
            imageUploadsEnabled={true}
          />
        </aside>
      </main>
    </div>
  );
}
