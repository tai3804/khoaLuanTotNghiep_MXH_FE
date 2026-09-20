import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { ChatUser } from '../components/chat/chat-box';
import { GroupBanner } from '../components/groups/GroupBanner';
import { GroupDiscussionTab } from '../components/groups/GroupDiscussionTab';
import { GroupMembersTab } from '../components/groups/GroupMembersTab';
import { GroupMediaTab } from '../components/groups/GroupMediaTab';
import { Skeleton } from '../components/common/Skeleton';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface GroupDetailPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (uid?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

export const GroupDetailPage: React.FC<GroupDetailPageProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'discussion' | 'members' | 'media'>('discussion');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập thời gian fetch API
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [id]);

  // Giả lập dữ liệu nhóm để hiển thị giao diện
  const group = {
    id,
    name: "Cộng đồng lập trình viên React",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    privacy: "PUBLIC",
    memberCount: 1542,
    isMember: true,
    isAdmin: true
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
        <Header 
          activeTab={props.activeNavTab} 
          onTabChange={props.setActiveNavTab} 
          onNavigateSettings={props.onNavigateSettings}
          onNavigateProfile={props.onNavigateProfile}
          onNavigateAuth={props.onNavigateAuth}
          onSelectChatUser={props.setActiveChatUser}
        />
        <div className="flex-1 pt-14 flex flex-col items-center">
          {/* Skeleton Banner */}
          <div className="w-full max-w-[1000px] bg-white dark:bg-[#242526] rounded-b-xl shadow mb-4">
            <Skeleton className="w-full h-[350px] rounded-t-none rounded-b-none" />
            <div className="px-8 pb-4 pt-4 flex flex-col md:flex-row justify-between items-end md:items-center relative">
              <div className="flex-1 pb-4">
                <Skeleton variant="text" width="60%" height="2rem" className="mb-2" />
                <Skeleton variant="text" width="40%" height="1rem" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton width="120px" height="2.5rem" />
                <Skeleton width="120px" height="2.5rem" />
              </div>
            </div>
            <div className="px-8 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
              <Skeleton width="80px" height="3rem" className="rounded-none bg-transparent" />
              <Skeleton width="80px" height="3rem" className="rounded-none bg-transparent" />
              <Skeleton width="80px" height="3rem" className="rounded-none bg-transparent" />
            </div>
          </div>
          
          {/* Main Content Area Skeleton */}
          <div className="flex-1 flex justify-center w-full max-w-[1000px] mx-auto px-4 pb-16 space-x-4">
            <div className="flex-1 space-y-4">
              <Skeleton width="100%" height="150px" />
              <Skeleton width="100%" height="300px" />
            </div>
            <div className="w-1/3 hidden md:block space-y-4">
              <Skeleton width="100%" height="200px" />
              <Skeleton width="100%" height="250px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      <Header 
        activeTab={props.activeNavTab} 
        onTabChange={props.setActiveNavTab} 
        onNavigateSettings={props.onNavigateSettings}
        onNavigateProfile={props.onNavigateProfile}
        onNavigateAuth={props.onNavigateAuth}
        onSelectChatUser={props.setActiveChatUser}
      />

      <div className="flex-1 pt-14 flex justify-center">
        <GroupBanner 
          group={group} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center w-full max-w-[1000px] mx-auto pt-4 px-4 pb-16">
        {activeTab === 'discussion' && <GroupDiscussionTab group={group} />}
        {activeTab === 'members' && <GroupMembersTab />}
        {activeTab === 'media' && <GroupMediaTab />}
      </div>
    </div>
  );
};
