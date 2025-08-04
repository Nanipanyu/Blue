'use client';

import { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { useAuthentication } from '../../hooks/useauthentication';
import { SPORTS, REGIONS, Team } from '../../lib/types';

export default function TeamsPage() {
  const [filters, setFilters] = useState({
    sport: '',
    region: '',
    search: '',
  });

  const { isAuthenticated } = useAuthentication();
  const { data: teams, isLoading, error, refetch } = useTeams(filters);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view teams
          </h1>
          <a
            href="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading teams</h1>
          <p className="text-gray-600 mb-4">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <button
          onClick={() => refetch()}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sport
            </label>
            <select
              value={filters.sport}
              onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sports</option>
              {SPORTS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Regions</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search teams..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.data?.map((team: Team) => (
          <div key={team.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {team.sport}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Region:</span> {team.region}</p>
              <p><span className="font-medium">Rating:</span> {team.rating}</p>
              <p><span className="font-medium">Players:</span> {team.members?.length || 0}/{team.maxPlayers}</p>
              <p><span className="font-medium">Record:</span> {team.wins}W - {team.losses}L - {team.draws}D</p>
              {team.description && (
                <p><span className="font-medium">Description:</span> {team.description}</p>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded">
                View Details
              </button>
              <button className="flex-1 bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded">
                Challenge
              </button>
            </div>
          </div>
        ))}
      </div>

      {teams?.data?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-600">Try adjusting your filters or create a new team.</p>
        </div>
      )}
    </div>
  );
}
