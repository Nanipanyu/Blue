"use client";

import { useState } from 'react';
import Link from 'next/link';

// Mock data for demonstration
const mockTeams = [
  {
    id: 1,
    name: "Thunder Bolts",
    sport: "Football",
    region: "North District",
    members: 15,
    wins: 12,
    losses: 3,
    rating: 1850,
    description: "Competitive football team looking for serious opponents. We play every weekend!"
  },
  {
    id: 2,
    name: "Court Kings",
    sport: "Basketball",
    region: "Central District", 
    members: 8,
    wins: 18,
    losses: 2,
    rating: 2100,
    description: "Dominating the courts since 2020. Bring your A-game!"
  },
  {
    id: 3,
    name: "Spike Masters",
    sport: "Volleyball",
    region: "South District",
    members: 12,
    wins: 9,
    losses: 6,
    rating: 1650,
    description: "Fun-loving volleyball team. Great for both competitive and casual matches."
  },
  {
    id: 4,
    name: "Cricket Warriors",
    sport: "Cricket",
    region: "East District",
    members: 11,
    wins: 8,
    losses: 4,
    rating: 1750,
    description: "Traditional cricket team with modern tactics. Looking for weekend matches."
  }
];

const sports = ['All Sports', 'Football', 'Basketball', 'Cricket', 'Volleyball', 'Tennis', 'Badminton'];
const regions = ['All Regions', 'North District', 'South District', 'East District', 'West District', 'Central District'];

export default function ExploreTeams() {
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = mockTeams.filter(team => {
    const matchesSport = selectedSport === 'All Sports' || team.sport === selectedSport;
    const matchesRegion = selectedRegion === 'All Regions' || team.region === selectedRegion;
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSport && matchesRegion && matchesSearch;
  });

  const handleChallenge = (teamId: number, teamName: string) => {
    // TODO: Implement challenge functionality
    alert(`Challenge sent to ${teamName}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">TeamUp</Link>
            <nav className="flex space-x-4">
              <Link href="/create-team" className="text-gray-700 hover:text-indigo-600">Create Team</Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore Teams</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Teams
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search by team name..."
              />
            </div>

            {/* Sport Filter */}
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                Sport
              </label>
              <select
                id="sport"
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map(team => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-indigo-600">{team.sport} • {team.region}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{team.rating}</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{team.members}</div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{team.wins}</div>
                    <div className="text-xs text-gray-500">Wins</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">{team.losses}</div>
                    <div className="text-xs text-gray-500">Losses</div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{team.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleChallenge(team.id, team.name)}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Challenge
                  </button>
                  <Link
                    href={`/team/${team.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
