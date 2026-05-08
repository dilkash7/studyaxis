'use client';

import { useState, useEffect } from 'react';
import { Search, Loader, MapPin, DollarSign, Trophy } from 'lucide-react';
import { ApiResponse } from '@/lib/types';

interface CollegeResult {
  _id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
  courses: any[];
  fees: any[];
  matchScore: number;
}

interface AdvancedSearchProps {
  onSearch?: (results: CollegeResult[]) => void;
}

export default function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    campus: '',
    category: '',
    courseType: 'UG',
    city: '',
    budgetMin: 0,
    budgetMax: 5000000,
    country: 'India',
  });

  async function handleSearch() {
    setLoading(true);
    try {
      const res = await fetch('/api/search/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      const data: ApiResponse<CollegeResult[]> = await res.json();
      if (data.success && data.data) {
        setResults(data.data);
        onSearch?.(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Advanced Search</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Campus name"
            value={filters.campus}
            onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg"
          />
          <select
            value={filters.courseType}
            onChange={(e) =>
              setFilters({ ...filters, courseType: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg"
          >
            <option value="UG">Undergraduate</option>
            <option value="PG">Postgraduate</option>
            <option value="Both">Both</option>
          </select>
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Min Budget"
            value={filters.budgetMin}
            onChange={(e) =>
              setFilters({ ...filters, budgetMin: parseInt(e.target.value) })
            }
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Max Budget"
            value={filters.budgetMax}
            onChange={(e) =>
              setFilters({ ...filters, budgetMax: parseInt(e.target.value) })
            }
            className="p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" /> Searching...
            </>
          ) : (
            <>
              <Search size={20} /> Search Colleges
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Use filters above to search colleges</p>
          </div>
        )}

        {results.map((college) => (
          <div
            key={college._id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-2">{college.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} /> {college.city}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="text-yellow-400">
                      {i < Math.floor(college.rating) ? '★' : '☆'}
                    </div>
                  ))}
                  <span className="text-sm text-gray-600">
                    {college.rating}/5
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-purple-600" />
                  <span className="text-sm font-semibold">
                    Match Score: {college.matchScore}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {college.courses.length} courses available
                </div>
              </div>

              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 h-fit">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
