import React, { useState } from 'react';
import {
  ProfessionalModalHeader,
  ProfessionalModalTab,
  ProfessionalFeaturePillars,
  ProfessionalCategorySelector,
  ProfessionalLivePreviewCard,
  ProfessionalSettingsToggle,
  ProfessionalModalFooter,
} from './mode-modal';
import { userService } from '../../../services/userService';

interface ProfessionalModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCurrentlyEnabled: boolean;
  currentCategory?: string;
  fullName?: string;
  avatarUrl?: string;
  followerCount?: number;
  onSuccess: (updatedProfile: any) => void;
}

export const ProfessionalModeModal: React.FC<ProfessionalModeModalProps> = ({
  isOpen,
  onClose,
  isCurrentlyEnabled,
  currentCategory = 'Người sáng tạo nội dung số',
  fullName = 'Người dùng',
  avatarUrl = '',
  followerCount = 0,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<ProfessionalModalTab>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    currentCategory || 'Người sáng tạo nội dung số'
  );
  const [showCategoryBadge, setShowCategoryBadge] = useState<boolean>(true);
  const [allowPublicFollow, setAllowPublicFollow] = useState<boolean>(true);
  const [enableInsightsNotification, setEnableInsightsNotification] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = async (enable: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.updateProfessionalMode({
        isProfessionalMode: enable,
        creatorCategory: enable ? selectedCategory : undefined,
      });
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          u.isProfessionalMode = enable;
          u.creatorCategory = enable ? selectedCategory : undefined;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch {}
      window.dispatchEvent(new Event('profile_updated'));
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Có lỗi xảy ra trong quá trình cập nhật, vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#242526] text-gray-900 dark:text-[#e4e6eb] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-[#393a3b]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Gradient Header & Tabs */}
        <ProfessionalModalHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCurrentlyEnabled={isCurrentlyEnabled}
          onClose={onClose}
        />

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Tab 1: Overview & Feature Pillars */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProfessionalFeaturePillars />
              <ProfessionalSettingsToggle
                showCategoryBadge={showCategoryBadge}
                setShowCategoryBadge={setShowCategoryBadge}
                allowPublicFollow={allowPublicFollow}
                setAllowPublicFollow={setAllowPublicFollow}
                enableInsightsNotification={enableInsightsNotification}
                setEnableInsightsNotification={setEnableInsightsNotification}
              />
            </div>
          )}

          {/* Tab 2: Category Selector */}
          {activeTab === 'category' && (
            <div className="space-y-6">
              <ProfessionalCategorySelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
              <ProfessionalSettingsToggle
                showCategoryBadge={showCategoryBadge}
                setShowCategoryBadge={setShowCategoryBadge}
                allowPublicFollow={allowPublicFollow}
                setAllowPublicFollow={setAllowPublicFollow}
                enableInsightsNotification={enableInsightsNotification}
                setEnableInsightsNotification={setEnableInsightsNotification}
              />
            </div>
          )}

          {/* Tab 3: Live Preview Profile Card */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <ProfessionalLivePreviewCard
                fullName={fullName}
                avatarUrl={avatarUrl}
                selectedCategory={selectedCategory}
                followerCount={followerCount || 100}
              />
              <ProfessionalCategorySelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <ProfessionalModalFooter
          isCurrentlyEnabled={isCurrentlyEnabled}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          loading={loading}
          onToggle={handleToggle}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
