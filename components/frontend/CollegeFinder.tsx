'use client';

import { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import SmartCollegeFinder from './SmartCollegeFinder';
import AdvancedSearch from './AdvancedSearch';
import { ApiResponse } from '@/lib/types';

interface College {
  _id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
  courses: any[];
  matchScore: number;
}

export default function CollegeFinder() {
  const [mode, setMode] = useState<'guided' | 'advanced'>('guided');
  const [recommendations, setRecommendations] = useState<College[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleGuidedComplete = async (finderData: any) => {
    // Convert guided form data to search query
    const searchQuery = {
      courseType: finderData.courseType,
      city: finderData.state,
      budgetMin: finderData.budgetMin,
      budgetMax: finderData.budgetMax,
      eligibility: finderData.marksPercentage,
      country: finderData.country,
      page: 1,
      limit: 20,
    };

    try {
      const res = await fetch('/api/search/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery),
      });

      const data: ApiResponse<College[]> = await res.json();
      if (data.success && data.data) {
        setRecommendations(data.data);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleAdvancedSearch = (results: College[]) => {
    setRecommendations(results);
    setShowRecommendations(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect College
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Personalized college recommendations based on your preferences
          </p>

          {/* Mode Switcher */}
          {!showRecommendations && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setMode('guided')}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  mode === 'guided'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                }`}
              >
                🎯 Guided Journey
              </button>
              <button
                onClick={() => setMode('advanced')}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  mode === 'advanced'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                }`}
              >
                🔍 Advanced Search
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {!showRecommendations ? (
          mode === 'guided' ? (
            <SmartCollegeFinder onComplete={handleGuidedComplete} />
          ) : (
            <AdvancedSearch onSearch={handleAdvancedSearch} />
          )
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Recommended Colleges
                </h2>
                <p className="text-gray-600">
                  {recommendations.length} colleges match your criteria
                </p>
              </div>
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Back to Search
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((college) => (
                <div
                  key={college._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {college.image ? (
                      <img
                        src={college.image}
                        alt={college.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-blue-600">
                        <Globe size={40} className="text-white" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full font-bold text-purple-600 text-sm">
                      {college.matchScore}%
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {college.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{college.city}</p>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.floor(college.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        {college.rating}
                      </span>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
