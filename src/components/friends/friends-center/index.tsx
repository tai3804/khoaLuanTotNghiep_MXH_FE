import React from 'react';
import { Users, Check } from 'lucide-react';
import { useFriendsData } from './useFriendsData';
import { FriendsSidebarNav } from './FriendsSidebarNav';
import { FriendsOverviewTab } from './FriendsOverviewTab';
import { FriendsRequestsTab } from './FriendsRequestsTab';
import { FriendsSuggestionsTab } from './FriendsSuggestionsTab';
import { FriendsAllTab } from './FriendsAllTab';
import { FriendsFollowersTab } from './FriendsFollowersTab';
import { ChatUser } from '../../chat/ChatBox';

export interface FriendsViewProps {
  onSelectChatUser?: (user: ChatUser) => void;
  onViewProfile?: (userId: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ onSelectChatUser, onViewProfile }) => {
  const {
    isAuthenticated,
    openLoginModal,
    t,
    activeTab,
    setActiveTab,
    friends,
    suggestions,
    visibleSuggestions,
    requests,
    followers,
    following,
    sentRequests,
    loading,
    searchTerm,
    setSearchTerm,
    actionMessage,
    loadAllData,
    handleAcceptRequest,
    handleRejectRequest,
    handleAddFriend,
    handleRemoveSuggestion,
    handleUnfriend,
  } = useFriendsData();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center mx-auto shadow-sm">
          <Users className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-[#e4e6eb]">
          Đăng nhập để xem Bạn bè
        </h3>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
          Kết nối với bạn bè, trò chuyện và cùng chia sẻ những khoảnh khắc tuyệt vời.
        </p>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-150">
      <FriendsSidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        loading={loading}
        requestsCount={requests.length}
        suggestionsCount={visibleSuggestions.length}
        friendsCount={friends.length}
        followersCount={followers.length}
        followingCount={following.length}
        t={t}
        onRefresh={() => loadAllData(false)}
      />

      <main className="flex-1 md:ml-[300px] xl:ml-[340px] p-4 sm:p-6 min-h-[calc(100vh-3.5rem)] transition-all duration-150">
        {actionMessage && (
          <div className="mb-5 p-3.5 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center space-x-2 text-sm font-semibold animate-fade-in">
            <Check className="w-5 h-5" />
            <span>{actionMessage}</span>
          </div>
        )}

        {activeTab === 'home' && (
          <FriendsOverviewTab
            requests={requests}
            visibleSuggestions={visibleSuggestions}
            sentRequests={sentRequests}
            loading={loading}
            t={t}
            setActiveTab={setActiveTab}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onAddFriend={handleAddFriend}
            onRemoveSuggestion={handleRemoveSuggestion}
            onViewProfile={onViewProfile}
          />
        )}

        {activeTab === 'requests' && (
          <FriendsRequestsTab
            requests={requests}
            loading={loading}
            t={t}
            setActiveTab={setActiveTab}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onViewProfile={onViewProfile}
          />
        )}

        {activeTab === 'suggestions' && (
          <FriendsSuggestionsTab
            visibleSuggestions={visibleSuggestions}
            sentRequests={sentRequests}
            loading={loading}
            t={t}
            onAddFriend={handleAddFriend}
            onRemoveSuggestion={handleRemoveSuggestion}
            onViewProfile={onViewProfile}
          />
        )}

        {activeTab === 'friends' && (
          <FriendsAllTab
            friends={friends}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            t={t}
            setActiveTab={setActiveTab}
            onSelectChatUser={onSelectChatUser}
            onUnfriend={handleUnfriend}
            onViewProfile={onViewProfile}
          />
        )}

        {(activeTab === 'followers' || activeTab === 'following') && (
          <FriendsFollowersTab
            activeTab={activeTab}
            followers={followers}
            following={following}
            loading={loading}
            t={t}
            onViewProfile={onViewProfile}
          />
        )}
      </main>
    </div>
  );
};
