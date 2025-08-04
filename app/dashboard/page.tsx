"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useMyTeams, useUpdateTeam, useDeleteTeam } from '../../hooks/useTeams';
import { usePendingChallenges, useRespondToChallenge } from '../../hooks/useChallenges';
import { useRecentMatches } from '../../hooks/useMatches';
import { useAuthentication } from '../../hooks/useauthentication';
import ProtectedRoute from '../../components/ProtectedRoute';
import { CreateTeamRequest, Team } from '../../lib/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit team modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CreateTeamRequest>>({});
  
  // Authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuthentication();
  
  // Data fetching hooks
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams();
  const { data: pendingChallenges, isLoading: challengesLoading } = usePendingChallenges();
  const { data: recentMatches, isLoading: matchesLoading } = useRecentMatches();
  const respondToChallengeMutation = useRespondToChallenge();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  // Derived data
  const userTeams = myTeams?.data || [];
  const challenges = pendingChallenges?.data || [];
  const matches = recentMatches?.data || [];

  const handleChallengeResponse = async (challengeId: string, response: 'accepted' | 'declined') => {
    try {
      await respondToChallengeMutation.mutateAsync({
        challengeId,
        response: { response }
      });
      alert(`Challenge ${response}ed successfully!`);
    } catch {
      alert(`Failed to ${response} challenge. Please try again.`);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditFormData({
      name: team.name,
      sport: team.sport,
      region: team.region,
      description: team.description || '',
      maxPlayers: team.maxPlayers,
      contactEmail: team.contactEmail,
      contactPhone: team.contactPhone,
    });
    setShowEditModal(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;
    
    try {
      await updateTeamMutation.mutateAsync({
        id: editingTeam.id,
        data: editFormData
      });
      alert('Team updated successfully!');
      setShowEditModal(false);
      setEditingTeam(null);
      setEditFormData({});
    } catch (error) {
      console.error('Update team error:', error);
      alert('Failed to update team. Please try again.');
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteTeamMutation.mutateAsync(teamId);
      alert('Team deleted successfully!');
    } catch (error) {
      console.error('Delete team error:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  // Handle loading states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h1>
          <Link href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">TeamUp</Link>
            <nav className="flex items-center space-x-4">
              <Link href="/create-team" className="text-gray-700 hover:text-indigo-600">Create Team</Link>
              <Link href="/explore" className="text-gray-700 hover:text-indigo-600">Explore Teams</Link>
              <Link href="/profile" className="text-gray-700 hover:text-indigo-600">Profile</Link>
              <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
                <span className="text-sm text-gray-600">Welcome back!</span>
                <Link 
                  href="/logout" 
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Logout
                </Link>
              </div>
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
                <p className="text-3xl font-bold text-indigo-600">
                  {teamsLoading ? '...' : userTeams.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Challenges</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {challengesLoading ? '...' : challenges.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Wins</h3>
                <p className="text-3xl font-bold text-green-600">
                  {teamsLoading ? '...' : userTeams.reduce((sum: number, team) => sum + (team.wins || 0), 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Rating</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {teamsLoading || userTeams.length === 0 ? '...' : 
                    Math.round(userTeams.reduce((sum: number, team) => sum + (team.rating || 0), 0) / userTeams.length)
                  }
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {matchesLoading ? (
                  <div className="text-center py-4">Loading recent activity...</div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No recent activity</div>
                ) : (
                  matches.slice(0, 3).map((match) => {
                    const isWin = match.winnerId && userTeams.some(team => team.id === match.winnerId);
                    const isLoss = match.winnerId && !userTeams.some(team => team.id === match.winnerId);
                    const opponentTeam = userTeams.some(team => team.id === match.homeTeamId) 
                      ? match.awayTeam?.name || 'Unknown Team'
                      : match.homeTeam?.name || 'Unknown Team';
                    const score = match.homeScore !== undefined && match.awayScore !== undefined 
                      ? `${match.homeScore}-${match.awayScore}` 
                      : '';

                    return (
                      <div key={match.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        isWin ? 'bg-green-50' : 
                        isLoss ? 'bg-red-50' : 'bg-yellow-50'
                      }`}>
                        <span className="text-sm text-gray-900">
                          {isWin ? 'Won' : isLoss ? 'Lost' : 'Drew'} against {opponentTeam}
                          {score && ` (${score})`}
                        </span>
                        <span className={`text-xs ${
                          isWin ? 'text-green-600' : 
                          isLoss ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {match.homeRatingChange || match.awayRatingChange ? 
                            ((match.homeRatingChange || 0) > 0 ? '+' : '') + (match.homeRatingChange || match.awayRatingChange || 0) + ' rating' 
                            : ''}
                        </span>
                      </div>
                    );
                  })
                )}
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
                href={`/explore${userTeams.length > 0 ? `?sport=${userTeams[0].sport}&region=${userTeams[0].region}` : ''}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Find Teams to Challenge
              </Link>
            </div>
            
            {challengesLoading ? (
              <div className="text-center py-4">Loading challenges...</div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending challenges</div>
            ) : (
              challenges.map(challenge => (
                <div key={challenge.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {challenge.fromTeam?.name || 'Unknown Team'}
                      </h3>
                      <p className="text-gray-600">
                        {challenge.sport} • Proposed Date: {new Date(challenge.proposedDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 mt-2">
                        &quot;{challenge.message || 'No message provided'}&quot;
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleChallengeResponse(challenge.id, 'accepted')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        disabled={respondToChallengeMutation.isPending}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleChallengeResponse(challenge.id, 'declined')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        disabled={respondToChallengeMutation.isPending}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Match History Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Match History</h2>
            
            {matchesLoading ? (
              <div className="text-center py-4">Loading match history...</div>
            ) : matches.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No matches played yet</div>
            ) : (
              matches.map(match => {
                const isHomeTeam = userTeams.some(team => team.id === match.homeTeamId);
                const opponentTeam = isHomeTeam ? match.awayTeam?.name : match.homeTeam?.name;
                const isWin = match.winnerId && userTeams.some(team => team.id === match.winnerId);
                const isLoss = match.winnerId && !userTeams.some(team => team.id === match.winnerId);
                const scoreDisplay = match.homeScore !== undefined && match.awayScore !== undefined
                  ? isHomeTeam ? `${match.homeScore}-${match.awayScore}` : `${match.awayScore}-${match.homeScore}`
                  : 'Score not available';

                return (
                  <div key={match.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          vs {opponentTeam || 'Unknown Team'}
                        </h3>
                        <p className="text-gray-600">{new Date(match.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          isWin ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {scoreDisplay}
                        </div>
                        <div className={`text-sm ${
                          (match.homeRatingChange || 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isHomeTeam ? match.homeRatingChange : match.awayRatingChange
                            ? ((isHomeTeam ? match.homeRatingChange : match.awayRatingChange)! > 0 ? '+' : '') + 
                              (isHomeTeam ? match.homeRatingChange : match.awayRatingChange) + ' rating'
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
            
            {teamsLoading ? (
              <div className="text-center py-4">Loading your teams...</div>
            ) : userTeams.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                You haven&apos;t joined any teams yet. Create your first team!
              </div>
            ) : (
              userTeams.map(team => (
                <div key={team.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-indigo-600">{team.sport} • {team.region}</p>
                      {team.description && (
                        <p className="text-gray-600 mt-2 text-sm">{team.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">{team.rating || 1000}</div>
                      <div className="text-xs text-gray-500">Team Rating</div>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                      </div>
                    </div>
                  {/* Team Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{team.members?.length || 1}</div>
                      <div className="text-xs text-gray-500">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{team.wins || 0}</div>
                      <div className="text-xs text-gray-500">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">{team.losses || 0}</div>
                      <div className="text-xs text-gray-500">Losses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">{team.draws || 0}</div>
                      <div className="text-xs text-gray-500">Draws</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{team.matchesPlayed || 0}</div>
                      <div className="text-xs text-gray-500">Matches</div>
                    </div>
                  </div>

                  {/* Win Rate Progress Bar */}
                  {team.matchesPlayed > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Win Rate</span>
                        <span>{Math.round((team.wins / team.matchesPlayed) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(team.wins / team.matchesPlayed) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <span>📧 {team.contactEmail}</span>
                    <span>📞 {team.contactPhone}</span>
                    <span>👥 Max Players: {team.maxPlayers}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/explore?sport=${team.sport}&region=${team.region}`}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium text-center"
                    >
                      Find Teams to Challenge
                    </Link>
                    <Link
                      href={`/teams/${team.id}`}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
                    >
                      View Details
                    </Link>
                    
                    {/* Edit and Delete Icons */}
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-md transition-colors"
                      title="Edit Team"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      disabled={deleteTeamMutation.isPending}
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors disabled:opacity-50"
                      title="Delete Team"
                    >
                      {deleteTeamMutation.isPending ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Team Modal */}
      {showEditModal && editingTeam && (
        <div className="fixed inset-0 backdrop-blur-xl  bg-opacity-50 overflow-y-auto flex items-start justify-center z-50">
          <div className="bg-white rounded-lg p-6 border-1  border-indigo-500 w-[30vw] max-w-[50vw] mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Team: {editingTeam.name}
            </h3>
            
            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800  rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select
                  value={editFormData.sport || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, sport: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Sport</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Badminton">Badminton</option>
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={editFormData.region || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Region</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300  text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Max Players */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editFormData.maxPlayers || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300  text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={editFormData.contactEmail || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.contactPhone || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTeam(null);
                  setEditFormData({});
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTeam}
                disabled={updateTeamMutation.isPending}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {updateTeamMutation.isPending ? 'Updating...' : 'Update Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </ProtectedRoute>
  );
}
