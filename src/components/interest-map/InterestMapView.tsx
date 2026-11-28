import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useInterestMap } from './useInterestMap';
import { InterestStats } from './InterestStats';
import { InterestMapCard } from './InterestMapCard';
import { VectorCard } from './VectorCard';
import { TopicInterestList } from './TopicInterestList';
import { RecommendationList } from './RecommendationList';
import { ActivityList } from './ActivityList';
import { Card } from './ui';

/**
 * Trang "Sơ đồ phân tích xu hướng cá nhân": tải dữ liệu một lần khi vào trang rồi ghép các khung:
 * số liệu tổng quan → sơ đồ → các chiều của vector → chủ đề quan tâm + bài sẽ ưu tiên → các tương tác gần nhất.
 */
export const InterestMapView: React.FC = () => {
  const { data, loading, error } = useInterestMap();
  // Di chuột vào một chủ đề trong danh sách thì tô sáng các bài của chủ đề đó trên sơ đồ
  const [highlightTopic, setHighlightTopic] = useState<number | null>(null);

  if (loading && !data) {
    return (
      <Card className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
      </Card>
    );
  }
  if (!data) {
    return (
      <Card className="text-center space-y-3">
        <p className="text-sm text-gray-700 dark:text-[#e4e6eb]">{error || 'Không tải được sơ đồ'}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer">
          Thử lại
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <InterestStats data={data} />
      <InterestMapCard data={data} highlightTopic={highlightTopic} />
      <VectorCard vector={data.vector} dimensions={data.dimensions} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopicInterestList topics={data.topics} hasProfile={data.hasProfile} onHighlight={setHighlightTopic} />
        <RecommendationList items={data.recommendations} />
      </div>
      <ActivityList data={data} />
    </div>
  );
};
