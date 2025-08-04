"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTeams } from '../../hooks/useTeams';
import { useCreateChallenge } from '../../hooks/useChallenges';
import { useMyTeams } from '../../hooks/useTeams';
import { useAuthentication } from '../../hooks/useauthentication';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Team } from '../../lib/types';

// Type for selected team with user team info
interface SelectedTeamWithUserTeam extends Team {
  userTeam: Team;
}

const sports = ['All Sports', 'Football', 'Basketball', 'Cricket', 'Volleyball', 'Tennis', 'Badminton'];
const regions = ['All Regions', 'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'];

export default function ExploreTeams() {
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Challenge form state
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<SelectedTeamWithUserTeam | null>(null);
  const [challengeForm, setChallengeForm] = useState({
    proposedDate: '',
    proposedTime: '15:00',
    venue: '',
    message: ''
  });

  // Authentication and data fetching
  const { isAuthenticated } = useAuthentication();
  const { data: myTeamsData } = useMyTeams();
  const searchParams = useSearchParams();

  // Get user's teams for filtering suggestions
  const userTeams = useMemo(() => myTeamsData?.data || [], [myTeamsData]);

  // Set default filters based on user's teams or URL params
  useEffect(() => {
    const sportParam = searchParams?.get('sport');
    const regionParam = searchParams?.get('region');

    if (sportParam) {
      setSelectedSport(sportParam);
    } else if (userTeams.length > 0 && selectedSport === 'All Sports') {
      // Default to user's first team's sport
      setSelectedSport(userTeams[0].sport);
    }

    if (regionParam) {
      setSelectedRegion(regionParam);
    } else if (userTeams.length > 0 && selectedRegion === 'All Regions') {
      // Default to user's first team's region
      setSelectedRegion(userTeams[0].region);
    }
  }, [userTeams, searchParams, selectedSport, selectedRegion]);

  // Fetch teams with filters
  const filters = {
    sport: selectedSport === 'All Sports' ? undefined : selectedSport,
    region: selectedRegion === 'All Regions' ? undefined : selectedRegion,
    search: searchTerm || undefined
  };

  const { data: teamsData, isLoading: teamsLoading } = useTeams(filters);
  const teams = teamsData?.data || [];
  const createChallengeMutation = useCreateChallenge();

  // Filter out user's own teams
  const filteredTeams = teams.filter(team => 
    !userTeams.some(userTeam => userTeam.id === team.id)
  );

  const handleChallenge = async (teamId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to send challenges');
      return;
    }

    if (userTeams.length === 0) {
      alert('You need to create a team first to send challenges');
      return;
    }

    // Find user's team with the same sport as target team
    const targetTeam = teams.find(team => team.id === teamId);
    const userTeamForSport = userTeams.find(team => team.sport === targetTeam?.sport);

    if (!userTeamForSport) {
      alert(`You need a ${targetTeam?.sport} team to challenge this team`);
      return;
    }

    // Open challenge form
    setSelectedTeam({
      ...targetTeam!,
      userTeam: userTeamForSport
    } as SelectedTeamWithUserTeam);
    setChallengeForm({
      proposedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      proposedTime: '15:00',
      venue: '',
      message: `Challenge from ${userTeamForSport.name}! Let's have a great match!`
    });
    setShowChallengeForm(true);
  };

  const handleSubmitChallenge = async () => {
    if (!selectedTeam) return;

    try {
      // Validate form data
      if (!challengeForm.proposedDate || !challengeForm.proposedTime) {
        alert('Please select both date and time for the challenge');
        return;
      }

      if (!challengeForm.venue.trim()) {
        alert('Please enter a venue for the challenge');
        return;
      }

      // Convert date to ISO format as expected by backend validation
      const proposedDateTime = new Date(`${challengeForm.proposedDate}T00:00:00.000Z`);
      
      // Check if the date is valid and in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (proposedDateTime < today) {
        alert('Please select a future date for the challenge');
        return;
      }

      const challengeData = {
        toTeamId: selectedTeam.id,
        sport: selectedTeam.sport,
        proposedDate: proposedDateTime.toISOString(), // Convert to ISO format for backend validation
        proposedTime: challengeForm.proposedTime, // Keep as HH:MM format
        venue: challengeForm.venue.trim(),
        message: challengeForm.message.trim() || `Challenge from ${selectedTeam.userTeam.name}!`
      };

      console.log('Sending challenge data:', challengeData); // Debug log

      await createChallengeMutation.mutateAsync(challengeData);
      
      // Success feedback with details
      alert(`Challenge sent to ${selectedTeam.name} for ${challengeForm.proposedDate} at ${challengeForm.proposedTime} at ${challengeForm.venue}!`);
      
      // Reset form and close modal
      setShowChallengeForm(false);
      setSelectedTeam(null);
      setChallengeForm({
        proposedDate: '',
        proposedTime: '15:00',
        venue: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Challenge error:', error);
      alert('Failed to send challenge. Please check your input and try again.');
    }
  };

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
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
              <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore Teams</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {userTeams.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can challenge teams in the same sport as your teams: {' '}
                {[...new Set(userTeams.map(team => team.sport))].join(', ')}
              </p>
            </div>
          )}
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
        {teamsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
            {!isAuthenticated && (
              <p className="mt-2 text-sm text-gray-400">
                <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                  Log in
                </Link> to see personalized team suggestions.
              </p>
            )}
          </div>
        ) : (
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
                      <div className="text-2xl font-bold text-indigo-600">{team.rating || 1000}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{team.members?.length || 0}</div>
                      <div className="text-xs text-gray-500">Members</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{team.wins || 0}</div>
                      <div className="text-xs text-gray-500">Wins</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">{team.losses || 0}</div>
                      <div className="text-xs text-gray-500">Losses</div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{team.description || 'No description available.'}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleChallenge(team.id)}
                      disabled={createChallengeMutation.isPending || !isAuthenticated}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createChallengeMutation.isPending ? 'Sending...' : 'Challenge'}
                    </button>
                    <Link
                      href={`/teams/${team.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenge Form Modal */}
      {showChallengeForm && selectedTeam && (
        <div className="fixed inset-0  backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-[#A196EB] border-2  rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Challenge {selectedTeam.name}
            </h3>
            
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-l font-medium text-black mb-2">
                  Proposed Date
                </label>
                <input
                  type="date"
                  value={challengeForm.proposedDate}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, proposedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-l font-medium text-black mb-2">
                  Proposed Time
                </label>
                <input
                  type="time"
                  value={challengeForm.proposedTime}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, proposedTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-l font-medium text-black mb-2">
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={challengeForm.venue}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Enter venue location (required)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-l font-medium text-gray-900 mb-2">
                  Challenge Message
                </label>
                <textarea
                  value={challengeForm.message}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  placeholder="Add a message to your challenge..."
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChallengeForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitChallenge}
                disabled={
                  createChallengeMutation.isPending || 
                  !challengeForm.proposedDate || 
                  !challengeForm.proposedTime ||
                  !challengeForm.venue.trim()
                }
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createChallengeMutation.isPending ? 'Sending...' : 'Send Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </ProtectedRoute>
  );
}
