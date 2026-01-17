import { get_cinematic_itinerary } from "../server/tools/travel_planner";

async function test() {
    console.log("Testing Cinematic Vibe Travel Planner...");

    // Test Case 1: Tokyo + Cyberpunk
    console.log("\n--- Test Case 1: Tokyo (Cyberpunk) ---");
    const trip1 = await get_cinematic_itinerary("Tokyo", "Cyberpunk");
    console.log(JSON.stringify(trip1, null, 2));

    // Test Case 2: Paris + Wes Anderson
    console.log("\n--- Test Case 2: Paris (Wes Anderson) ---");
    const trip2 = await get_cinematic_itinerary("Paris", "Wes Anderson");
    console.log(JSON.stringify(trip2, null, 2));
}

test().catch(console.error);
