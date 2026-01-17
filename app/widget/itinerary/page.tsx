import ItineraryWidget from "@/web/widgets/ItineraryWidget";

export default function ItineraryPage() {
  // In a real scenario, this would likely read from a context or window.ai
  // For the purpose of the template capture, we render the component.
  // The SDK might hydrate it with real data later.
  
  // Placeholder data for the template view
  const placeholderData = {
    location: "Location",
    vibe: "Vibe",
    weather: { temp: 0, condition: "Clear", description: "Waiting for data..." },
    photos: [],
    schedule: []
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <ItineraryWidget data={placeholderData} />
    </div>
  );
}
