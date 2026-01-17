import { z } from "zod";

export const TravelInputSchema = z.object({
    location: z.string(),
    vibe: z.enum(["Wes Anderson", "Cyberpunk", "Noir", "Studio Ghibli", "Minimalist"]),
});

export type TravelInput = z.infer<typeof TravelInputSchema>;

interface WeatherData {
    main: { temp: number };
    weather: { main: string; description: string }[];
}

interface UnsplashPhoto {
    urls: { regular: string; small: string };
    alt_description: string;
    user: { name: string };
}

interface ItineraryItem {
    time: string;
    activity: string;
    description: string;
    icon?: string;
}

export interface CinematicItinerary {
    location: string;
    vibe: string;
    weather: {
        temp: number;
        condition: string;
        description: string;
    };
    photos: { url: string; credit: string }[];
    schedule: ItineraryItem[];
}

async function getWeather(location: string): Promise<WeatherData> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        console.warn("OPENWEATHER_API_KEY is missing. Returning mock weather.");
        return { main: { temp: 20 }, weather: [{ main: "Clear", description: "clear sky" }] };
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                location
            )}&units=metric&appid=${apiKey}`
        );
        if (!response.ok) throw new Error("Weather API failed");
        return await response.json();
    } catch (e) {
        console.warn("Weather fetch failed, using mock data", e);
        return { main: { temp: 15 }, weather: [{ main: "Clouds", description: "scattered clouds" }] };
    }
}

async function getPhotos(location: string, vibe: string): Promise<UnsplashPhoto[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
        console.warn("UNSPLASH_ACCESS_KEY is missing. Returning mock photos.");
        return Array(3).fill({
            urls: { regular: "https://images.unsplash.com/photo-1512453979798-5ea904f18f33?auto=format&fit=crop&w=800&q=60", small: "" },
            alt_description: "Mock photo",
            user: { name: "Mock User" }
        });
    }

    try {
        const query = `${location} ${vibe}`;
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
            {
                headers: { Authorization: `Client-ID ${accessKey}` },
            }
        );
        if (!response.ok) throw new Error("Unsplash API failed");
        const data = await response.json();
        return data.results || [];
    } catch (e) {
        console.warn("Photo fetch failed, using mock data", e);
        return Array(3).fill({
            urls: { regular: "https://images.unsplash.com/photo-1512453979798-5ea904f18f33?auto=format&fit=crop&w=800&q=60", small: "" },
            alt_description: "Failed to load photo",
            user: { name: "Unknown" }
        });
    }
}

function generateSchedule(vibe: string, weatherCondition: string): ItineraryItem[] {
    const isBadWeather = ["Rain", "Snow", "Drizzle", "Thunderstorm"].includes(weatherCondition);
    const schedule: ItineraryItem[] = [];

    // Day 1
    schedule.push({ time: "Day 1 - 09:00", activity: "Arrival & Breakfast", description: "Start your journey at a local cafe.", icon: "☕" });

    if (isBadWeather) {
        schedule.push({ time: "Day 1 - 11:00", activity: "Indoor Exploration", description: `Explore a ${vibe}-style library or museum to stay dry.`, icon: "🏛️" });
        schedule.push({ time: "Day 1 - 14:00", activity: "Cozy Lunch", description: "Warm up with some hot soup in a vintage bistro.", icon: "🍜" });
        schedule.push({ time: "Day 1 - 16:00", activity: "Art Gallery", description: "Visit a surrealist art exhibition.", icon: "🖼️" });
    } else {
        schedule.push({ time: "Day 1 - 11:00", activity: "City Walk", description: `Walk through the streets searching for ${vibe} architecture.`, icon: "Walking" });
        schedule.push({ time: "Day 1 - 14:00", activity: "Park Picnic", description: "Enjoy the clear skies in a symmetrical garden.", icon: "🌳" });
        schedule.push({ time: "Day 1 - 16:00", activity: "observation Deck", description: "Get a panoramic view of the city.", icon: "🔭" });
    }

    schedule.push({ time: "Day 1 - 20:00", activity: "Themed Dinner", description: `Dinner at a restaurant that matches the ${vibe} aesthetic.`, icon: "🍽️" });

    // Day 2
    schedule.push({ time: "Day 2 - 10:00", activity: "Market Visit", description: "Hunt for artifacts in the local flea market.", icon: "🛍️" });

    if (isBadWeather) {
        schedule.push({ time: "Day 2 - 13:00", activity: "Cinema", description: "Catch a classic noir film at an old theater.", icon: "🎬" });
    } else {
        schedule.push({ time: "Day 2 - 13:00", activity: "River Cruise", description: "See the city from the water.", icon: "🚤" });
    }

    return schedule;
}

export async function get_cinematic_itinerary(location: string, vibe: string): Promise<CinematicItinerary> {
    const weatherData = await getWeather(location);
    const photosData = await getPhotos(location, vibe);

    const weatherMain = weatherData.weather[0]?.main || "Clear";
    const weatherDesc = weatherData.weather[0]?.description || "Clear sky";

    const schedule = generateSchedule(vibe, weatherMain);

    return {
        location,
        vibe,
        weather: {
            temp: Math.round(weatherData.main.temp),
            condition: weatherMain,
            description: weatherDesc,
        },
        photos: photosData.map(p => ({ url: p.urls.regular, credit: p.user.name })),
        schedule,
    };
}
