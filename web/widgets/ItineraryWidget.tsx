"use client";

import React from "react";
import { CinematicItinerary } from "@/server/tools/travel_planner";

// Since we can't import types from server directly in client components usually without some build setup, 
// and to be safe, I'm redefining the props interface here or importing if it was in a shared Types file.
// For simplicity in this structure, I'll copy the shape.

interface ItineraryWidgetProps {
  data: CinematicItinerary;
}

export default function ItineraryWidget({ data }: ItineraryWidgetProps) {
  const { location, vibe, weather, photos, schedule } = data;
  const headerImage = photos[0]?.url || "";

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-gray-900 text-white rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* Header Section */}
      <div className="relative h-48 w-full">
        {headerImage ? (
            <img 
              src={headerImage} 
              alt={`${location} ${vibe}`} 
              className="w-full h-full object-cover opacity-80"
            />
        ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-bold tracking-wider">{location}</h2>
          <p className="text-sm font-light text-gray-300 uppercase tracking-widest">{vibe} Edition</p>
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
            <span className="text-sm font-medium">{weather.temp}°C</span>
            <span className="text-xs text-gray-300 capitalize">{weather.condition}</span>
        </div>
      </div>

      {/* Itinerary List */}
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-800 pb-2">48-Hour Plan</h3>
        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div key={index} className="flex items-start gap-3 group">
              <div className="bg-gray-800 p-2 rounded-lg text-xl group-hover:bg-gray-700 transition-colors">
                {item.icon || "📍"}
              </div>
              <div>
                <span className="text-xs text-indigo-400 font-mono block mb-0.5">{item.time}</span>
                <h4 className="font-medium text-gray-100">{item.activity}</h4>
                <p className="text-sm text-gray-400 leading-snug">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-950 p-3 text-center text-xs text-gray-600">
        Cinematic Travel Planner • Powered by OpenAI
      </div>
    </div>
  );
}
