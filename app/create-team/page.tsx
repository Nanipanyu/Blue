"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateTeam } from '../../hooks/useTeams';
import { useAuthentication } from '../../hooks/useauthentication';
import { CreateTeamRequest } from '../../lib/types';
import ProtectedRoute from '../../components/ProtectedRoute';

const sports = [
  'Football', 'Basketball', 'Cricket', 'Volleyball', 
  'Tennis', 'Badminton'
];

const regions = [
  'North America', 'South America', 'Europe', 
  'Asia', 'Africa', 'Oceania'
];

export default function CreateTeam() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthentication();
  const createTeamMutation = useCreateTeam();

  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    region: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    maxPlayers: 11
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please log in to create a team');
      router.push('/login');
      return;
    }

    // Clear previous errors
    setErrors({});

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Team name is required';
    if (!formData.sport) newErrors.sport = 'Sport selection is required';
    if (!formData.region) newErrors.region = 'Region selection is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const teamData: CreateTeamRequest = {
        name: formData.name.trim(),
        sport: formData.sport,
        region: formData.region,
        description: formData.description.trim() || undefined,
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        maxPlayers: formData.maxPlayers
      };

      await createTeamMutation.mutateAsync(teamData);
      
      alert('Team created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Team creation error:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxPlayers' ? parseInt(value) || 11 : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Show loading spinner while checking authentication
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-indigo-600">TeamUp</Link>
              <nav className="flex items-center space-x-4">
                <Link href="/explore" className="text-gray-700 hover:text-indigo-600">Explore Teams</Link>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Your Team</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
            {/* Team Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Enter your team name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Sport Selection */}
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                Sport *
              </label>
              <select
                id="sport"
                name="sport"
                required
                value={formData.sport}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.sport ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="">Select a sport</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              {errors.sport && <p className="mt-1 text-sm text-red-600">{errors.sport}</p>}
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                id="region"
                name="region"
                required
                value={formData.region}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.region ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="">Select your region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region}</p>}
            </div>

            {/* Max Players */}
            <div>
              <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Players
              </label>
              <input
                type="number"
                id="maxPlayers"
                name="maxPlayers"
                min="5"
                max="25"
                value={formData.maxPlayers}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Team Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell other teams about your squad..."
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                required
                value={formData.contactEmail}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.contactEmail ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="team@example.com"
              />
              {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>}
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${errors.contactPhone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="+1234567890"
              />
              {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createTeamMutation.isPending}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTeamMutation.isPending ? 'Creating Team...' : 'Create Team'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
