import type { CommunityPost, WritablePostCategory } from "@/lib/mock/community";
import type { CreatePostInput } from "@/lib/community/types";

export const WRITE_CATEGORIES: WritablePostCategory[] = [
  "party",
  "question",
  "review",
  "tip",
  "chat",
];

export interface DraftImage {
  id: string;
  previewUrl: string;
  uploadedUrl?: string;
  file?: File;
}

export interface WritePostSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePostInput) => void | Promise<void>;
  initialCategory?: WritablePostCategory;
  editingPost?: CommunityPost | null;
}