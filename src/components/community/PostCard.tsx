import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Heart, MoreHorizontal, Edit, Trash2, ChevronDown, MapPin, Calendar, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ProgramDetailsModal from "@/components/ProgramDetailsModal";
import UserAvatar from "@/components/ui/UserAvatar";
import api from "@/interceptor/api";

type Comment = {
	_id?: string;
	username: string;
	text: string;
	images?: string[];
	createdAt?: string;
	avatar?: string;
};

type Post = {
	_id: string;
	userId?: string;
	author: string;
	avatar?: string | null;
	content: string;
	createdAt?: string;
	likes?: string[] | number;
	likesCount?: number;
	userHasLiked?: boolean;
	comments?: Comment[] | number;
	commentsCount?: number;
	images?: string[];
	attachedProgram?: any;
};

interface PostCardProps {
	post: Post;
	index: number;
	currentUser: { id: string, name: string, photo?: string } | null;
	handleLike: (postId: string) => void;
	handleComment: (postId: string, commentImages?: File[]) => void;
	handleDelete: (postId: string) => void;
	handleUpdatePost?: (postId: string, content: string) => void;
	handleUpdateComment?: (postId: string, commentId: string, text: string) => void;
	handleDeleteComment?: (postId: string, commentId: string) => void;
	toggleComments: (postId: string) => void;
	expandedComments: Record<string, boolean>;
	commentDrafts: Record<string, string>;
	setCommentDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	onImageClick: (images: string[], index: number) => void;
	authToken?: string | null;
	apiBase?: string;
}

// Format time to relative format (e.g., "2m ago", "yesterday")
const formatRelativeTime = (dateString?: string): string => {
	if (!dateString) return "";
	try {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays === 1) return "yesterday";
		if (diffDays < 7) return `${diffDays}d ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
		return `${Math.floor(diffDays / 365)}y ago`;
	} catch {
		return "";
	}
};

const getLikesCount = (post: Post): number => {
	// Prioritize likesCount if it's a valid number
	if (typeof post.likesCount === 'number' && post.likesCount >= 0) {
		return post.likesCount;
	}
	// Fallback to array length if likes is an array
	if (Array.isArray(post.likes)) {
		return post.likes.length;
	}
	// Default to 0
	return 0;
};

const getCommentsCount = (post: Post): number => {
	if (post.commentsCount !== undefined) return post.commentsCount;
	if (Array.isArray(post.comments)) return post.comments.length;
	return 0;
};

const PostCard = ({
	post,
	index,
	currentUser,
	handleLike,
	handleComment,
	handleDelete,
	handleUpdatePost,
	handleUpdateComment,
	handleDeleteComment,
	toggleComments,
	expandedComments,
	commentDrafts,
	setCommentDrafts,
	onImageClick,
	authToken,
	apiBase = "https://golden-nile-backend.vercel.app"
}: PostCardProps) => {
	const navigate = useNavigate();

	const getFullImageUrl = (path: string | null | undefined) => {
		if (!path) return null;
		if (path.startsWith("http")) return path;
		return path;
	};

	const [isEditPostOpen, setIsEditPostOpen] = useState(false);
	const [editPostContent, setEditPostContent] = useState(post.content);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editCommentText, setEditCommentText] = useState("");
	const [commentImages, setCommentImages] = useState<File[]>([]);
	const [commentImagePreviews, setCommentImagePreviews] = useState<string[]>([]);

	const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
	const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);

	// Check if current user owns the post - handle both string and ObjectId comparisons
	// Try multiple comparison methods to ensure we catch the match
	const postUserIdStr = post.userId ? String(post.userId).trim() : '';
	const currentUserIdStr = currentUser?.id ? String(currentUser.id).trim() : '';

	// Check if current user owns the post
	const isPostOwner = React.useMemo(() => {
		if (!currentUser || !currentUser.id) {
			return false;
		}

		// Check by userId (primary method) - normalize both to strings
		if (post.userId) {
			const postId = String(post.userId).trim();
			const userId = String(currentUser.id).trim();

			// Direct string comparison
			if (postId === userId) {
				return true;
			}

			// Also try without trim in case of whitespace issues
			if (String(post.userId) === String(currentUser.id)) {
				return true;
			}

			// Try comparing as objects if they're ObjectIds
			if (post.userId === currentUser.id) {
				return true;
			}
		}

		// Fallback: Check by author name (exact match)
		if (post.author && currentUser.name) {
			const postAuthor = post.author.trim();
			const userName = currentUser.name.trim();
			if (postAuthor === userName) {
				return true;
			}
		}

		return false;
	}, [post.userId, post.author, currentUser?.id, currentUser?.name]);

	// Debug logging (remove after testing)
	React.useEffect(() => {
		if (currentUser && post.userId) {
		}
	}, [post._id, post.userId, post.author, currentUser?.id, currentUser?.name, isPostOwner]);

	const isCommentOwner = (comment: Comment) => {
		if (!currentUser || !currentUser.name) return false;
		return comment.username && currentUser.name && comment.username.trim() === currentUser.name.trim();
	};

	const handleEditPost = () => {
		setEditPostContent(post.content);
		setIsEditPostOpen(true);
	};

	const handleSavePost = () => {
		if (handleUpdatePost && editPostContent.trim()) {
			handleUpdatePost(post._id, editPostContent.trim());
			setIsEditPostOpen(false);
		}
	};

	const handleEditComment = (comment: Comment) => {
		setEditingCommentId(comment._id || null);
		setEditCommentText(comment.text);
	};

	const handleSaveComment = (commentId: string) => {
		if (handleUpdateComment && editCommentText.trim()) {
			handleUpdateComment(post._id, commentId, editCommentText.trim());
			setEditingCommentId(null);
			setEditCommentText("");
		}
	};

	const handleDeleteCommentClick = (commentId: string) => {
		if (handleDeleteComment && window.confirm("Are you sure you want to delete this comment?")) {
			handleDeleteComment(post._id, commentId);
		}
	};

	const handleCommentSubmit = () => {
		handleComment(post._id, commentImages);
		// Clear comment images after submission
		setCommentImages([]);
		setCommentImagePreviews([]);
	};

	return (
		<>
			<Card
				className="animate-slide-up hover:shadow-lg transition-shadow"
				style={{ animationDelay: `${index * 100}ms` }}
			>
				<CardContent className="p-6">
					<div className="flex items-start gap-4 mb-4">
						<UserAvatar
							src={post.avatar}
							name={post.author}
							alt={post.author}
							className="w-12 h-12"
						/>
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold">{post.author}</h3>
									<p className="text-sm text-muted-foreground">
										{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
									</p>
								</div>
								{/* Dropdown menu - only visible to post owner */}
								{currentUser && isPostOwner && (
									<div className="relative">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button
													className="p-1.5 hover:bg-muted rounded-full transition-colors flex items-center justify-center min-w-[28px] min-h-[28px] border border-border/30 hover:border-border"
													aria-label="Post options"
													type="button"
													title="Post options"
												>
													<MoreHorizontal className="h-4 w-4 text-foreground" />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-48 z-[100]">
												<DropdownMenuItem onClick={handleEditPost} className="cursor-pointer">
													<Edit className="h-4 w-4 mr-2" />
													Update Post
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleDelete(post._id)} className="text-destructive cursor-pointer focus:text-destructive">
													<Trash2 className="h-4 w-4 mr-2" />
													Delete Post
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								)}
							</div>
						</div>
					</div>

					<p className="mb-4">{post.content}</p>
					{Array.isArray(post.images) && post.images.length > 0 && (
						<div className="mb-4 flex flex-wrap gap-2">
							{post.images.map((src: string, i: number) => (
								<img key={i} src={src} alt="post" className="h-24 w-24 object-cover rounded cursor-pointer" onClick={() => onImageClick(post.images!, i)} />
							))}
						</div>
					)}

					{/* Attached Program Display */}
					{post.attachedProgram && (
						<>
							<div className="mb-4 p-4 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => {
								setSelectedActivityIndex(0);
								setIsProgramModalOpen(true);
							}}>
								<div className="flex items-start gap-3">
									<MapPin className="h-5 w-5 text-primary mt-0.5" />
									<div className="flex-1">
										<h4 className="font-semibold text-sm">{post.attachedProgram.name}</h4>
										<div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												{post.attachedProgram.destination}
											</div>
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{post.attachedProgram.checkInDate} - {post.attachedProgram.checkOutDate}
											</div>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{post.attachedProgram.activities?.length || 0} activities
										</p>
									</div>
								</div>
							</div>

							<ProgramDetailsModal
								program={post.attachedProgram}
								isOpen={isProgramModalOpen}
								onClose={() => setIsProgramModalOpen(false)}
								selectedActivityIndex={selectedActivityIndex}
								setSelectedActivityIndex={setSelectedActivityIndex}
								showDeleteButton={false}
							/>
						</>
					)}

					<div className="flex items-center gap-6 text-muted-foreground">
						<button
							onClick={() => handleLike(post._id)}
							className="flex items-center gap-2 hover:text-primary transition-colors"
						>
							<Heart
								className={`h-5 w-5 ${post.userHasLiked ? "fill-red-500 text-red-500" : ""}`}
							/>
							<span>{getLikesCount(post)}</span>
						</button>
						<button
							onClick={() => toggleComments(post._id)}
							className="flex items-center gap-2 hover:text-primary transition-colors"
						>
							<MessageCircle className="h-5 w-5" />
							<span>{getCommentsCount(post)}</span>
						</button>
					</div>

					{/* Comments Section - Toggleable */}
					{expandedComments[post._id] && (
						<div className="mt-4 space-y-3 pt-4 border-t">
							{/* Existing Comments */}
							{Array.isArray(post.comments) && post.comments.length > 0 && (
								<div className="space-y-3">
									{post.comments.map((comment, idx) => (
										<div key={comment._id || idx} className="flex gap-3 group">
											<div className="flex-1">
												<div className="flex items-center justify-between mb-1">
													<div className="flex items-center gap-2">
														<span className="font-semibold text-sm">{comment.username}</span>
														{comment.createdAt && (
															<span className="text-xs text-muted-foreground">
																{formatRelativeTime(comment.createdAt)}
															</span>
														)}
													</div>
													{/* Dropdown menu - only visible to comment owner */}
													{currentUser && isCommentOwner(comment) && (
														<div className="relative">
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<button
																		className="p-1.5 hover:bg-muted rounded-full transition-colors flex items-center justify-center min-w-[24px] min-h-[24px] border border-border/30 hover:border-border"
																		aria-label="Comment options"
																		type="button"
																		title="Comment options"
																	>
																		<MoreHorizontal className="h-3.5 w-3.5 text-foreground" />
																	</button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end" className="w-48 z-[100]">
																	<DropdownMenuItem onClick={() => handleEditComment(comment)} className="cursor-pointer">
																		<Edit className="h-4 w-4 mr-2" />
																		Update Comment
																	</DropdownMenuItem>
																	<DropdownMenuItem onClick={() => comment._id && handleDeleteCommentClick(comment._id)} className="text-destructive cursor-pointer focus:text-destructive">
																		<Trash2 className="h-4 w-4 mr-2" />
																		Delete Comment
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													)}
												</div>
												{editingCommentId === comment._id ? (
													<div className="space-y-2">
														<Textarea
															value={editCommentText}
															onChange={(e) => setEditCommentText(e.target.value)}
															className="min-h-[60px]"
														/>
														<div className="flex gap-2">
															<Button size="sm" onClick={() => comment._id && handleSaveComment(comment._id)}>
																Save
															</Button>
															<Button size="sm" variant="outline" onClick={() => {
																setEditingCommentId(null);
																setEditCommentText("");
															}}>
																Cancel
															</Button>
														</div>
													</div>
												) : (
													<div>
														<p className="text-sm">{comment.text}</p>
														{comment.images && comment.images.length > 0 && (
															<div className="flex flex-wrap gap-2 mt-2">
																{comment.images.map((src: string, i: number) => (
																	<img
																		key={i}
																		src={src}
																		alt="comment"
																		className="h-16 w-16 object-cover rounded cursor-pointer"
																		onClick={() => onImageClick(comment.images!, i)}
																	/>
																))}
															</div>
														)}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							)}
							{/* Comment Input */}
							<div className="space-y-2">
								{commentImagePreviews.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{commentImagePreviews.map((src, i) => (
											<div key={i} className="relative">
												<img src={src} alt="preview" className="h-12 w-12 object-cover rounded" />
												<button
													onClick={() => {
														setCommentImages(prev => prev.filter((_, idx) => idx !== i));
														setCommentImagePreviews(prev => prev.filter((_, idx) => idx !== i));
													}}
													className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
												>
													×
												</button>
											</div>
										))}
									</div>
								)}
								<div className="flex items-center gap-2">
									<UserAvatar
										src={currentUser?.photo}
										name={currentUser?.name || "User"}
										className="w-8 h-8"
									/>
									<Input
										id={`comment-${post._id}`}
										placeholder="Write a comment..."
										value={commentDrafts[post._id] ?? ""}
										onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												handleCommentSubmit();
											}
										}}
									/>
									<label htmlFor={`comment-image-${post._id}`} className="cursor-pointer">
										<Image className="h-5 w-5 text-muted-foreground hover:text-primary" />
									</label>
									<input
										id={`comment-image-${post._id}`}
										type="file"
										accept="image/*"
										multiple
										className="hidden"
										onChange={(e) => {
											const files = Array.from(e.target.files || []);
											setCommentImages(prev => [...prev, ...files]);
											setCommentImagePreviews(prev => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
										}}
									/>
									<Button onClick={handleCommentSubmit}>Comment</Button>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Dialog open={isEditPostOpen} onOpenChange={setIsEditPostOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Post</DialogTitle>
					</DialogHeader>
					<Textarea
						value={editPostContent}
						onChange={(e) => setEditPostContent(e.target.value)}
						className="min-h-[120px]"
						placeholder="What's on your mind?"
					/>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditPostOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSavePost} disabled={!editPostContent.trim()}>
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default PostCard;