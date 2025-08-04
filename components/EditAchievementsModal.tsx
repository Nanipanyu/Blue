'use client';

import { useState } from 'react';

interface EditAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: object; // We'll extend this with achievements data when backend is ready
  onSave: (data: {
    type: string;
    title: string;
    description: string;
    dateEarned: string;
    icon?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const ACHIEVEMENT_TYPES = [
  { value: 'TOURNAMENT_WIN', label: 'Tournament Win', icon: '🏆' },
  { value: 'GOALS_MILESTONE', label: 'Goals Milestone', icon: '⚽' },
  { value: 'MATCHES_PLAYED', label: 'Matches Played', icon: '🎯' },
  { value: 'TEAM_CAPTAIN', label: 'Team Captain', icon: '👑' },
  { value: 'BEST_PLAYER', label: 'Best Player Award', icon: '⭐' },
  { value: 'SKILL_CERTIFICATION', label: 'Skill Certification', icon: '📜' },
  { value: 'COACHING_BADGE', label: 'Coaching Badge', icon: '🎓' },
  { value: 'SPORTSMANSHIP', label: 'Sportsmanship Award', icon: '🤝' },
  { value: 'ATTENDANCE', label: 'Perfect Attendance', icon: '📅' },
  { value: 'OTHER', label: 'Other Achievement', icon: '🏅' }
];

export default function EditAchievementsModal({
  isOpen,
  onClose,
  onSave,
  isLoading
}: EditAchievementsModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    dateEarned: '',
    icon: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.title || !formData.dateEarned) {
      return;
    }
    
    await onSave({
      ...formData,
      icon: formData.icon || ACHIEVEMENT_TYPES.find(t => t.value === formData.type)?.icon
    });
    
    // Reset form
    setFormData({
      type: '',
      title: '',
      description: '',
      dateEarned: '',
      icon: ''
    });
  };

  const handleTypeChange = (type: string) => {
    const selectedType = ACHIEVEMENT_TYPES.find(t => t.value === type);
    setFormData(prev => ({
      ...prev,
      type,
      icon: selectedType?.icon || ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add Achievement</h2>
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
          {/* Achievement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Achievement Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Achievement Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Regional Football Championship"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us more about this achievement..."
            />
          </div>

          {/* Date Earned */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Earned *
            </label>
            <input
              type="date"
              value={formData.dateEarned}
              onChange={(e) => setFormData(prev => ({ ...prev, dateEarned: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Custom Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Icon (Optional)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="🏆 (emoji or leave blank for default)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter an emoji or leave blank to use the default icon for the selected type
            </p>
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
              disabled={isLoading || !formData.type || !formData.title || !formData.dateEarned}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
