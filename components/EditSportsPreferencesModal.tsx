'use client';

import { useState } from 'react';

interface EditSportsPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    favoriteSports?: string[];
    skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
    preferredPositions?: string[];
    playingExperience?: number;
    coachingExperience?: boolean;
    favoriteTeams?: string[];
    favoritePlayers?: string[];
  };
  onSave: (data: {
    favoriteSports?: string[];
    skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
    preferredPositions?: string[];
    playingExperience?: number;
    coachingExperience?: boolean;
    favoriteTeams?: string[];
    favoritePlayers?: string[];
  }) => Promise<void>;
  isLoading: boolean;
}

const AVAILABLE_SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Soccer', 'Baseball', 'Volleyball',
  'Cricket', 'Rugby', 'Hockey', 'Swimming', 'Track & Field', 'Golf',
  'Badminton', 'Table Tennis', 'Boxing', 'Wrestling', 'Martial Arts'
];

const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'PROFESSIONAL', label: 'Professional' }
];

const COMMON_POSITIONS = {
  'Football': ['Quarterback', 'Running Back', 'Wide Receiver', 'Tight End', 'Offensive Line', 'Defensive Line', 'Linebacker', 'Cornerback', 'Safety', 'Kicker'],
  'Basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  'Soccer': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Winger'],
  'Baseball': ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base', 'Shortstop', 'Left Field', 'Center Field', 'Right Field'],
  'Volleyball': ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero', 'Defensive Specialist']
};

export default function EditSportsPreferencesModal({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading
}: EditSportsPreferencesModalProps) {
  const [formData, setFormData] = useState<{
    favoriteSports: string[];
    skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
    preferredPositions: string[];
    playingExperience: number;
    coachingExperience: boolean;
    favoriteTeams: string[];
    favoritePlayers: string[];
  }>({
    favoriteSports: user.favoriteSports || [],
    skillLevel: (user.skillLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL') || 'BEGINNER',
    preferredPositions: user.preferredPositions || [],
    playingExperience: user.playingExperience || 0,
    coachingExperience: user.coachingExperience || false,
    favoriteTeams: user.favoriteTeams || [],
    favoritePlayers: user.favoritePlayers || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const toggleSport = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteSports: prev.favoriteSports.includes(sport)
        ? prev.favoriteSports.filter(s => s !== sport)
        : [...prev.favoriteSports, sport]
    }));
  };

  const togglePosition = (position: string) => {
    setFormData(prev => ({
      ...prev,
      preferredPositions: prev.preferredPositions.includes(position)
        ? prev.preferredPositions.filter(p => p !== position)
        : [...prev.preferredPositions, position]
    }));
  };

  const getAvailablePositions = () => {
    const positions = new Set<string>();
    formData.favoriteSports.forEach(sport => {
      if (COMMON_POSITIONS[sport as keyof typeof COMMON_POSITIONS]) {
        COMMON_POSITIONS[sport as keyof typeof COMMON_POSITIONS].forEach(pos => positions.add(pos));
      }
    });
    return Array.from(positions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Sports Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Favorite Sports */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Favorite Sports
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.favoriteSports.includes(sport)
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Skill Level
            </label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                skillLevel: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select skill level</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Positions */}
          {formData.favoriteSports.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Positions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {getAvailablePositions().map((position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => togglePosition(position)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.preferredPositions.includes(position)
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Playing Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Playing Experience
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.playingExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, playingExperience: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          {/* Coaching Experience */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.coachingExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, coachingExperience: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                I have coaching experience
              </span>
            </label>
          </div>

          {/* Favorite Teams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Teams
            </label>
            <input
              type="text"
              value={formData.favoriteTeams.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                favoriteTeams: e.target.value.split(',').map(team => team.trim()).filter(team => team.length > 0)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your favorite teams (comma separated)"
            />
          </div>

          {/* Favorite Players */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Players
            </label>
            <input
              type="text"
              value={formData.favoritePlayers.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                favoritePlayers: e.target.value.split(',').map(player => player.trim()).filter(player => player.length > 0)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your favorite players (comma separated)"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
