"use client";

import { useState } from 'react';
import Link from 'next/link';

// Mock data
const userTeams = [
  {
    id: 1,
    name: "My Football Squad",
    sport: "Football",
    region: "North District",
    members: 12,
    wins: 8,
    losses: 2,
    rating: 1950,
    upcomingMatches: 2
  }
];

const challenges = [
  {
    id: 1,
    from: "Thunder Bolts",
    sport: "Football",
    proposedDate: "2025-07-15",
    status: "pending",
    message: "Looking forward to a great match!"
  },
  {
    id: 2,
    from: "Lightning Strikers", 
    sport: "Football",
    proposedDate: "2025-07-20",
    status: "pending",
    message: "Ready to battle it out on the field!"
  }
];

const recentMatches = [
  {
    id: 1,
    opponent: "City Champions",
    result: "win",
    score: "3-1", 
    date: "2025-06-28",
    ratingChange: "+25"
  },
  {
    id: 2,
    opponent: "Riverside United",
    result: "win",
    score: "2-0",
    date: "2025-06-21", 
    ratingChange: "+18"
  },
  {
    id: 3,
    opponent: "Mountain Eagles",
    result: "loss",
    score: "1-2",
    date: "2025-06-14",
    ratingChange: "-12"
  }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleChallengeResponse = (challengeId: number, response: 'accept' | 'decline') => {
    // TODO: Implement challenge response
    alert(`Challenge ${response}ed!`);
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
              <Link href="/explore" className="text-gray-700 hover:text-indigo-600">Explore Teams</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'challenges', name: 'Challenges' },
              { id: 'matches', name: 'Match History' },
              { id: 'teams', name: 'My Teams' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Teams</h3>
                <p className="text-3xl font-bold text-indigo-600">{userTeams.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Challenges</h3>
                <p className="text-3xl font-bold text-yellow-600">{challenges.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Wins</h3>
                <p className="text-3xl font-bold text-green-600">
                  {userTeams.reduce((sum, team) => sum + team.wins, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Rating</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(userTeams.reduce((sum, team) => sum + team.rating, 0) / userTeams.length)}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-900">Won against City Champions (3-1)</span>
                  <span className="text-xs text-green-600">+25 rating</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-900">New challenge from Thunder Bolts</span>
                  <span className="text-xs text-blue-600">Pending</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-gray-900">Match scheduled for July 15th</span>
                  <span className="text-xs text-yellow-600">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Pending Challenges</h2>
              <Link 
                href="/explore"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Find Teams to Challenge
              </Link>
            </div>
            
            {challenges.map(challenge => (
              <div key={challenge.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{challenge.from}</h3>
                    <p className="text-gray-600">{challenge.sport} • Proposed Date: {challenge.proposedDate}</p>
                    <p className="text-gray-700 mt-2">&quot;{challenge.message}&quot;</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleChallengeResponse(challenge.id, 'accept')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleChallengeResponse(challenge.id, 'decline')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Match History Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Match History</h2>
            
            {recentMatches.map(match => (
              <div key={match.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">vs {match.opponent}</h3>
                    <p className="text-gray-600">{match.date}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      match.result === 'win' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {match.score}
                    </div>
                    <div className={`text-sm ${
                      match.ratingChange.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {match.ratingChange} rating
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Teams</h2>
              <Link 
                href="/create-team"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create New Team
              </Link>
            </div>
            
            {userTeams.map(team => (
              <div key={team.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-indigo-600">{team.sport} • {team.region}</p>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-lg font-semibold">{team.members}</div>
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
                      <div>
                        <div className="text-lg font-semibold text-indigo-600">{team.rating}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/team/${team.id}/manage`}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Manage
                    </Link>
                    <Link
                      href={`/team/${team.id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
