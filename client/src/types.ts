import z from "zod";


export type Community = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  members: User[];
  postCount: number;
  communityNightOwlsId: string[];
  creatorId: string;
};

export type FullUser = {
  id: string;
  name: string;
  image?: string;
  posts: PostType[];
  description: string;
  communities: Community[];
  saved: PostType[];
  isElder: boolean;
};
export type SidebarType = {
  ownedCommunities: {
    id: number;
    name: string;
    image?: string | null;
    membersCount: number;
    postsCount: number;
  }[];
  memberCommunities: {
    id: number;
    name: string;
    image?: string | null;
    membersCount: number;
    postsCount: number;
  }[];
  friends: User[];
  chatComingSoon: boolean;
};

export const currentUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatar: z.string().nullable(),
  about: z.string().nullable().optional(),
});

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatar: z.string().nullable(),
  about: z.string().nullable().optional(),
});

export const postSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  text: z.string().nullable(),
  type: z.enum(["Text", "Image", "Link", "Video"]),
  createdAt: z.string(),
  likesCount: z.number(),
  commentsCount: z.number(),
  images: z.array(z.string()),

  isLiked: z.boolean().catch(false),
  isSaved: z.boolean().catch(false),

  author: z.object({
    id: z.string(),
    fullName: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    avatar: z.string().nullable(),
  }),

  community: z
    .object({
      id: z.number(),
      name: z.string(),
      image: z.string().nullable(),
    })
    .nullable(),
});

const TITLE_MAX = 300;
const TEXT_MAX = 2000;
const IMAGES_MAX = 10;
export const createPostSchema = z
  .object({
    title: z.string().max(TITLE_MAX, `Title too long (max ${TITLE_MAX}).`).optional(),
    text: z.string().max(TEXT_MAX, `Text too long (max ${TEXT_MAX}).`).optional(),
    images: z.array(z.instanceof(File)).max(IMAGES_MAX).optional(),
  })
  .refine((d) => (d.images?.length ?? 0) > 0 || d.text?.trim(), {
    message: "Text is required when there are no images.",
    path: ["text"],
  });

export const commentSchema = z.object({
  id: z.number(),
  content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment too long."),
  createdAt: z.string(),
  author: z.object({
    id: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    avatar: z.string().nullable(),
  }),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment too long."),
  postId: z.string(),
});
export const communitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(60),
  description: z.string().max(500).nullable(),
  image: z.string(),
  categoryId: z.number().nullable(),
  categoryName: z.string().nullable(),
  membersCount: z.number(),
  postCount: z.number(),
  canManage: z.boolean(),
  members: z.array(z.object({
    id: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    avatar: z.string().nullable(),
    isNightOwl: z.boolean(),
    isCreator: z.boolean(),
  })),
});
export const createCommunitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(60, "Name is too long."),
  description: z.string().max(500, "Description is too long.").optional(),
  categoryId: z.string().min(1, "Please select a category."),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size is 5MB.")
    .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Only .jpg, .png and .webp formats are supported.")
    .optional(),
});
export const actorSchema = z.object({
  id: z.string(),
  userName: z.string(),
  avatar: z.string().nullable(),
  isElderOwl: z.boolean(),
});

export const notificationSchema = z.object({
  id: z.number(),
  type: z.union([
    z.literal(0).transform(() => "FriendRequest" as const),
    z.literal(1).transform(() => "FriendAccepted" as const),
    z.literal(2).transform(() => "PostLiked" as const),
    z.literal(3).transform(() => "PostComment" as const),
  ]),
  isRead: z.boolean(),
  createdAt: z.string(),
  resourceId: z.string().nullable(),
  actor: actorSchema.nullable(),
});
export const channelParticipantSchema = z.object({
  userId: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatar: z.string().nullable(),
});
export const channelSchema = z.object({
  id: z.number(),
  type: z.union([
    z.literal(0).transform(() => "DIRECT" as const),
    z.literal(1).transform(() => "GROUP" as const),
  ]),
  title: z.string().nullable(),
  lastMessageAt: z.string().nullable(),
  participants: z.array(channelParticipantSchema),
});

export const chatMessageSchema = z.object({
  id: z.number(),
  channelId: z.number(),
  text: z.string().nullable(),
  type: z.number(), 
  createdAt: z.string(),
  senderId: z.string().nullable(),
  senderFirstName: z.string().nullable().optional(),
  senderLastName: z.string().nullable().optional(),
  senderAvatar: z.string().nullable(),
});

export type Channel = z.infer<typeof channelSchema>;
export type ChannelParticipant = z.infer<typeof channelParticipantSchema>;
export type ChatMsg = z.infer<typeof chatMessageSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type PostType = z.infer<typeof postSchema>;
export type Actor = z.infer<typeof actorSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CommentType = z.infer<typeof commentSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommunityType = z.infer<typeof communitySchema>;
export type User = z.infer<typeof userSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;