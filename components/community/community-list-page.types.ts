import type { PostCategory, WritablePostCategory } from "@/lib/mock/community";

export interface CommunityListPageProps {
  title?: string;
  heading?: string;
  description?: string;
  featureName: string;
  basePath: "/opod" | "/board";
  categories: PostCategory[];
  defaultCategory: PostCategory;
  defaultWriteCategory: WritablePostCategory;
  showChatRooms?: boolean;
  showPostList?: boolean;
}