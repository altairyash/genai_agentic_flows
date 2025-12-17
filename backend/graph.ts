import "dotenv/config";
import * as z from "zod";
import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

interface Destination {
  name: string;
  country: string;
  avgTemp: number;
  attractions: string[];
  bestVisitMonths: string[];
}

interface HotelOption {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
}

interface FlightOption {
  id: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  price: number;
  duration: string;
}

interface ActivityOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  rating: number;
}

const destinations: Record<string, Destination> = {
  paris: {
    name: "Paris",
    country: "France",
    avgTemp: 15,
    attractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Arc de Triomphe"],
    bestVisitMonths: ["April", "May", "September", "October"],
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    avgTemp: 16,
    attractions: ["Senso-ji Temple", "Shibuya Crossing", "Mount Fuji", "Meiji Shrine"],
    bestVisitMonths: ["March", "April", "October", "November"],
  },
  bali: {
    name: "Bali",
    country: "Indonesia",
    avgTemp: 28,
    attractions: ["Ubud Rice Terraces", "Tanah Lot Temple", "Gili Islands", "Mount Batur"],
    bestVisitMonths: ["April", "May", "June", "September"],
  },
  newyork: {
    name: "New York",
    country: "United States",
    avgTemp: 12,
    attractions: ["Statue of Liberty", "Central Park", "Times Square", "Empire State Building"],
    bestVisitMonths: ["September", "October", "April", "May"],
  },
};

const hotels: Record<string, HotelOption[]> = {
  paris: [
    {
      id: "h1",
      name: "Luxury Paris Hotel",
      location: "8th Arrondissement",
      pricePerNight: 280,
      rating: 4.8,
      amenities: ["WiFi", "Gym", "Restaurant", "Spa"],
    },
    {
      id: "h2",
      name: "Budget Paris Hostel",
      location: "Latin Quarter",
      pricePerNight: 45,
      rating: 4.2,
      amenities: ["WiFi", "Common Kitchen", "Tours"],
    },
  ],
  tokyo: [
    {
      id: "h3",
      name: "Modern Tokyo Hotel",
      location: "Shibuya",
      pricePerNight: 150,
      rating: 4.6,
      amenities: ["WiFi", "Gym", "Restaurant", "24h Convenience Store"],
    },
    {
      id: "h4",
      name: "Traditional Ryokan",
      location: "Asakusa",
      pricePerNight: 120,
      rating: 4.7,
      amenities: ["Hot Spring", "Traditional Meals", "Garden"],
    },
  ],
  bali: [
    {
      id: "h5",
      name: "Beachfront Resort",
      location: "Seminyak",
      pricePerNight: 95,
      rating: 4.5,
      amenities: ["Pool", "Beach Access", "Restaurant", "Yoga Classes"],
    },
    {
      id: "h6",
      name: "Jungle Villa",
      location: "Ubud",
      pricePerNight: 85,
      rating: 4.4,
      amenities: ["Pool", "Garden", "WiFi", "Breakfast Included"],
    },
  ],
  newyork: [
    {
      id: "h7",
      name: "Manhattan Luxury",
      location: "Midtown",
      pricePerNight: 320,
      rating: 4.7,
      amenities: ["WiFi", "Gym", "Rooftop Bar", "Concierge"],
    },
    {
      id: "h8",
      name: "Budget NYC Hotel",
      location: "Queens",
      pricePerNight: 110,
      rating: 4.1,
      amenities: ["WiFi", "24h Staff", "Luggage Storage"],
    },
  ],
};

const flights: Record<string, FlightOption[]> = {
  "us-paris": [
    {
      id: "f1",
      departure: "New York (JFK)",
      arrival: "Paris (CDG)",
      departureTime: "08:00",
      arrivalTime: "20:00+1",
      airline: "Air France",
      price: 650,
      duration: "8h 30m",
    },
  ],
  "us-tokyo": [
    {
      id: "f2",
      departure: "San Francisco (SFO)",
      arrival: "Tokyo (NRT)",
      departureTime: "14:00",
      arrivalTime: "16:00+1",
      airline: "JAL",
      price: 850,
      duration: "11h",
    },
  ],
  "us-bali": [
    {
      id: "f3",
      departure: "Los Angeles (LAX)",
      arrival: "Bali (DPS)",
      departureTime: "16:00",
      arrivalTime: "06:00+1",
      airline: "Garuda Indonesia",
      price: 720,
      duration: "18h 30m",
    },
  ],
};

const activities: Record<string, ActivityOption[]> = {
  paris: [
    {
      id: "a1",
      name: "Eiffel Tower Guided Tour",
      description: "Skip-the-line access and expert guide",
      duration: "2 hours",
      price: 89,
      rating: 4.9,
    },
    {
      id: "a2",
      name: "Seine River Cruise",
      description: "Evening cruise with dinner",
      duration: "3 hours",
      price: 120,
      rating: 4.7,
    },
  ],
  tokyo: [
    {
      id: "a3",
      name: "Traditional Tea Ceremony",
      description: "Learn the ancient art of tea preparation",
      duration: "1.5 hours",
      price: 65,
      rating: 4.8,
    },
    {
      id: "a4",
      name: "Sumo Wrestling Show",
      description: "Experience professional sumo wrestling",
      duration: "3 hours",
      price: 95,
      rating: 4.6,
    },
  ],
  bali: [
    {
      id: "a5",
      name: "Rice Terrace Trek",
      description: "Hike through beautiful rice terraces",
      duration: "4 hours",
      price: 55,
      rating: 4.7,
    },
    {
      id: "a6",
      name: "Balinese Cooking Class",
      description: "Learn to cook traditional Balinese dishes",
      duration: "3 hours",
      price: 50,
      rating: 4.8,
    },
  ],
  newyork: [
    {
      id: "a7",
      name: "Broadway Show Tickets",
      description: "Premium seats for a top Broadway production",
      duration: "3 hours",
      price: 180,
      rating: 4.8,
    },
    {
      id: "a8",
      name: "Statue of Liberty Tour",
      description: "Crown access and Ellis Island included",
      duration: "4 hours",
      price: 75,
      rating: 4.9,
    },
  ],
};

const searchDestinations = tool(
  ({ budget, tripDuration, climate }: { budget: string; tripDuration: string; climate: string }) => {
    const budgetRanges: Record<string, { min: number; max: number }> = {
      budget: { min: 0, max: 1500 },
      moderate: { min: 1500, max: 4000 },
      luxury: { min: 4000, max: 100000 },
    };

    const range = budgetRanges[budget] || budgetRanges.moderate;
    const numDays = parseInt(tripDuration.split(" ")[0]) || 5;

    const filteredDestinations = Object.values(destinations).filter((dest) => {
      const estimatedCost = 150 * numDays + 500;
      return estimatedCost >= range.min && estimatedCost <= range.max;
    });

    return {
      success: true,
      recommendations: filteredDestinations.map((d) => ({
        name: d.name,
        country: d.country,
        attractions: d.attractions.slice(0, 2),
        bestMonths: d.bestVisitMonths,
        estimatedBudget: `$${150 * numDays + 500}`,
      })),
    };
  },
  {
    name: "search_destinations",
    description: "Search for travel destinations based on budget and preferences",
    schema: z.object({
      budget: z.enum(["budget", "moderate", "luxury"]).describe("Budget level for the trip"),
      tripDuration: z.string().describe("Duration of trip, e.g., '7 days'"),
      climate: z.string().describe("Preferred climate: tropical, temperate, cold, or any"),
    }),
  }
);

const searchHotels = tool(
  ({ destination, checkInDate, checkOutDate }: { destination: string; checkInDate: string; checkOutDate: string }) => {
    const key = destination.toLowerCase().replace(/\s+/g, "");
    const availableHotels = hotels[key] || [];

    if (availableHotels.length === 0) {
      return { success: false, error: `No hotels found for ${destination}` };
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      destination,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      hotels: availableHotels.map((h) => ({
        name: h.name,
        location: h.location,
        pricePerNight: h.pricePerNight,
        totalPrice: h.pricePerNight * nights,
        rating: h.rating,
        amenities: h.amenities,
      })),
    };
  },
  {
    name: "search_hotels",
    description: "Search for hotels in a destination",
    schema: z.object({
      destination: z.string().describe("Destination city name"),
      checkInDate: z.string().describe("Check-in date in YYYY-MM-DD format"),
      checkOutDate: z.string().describe("Check-out date in YYYY-MM-DD format"),
    }),
  }
);

const searchFlights = tool(
  ({ origin, destination, departureDate }: { origin: string; destination: string; departureDate: string }) => {
    const route = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
    const availableFlights = flights[route] || [];

    if (availableFlights.length === 0) {
      return { success: false, error: `No flights found from ${origin} to ${destination}` };
    }

    return {
      success: true,
      origin,
      destination,
      departureDate,
      flights: availableFlights.map((f) => ({
        airline: f.airline,
        departure: f.departure,
        arrival: f.arrival,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        duration: f.duration,
        price: f.price,
      })),
    };
  },
  {
    name: "search_flights",
    description: "Search for flights between two cities",
    schema: z.object({
      origin: z.string().describe("Departure city or airport code"),
      destination: z.string().describe("Arrival city or airport code"),
      departureDate: z.string().describe("Departure date in YYYY-MM-DD format"),
    }),
  }
);

const searchActivities = tool(
  ({ destination, activityType }: { destination: string; activityType: string }) => {
    const key = destination.toLowerCase().replace(/\s+/g, "");
    const availableActivities = activities[key] || [];

    if (availableActivities.length === 0) {
      return { success: false, error: `No activities found for ${destination}` };
    }

    return {
      success: true,
      destination,
      activities: availableActivities.map((a) => ({
        name: a.name,
        description: a.description,
        duration: a.duration,
        price: a.price,
        rating: a.rating,
      })),
    };
  },
  {
    name: "search_activities",
    description: "Search for activities and attractions in a destination",
    schema: z.object({
      destination: z.string().describe("Destination city name"),
      activityType: z.string().optional().describe("Type of activity: cultural, adventure, food, relaxation"),
    }),
  }
);

const bookItinerary = tool(
  ({ destination, checkInDate, checkOutDate, hotelName, flightInfo, activities: activityNames }: {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    hotelName: string;
    flightInfo: string;
    activities: string[];
  }) => {
    const bookingId = `BOOK-${Date.now()}`;
    const confirmationNumber = `CONF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      bookingId,
      confirmationNumber,
      destination,
      itinerary: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        hotel: hotelName,
        flight: flightInfo,
        activities: activityNames,
      },
      nextSteps: ["Check confirmation email", "Save booking ID", "Arrange travel insurance", "Review destination guidelines"],
    };
  },
  {
    name: "book_itinerary",
    description: "Book a complete travel itinerary with hotel, flights, and activities",
    schema: z.object({
      destination: z.string().describe("Destination city name"),
      checkInDate: z.string().describe("Hotel check-in date"),
      checkOutDate: z.string().describe("Hotel check-out date"),
      hotelName: z.string().describe("Selected hotel name"),
      flightInfo: z.string().describe("Flight details summary"),
      activities: z.array(z.string()).describe("List of booked activities"),
    }),
  }
);

const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.3,
  timeout: 30000,
});
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();

export const travelAgent = createAgent({
  model,
  tools: [searchDestinations, searchHotels, searchFlights, searchActivities, bookItinerary],
  systemPrompt: "You are an expert travel planning assistant. Help users plan trips by recommending destinations, hotels, flights, and activities based on their preferences and budget. Use the available tools to search for options and book itineraries. Provide clear, concise, and friendly responses.",
  checkpointer,
});
