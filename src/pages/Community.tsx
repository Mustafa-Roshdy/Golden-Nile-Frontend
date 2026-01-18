import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Users, Search, MessageCircle, Heart, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/community/PostCard";
import { programApi } from "@/services/api";
import UserAvatar from "@/components/ui/UserAvatar";

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

// Function to decode JWT payload
const decodeToken = (token: string) => {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join("")
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error("Invalid token:", error);
		return null;
	}
};

// Get auth token from cookies (matching the app's auth system)
const getAuthToken = (): string | null => {
	try {
		return Cookies.get("goldenNileToken") || null;
	} catch (_) {
		return null;
	}
};

const apiBase = import.meta?.env?.VITE_API_BASE_URL || "https://golden-nile-backend.vercel.app";

const getFullImageUrl = (path: string | null | undefined) => {
	
	if (!path) return null;
	if (path.startsWith("http")) return path;
	return path;
};


const Community = () => {
	const navigate = useNavigate();
	const [posts, setPosts] = useState<Post[]>([]);
	const [stats, setStats] = useState<{ members: number; stories: number; photos: number }>({ members: 0, stories: 0, photos: 0 });
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
	const [newPostContent, setNewPostContent] = useState<string>("");
	const [newPostFiles, setNewPostFiles] = useState<File[]>([]);
	const [newPostPreviews, setNewPostPreviews] = useState<string[]>([]);
	const [isPosting, setIsPosting] = useState<boolean>(false);
	const [selectedProgram, setSelectedProgram] = useState<any>(null);
	const [userPrograms, setUserPrograms] = useState<any[]>([]);
	const [programModalOpen, setProgramModalOpen] = useState<boolean>(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [currentUser, setCurrentUser] = useState<{ id: string, name: string, photo?: string } | null>(null);
	const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [modalImages, setModalImages] = useState<string[]>([]);
	const [modalIndex, setModalIndex] = useState<number>(0);
	const [allPostsLoaded, setAllPostsLoaded] = useState<boolean>(false);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);
	const [displayedPostsCount, setDisplayedPostsCount] = useState<number>(6);
	const POSTS_PER_PAGE = 6;

	const authToken = useMemo(() => getAuthToken(), []);

	// Check authentication and redirect if not logged in
	useEffect(() => {
		const token = getAuthToken();
		if (!token) {
			navigate("/auth");
			return;
		}

		const payload = decodeToken(token);
		if (!payload || !payload.id) {
			Cookies.remove("goldenNileToken");
			navigate("/auth");
			return;
		}

		setIsAuthenticated(true);

		// Fetch current user profile
		(async () => {
			try {
				if (!payload?.id) return;
				const res = await fetch(`${apiBase}/api/user/${payload.id}`, {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					
					if (data.success && data.data) {
						setCurrentUser({
							id: data.data._id || data.data.id,
							name: `${data.data.firstName} ${data.data.lastName}`,
							photo: data.data.photo
						});
					}
				}
			} catch (e) {
				console.error("Failed to fetch current user:", e);
			}
		})();

		// Fetch user programs for program attachment
		(async () => {
			try {
				const userId = payload?.id;
				if (userId) {
					const resPrograms = await programApi.getProgramsByUser(userId);
					const programs = (resPrograms as any).data || resPrograms;
					setUserPrograms(programs.data || programs);
				}
			} catch (e) {
				console.error("Failed to fetch user programs:", e);
			}
		})();
	}, [navigate, authToken, apiBase]);

	// Fetch posts only if authenticated
	useEffect(() => {
		if (!isAuthenticated) return;

		let isMounted = true;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${apiBase}/api/posts`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
					},
					credentials: "include",
				});
				if (!res.ok) {
					if (res.status === 401) {
						Cookies.remove("goldenNileToken");
						navigate("/auth");
						return;
					}
					throw new Error("Failed to load posts");
				}
				const data = await res.json();
				if (!Array.isArray(data)) throw new Error("Invalid posts payload");
				if (isMounted) {
					const normalized: Post[] = data.map((p: any) => {
						// Resolve Post Author Avatar
						// Priority: p.userId.photo (if populated) -> p.author.photo (if populated) -> p.avatar
						let postAvatar = p.avatar;
						if (p.userId && typeof p.userId === "object" && p.userId.photo) {
							postAvatar = p.userId.photo;
						} else if (p.author && typeof p.author === "object" && p.author.photo) {
							postAvatar = p.author.photo;
						}

						// Normalize Comments
						const comments = Array.isArray(p.comments) ? p.comments.map((c: any) => {
							// Resolve Comment Author Avatar
							// Priority: c.userId.photo (if populated) -> c.user.photo (if populated) -> c.avatar
							let commentAvatar = c.avatar;
							if (c.userId && typeof c.userId === "object" && c.userId.photo) {
								commentAvatar = c.userId.photo;
							} else if (c.user && typeof c.user === "object" && c.user.photo) {
								commentAvatar = c.user.photo;
							}

							return {
								...c,
								avatar: getFullImageUrl(commentAvatar),
								username: c.username || c.user?.name || c.userId?.name || "User"
							};
						}) : [];

						return {
							_id: p._id || p.id,
							userId: p.userId ? (typeof p.userId === "object" ? p.userId._id : String(p.userId)) : undefined,
							author: typeof p.author === "object" ? (p.author.name || p.author.username || "Unknown User") : (p.author || "Unknown User"),
							avatar: getFullImageUrl(postAvatar),
							content: p.content || "",
							createdAt: p.createdAt,
							images: Array.isArray(p.images) ? p.images : [],
							likes: Array.isArray(p.likes) ? p.likes : [],
							likesCount: p.likesCount ?? (Array.isArray(p.likes) ? p.likes.length : 0),
							userHasLiked: p.userHasLiked ?? false,
							comments: comments,
							commentsCount: p.commentsCount ?? comments.length,
							attachedProgram: p.attachedProgram ?? null,
						};
					});
					setPosts(normalized);
					setDisplayedPostsCount(Math.min(6, normalized.length));
					setAllPostsLoaded(normalized.length <= 6);
				}
			} catch (e: any) {
				if (isMounted) {
					if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
						Cookies.remove("goldenNileToken");
						navigate("/auth");
					} else {
						setError(e?.message || "Something went wrong");
					}
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [authToken, isAuthenticated, navigate]);

	// Fetch stats and refresh periodically
	useEffect(() => {
		if (!isAuthenticated) return;
		let timer: number | undefined;
		const loadStats = async () => {
			try {
				const res = await fetch(`${apiBase}/api/stats/community`, { credentials: "include" });
				if (!res.ok) return;
				const s = await res.json();
				setStats({ members: s.members ?? 0, stories: s.stories ?? 0, photos: s.photos ?? 0 });
			} catch { }
		};
		loadStats();
		timer = window.setInterval(loadStats, 30000);
		return () => {
			if (timer) window.clearInterval(timer);
		};
	}, [isAuthenticated]);


	const handleImageClick = (images: string[], index: number) => {
		const reordered = images.slice(index).concat(images.slice(0, index));
		setModalImages(reordered);
		setModalIndex(0);
		setIsModalOpen(true);
	};

	const handleLike = async (postId: string) => {
		if (!isAuthenticated || !authToken) {
			navigate("/auth");
			return;
		}

		const post = posts.find((p) => p._id === postId);
		if (!post) return;

		const wasLiked = post.userHasLiked ?? false;
		const currentLikesCount = post.likesCount ?? (Array.isArray(post.likes) ? post.likes.length : 0);

		// Optimistic update: toggle like state instantly
		setPosts((prev) =>
			prev.map((p) =>
				p._id === postId
					? {
						...p,
						userHasLiked: !wasLiked,
						likesCount: wasLiked ? currentLikesCount - 1 : currentLikesCount + 1,
					}
					: p
			)
		);

		try {
			const res = await fetch(`${apiBase}/api/posts/${postId}/like`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				credentials: "include",
			});
			if (!res.ok) {
				if (res.status === 401) {
					Cookies.remove("goldenNileToken");
					navigate("/auth");
					return;
				}
				throw new Error("Failed to like post");
			}
			const updated = await res.json();
			// Backend returns: { likes: number, userHasLiked: boolean, likesList: string[] }
			// Ensure we get the correct likes count - backend returns 'likes' as the count
			let newLikesCount = currentLikesCount;
			if (typeof updated.likes === 'number') {
				newLikesCount = updated.likes;
			} else if (Array.isArray(updated.likesList)) {
				newLikesCount = updated.likesList.length;
			} else if (Array.isArray(updated.likes)) {
				newLikesCount = updated.likes.length;
			}

			// Force update with the correct count
			setPosts((prev) =>
				prev.map((p) => {
					if (p._id === postId) {
						return {
							...p,
							userHasLiked: updated.userHasLiked !== undefined ? updated.userHasLiked : !wasLiked,
							likesCount: newLikesCount,
							likes: Array.isArray(updated.likesList) ? updated.likesList : (Array.isArray(updated.likes) ? updated.likes : (Array.isArray(p.likes) ? p.likes : [])),
						};
					}
					return p;
				})
			);
			// Refresh stats after like/unlike
			try {
				const resStats = await fetch(`${apiBase}/api/stats/community`, { credentials: "include" });
				if (resStats.ok) {
					const s = await resStats.json();
					setStats({ members: s.members ?? 0, stories: s.stories ?? 0, photos: s.photos ?? 0 });
				}
			} catch { }
		} catch (e: any) {
			// revert optimistic change on error
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
							...p,
							userHasLiked: wasLiked,
							likesCount: currentLikesCount,
						}
						: p
				)
			);
			if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
				Cookies.remove("goldenNileToken");
				navigate("/auth");
			}
		}
	};

	const toggleComments = (postId: string) => {
		setExpandedComments((prev) => ({
			...prev,
			[postId]: !prev[postId],
		}));
	};

	const handleComment = async (postId: string, commentImages?: File[]) => {
		if (!isAuthenticated || !authToken) {
			navigate("/auth");
			return;
		}

		const draft = commentDrafts[postId]?.trim();
		if (!draft && (!commentImages || commentImages.length === 0)) return;

		const post = posts.find((p) => p._id === postId);
		if (!post) return;

		const currentComments = Array.isArray(post.comments) ? post.comments : [];
		const currentCommentsCount = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);

		// Optimistic update: add comment immediately
		const tempComment: Comment = {
			_id: `temp-${Date.now()}`,
			username: "You", // Will be replaced with actual username from backend
			text: draft || "",
			images: commentImages ? commentImages.map((f) => URL.createObjectURL(f)) : [],
			createdAt: new Date().toISOString(),
		};

		setPosts((prev) =>
			prev.map((p) =>
				p._id === postId
					? {
						...p,
						comments: [...currentComments, tempComment],
						commentsCount: currentCommentsCount + 1,
					}
					: p
			)
		);
		setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));

		// Ensure comments section is expanded when adding comment
		if (!expandedComments[postId]) {
			setExpandedComments((prev) => ({ ...prev, [postId]: true }));
		}

		try {
			const form = new FormData();
			form.append("text", draft || "");
			if (commentImages) {
				commentImages.forEach((file) => form.append("images", file));
			}

			const res = await fetch(`${apiBase}/api/posts/${postId}/comment`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				body: form,
				credentials: "include",
			});
			if (!res.ok) {
				if (res.status === 401) {
					Cookies.remove("goldenNileToken");
					navigate("/auth");
					return;
				}
				throw new Error("Failed to comment on post");
			}
			const updated = await res.json();
			// Replace temporary comment with real one from backend
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
							...p,
							comments: [
								...currentComments.filter((c) => !c._id?.startsWith("temp-")),
								updated.newComment || tempComment,
							],
							commentsCount: updated.comments ?? currentCommentsCount + 1,
						}
						: p
				)
			);
		} catch (e: any) {
			// revert optimistic update
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
							...p,
							comments: currentComments,
							commentsCount: currentCommentsCount,
						}
						: p
				)
			);
			if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
				Cookies.remove("goldenNileToken");
				navigate("/auth");
			}
		}
	};

	const handleUpdatePost = async (postId: string, content: string) => {
		if (!isAuthenticated || !authToken) {
			navigate("/auth");
			return;
		}

		try {
			const res = await fetch(`${apiBase}/api/posts/${postId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ content }),
				credentials: "include",
			});
			if (!res.ok) {
				if (res.status === 401) {
					Cookies.remove("goldenNileToken");
					navigate("/auth");
					return;
				}
				throw new Error("Failed to update post");
			}
			const updated = await res.json();
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
							...p,
							content: updated.content,
						}
						: p
				)
			);
		} catch (e: any) {
			console.error("Failed to update post:", e);
			if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
				Cookies.remove("goldenNileToken");
				navigate("/auth");
			}
		}
	};

	const handleUpdateComment = async (postId: string, commentId: string, text: string) => {
		if (!isAuthenticated || !authToken) {
			navigate("/auth");
			return;
		}

		try {
			const res = await fetch(`${apiBase}/api/posts/${postId}/comments/${commentId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ text }),
				credentials: "include",
			});
			if (!res.ok) {
				if (res.status === 401) {
					Cookies.remove("goldenNileToken");
					navigate("/auth");
					return;
				}
				throw new Error("Failed to update comment");
			}
			const updated = await res.json();
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
							...p,
							comments: Array.isArray(p.comments)
								? p.comments.map((c: any) =>
									c._id === commentId ? { ...c, text: updated.text } : c
								)
								: p.comments,
						}
						: p
				)
			);
		} catch (e: any) {
			console.error("Failed to update comment:", e);
			if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
				Cookies.remove("goldenNileToken");
				navigate("/auth");
			}
		}
	};

	const handleDeleteComment = async (postId: string, commentId: string) => {
		if (!isAuthenticated || !authToken) {
			navigate("/auth");
			return;
		}

		try {
			const res = await fetch(`${apiBase}/api/posts/${postId}/comments/${commentId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				credentials: "include",
			});
			if (!res.ok) {
				if (res.status === 401) {
					Cookies.remove("goldenNileToken");
					navigate("/auth");
					return;
				}
				throw new Error("Failed to delete comment");
			}
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
							...p,
							comments: Array.isArray(p.comments)
								? p.comments.filter((c: any) => c._id !== commentId)
								: p.comments,
							commentsCount: (p.commentsCount ?? 0) - 1,
						}
						: p
				)
			);
		} catch (e: any) {
			console.error("Failed to delete comment:", e);
			if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
				Cookies.remove("goldenNileToken");
				navigate("/auth");
			}
		}
	};

	const handleDelete = async (postId: string) => {
		if (!isAuthenticated || !authToken) {
			navigate("/auth");
			return;
		}

		// Optimistic update: remove post immediately
		setPosts((prev) => prev.filter((p) => p._id !== postId));

		try {
			const res = await fetch(`${apiBase}/api/posts/${postId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				credentials: "include",
			});
			if (!res.ok) {
				if (res.status === 401) {
					Cookies.remove("goldenNileToken");
					navigate("/auth");
					return;
				}
				throw new Error("Failed to delete post");
			}
			// Refresh stats after successful deletion
			try {
				const resStats = await fetch(`${apiBase}/api/stats/community`, { credentials: "include" });
				if (resStats.ok) {
					const s = await resStats.json();
					setStats({ members: s.members ?? 0, stories: s.stories ?? 0, photos: s.photos ?? 0 });
				}
			} catch { }
		} catch (e: any) {
			// Revert optimistic update on error
			// Note: Since we removed it, we need to re-fetch posts or add back, but for simplicity, re-fetch posts
			try {
				const res = await fetch(`${apiBase}/api/posts?limit=${POSTS_PER_PAGE}&skip=0`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
					},
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					const normalized: Post[] = data.map((p: any) => ({
						_id: p._id || p.id,
						userId: p.userId,
						author: p.author || "Unknown User",
						avatar: p.avatar ?? null,
						content: p.content || "",
						createdAt: p.createdAt,
						images: Array.isArray(p.images) ? p.images : [],
						likes: Array.isArray(p.likes) ? p.likes : [],
						likesCount: p.likesCount ?? (Array.isArray(p.likes) ? p.likes.length : 0),
						userHasLiked: p.userHasLiked ?? false,
						comments: Array.isArray(p.comments) ? p.comments : [],
						commentsCount: p.commentsCount ?? (Array.isArray(p.comments) ? p.comments.length : 0),
						attachedProgram: p.attachedProgram ?? null,
					}));
					setPosts(normalized);
				}
			} catch { }
			if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
				Cookies.remove("goldenNileToken");
				navigate("/auth");
			}
		}
	};

	const handleLoadMore = () => {
		if (loadingMore || allPostsLoaded) return;
		setLoadingMore(true);
		// Show 6 more posts from the already loaded posts
		setDisplayedPostsCount((prev) => {
			const newCount = prev + 6;
			if (newCount >= filteredPosts.length) {
				setAllPostsLoaded(true);
				return filteredPosts.length;
			}
			return newCount;
		});
		setLoadingMore(false);
	};

	const handleCreatePost = async () => {
		if (!isAuthenticated || !authToken) {
			navigate("/auth");
			return;
		}

		const content = newPostContent.trim();
		if ((!content && newPostFiles.length === 0) || isPosting) return;

		setIsPosting(true);
		setError(null);

		try {
			const form = new FormData();
			form.append("content", content);
			if (selectedProgram) {
				form.append("attachedProgram", selectedProgram._id);
			}
			newPostFiles.forEach((file) => form.append("images", file));
			const res = await fetch(`${apiBase}/api/posts`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				body: form,
				credentials: "include",
			});

			if (!res.ok) {
				if (res.status === 401) {
					Cookies.remove("goldenNileToken");
					navigate("/auth");
					return;
				}
				const errorData = await res.json().catch(() => ({ message: "Failed to create post" }));
				throw new Error(errorData.message || "Failed to create post");
			}

			const newPost = await res.json();
		
			// Add new post to the top of the list instantly
			setPosts((prev) => [
				{
					_id: newPost._id,
					userId: newPost.userId ? String(newPost.userId) : (currentUser?.id ? String(currentUser.id) : undefined),
					author: newPost.author || "Unknown User",
					avatar: newPost.avatar || null,
					content: newPost.content,
					createdAt: newPost.createdAt,
					images: Array.isArray(newPost.images) ? newPost.images : [],
					likes: [],
					likesCount: 0,
					userHasLiked: false,
					comments: [],
					commentsCount: 0,
					attachedProgram: selectedProgram,
				},
				...prev,
			]);
			// Update displayed count if needed
			if (displayedPostsCount < 6) {
				setDisplayedPostsCount(Math.min(6, posts.length + 1));
			}

			// Clear the input
			setNewPostContent("");
			setNewPostFiles([]);
			setNewPostPreviews([]);
			setSelectedProgram(null);
			// Refresh stats immediately
			try {
				const resStats = await fetch(`${apiBase}/api/stats/community`, { credentials: "include" });
				if (resStats.ok) {
					const s = await resStats.json();
					setStats({ members: s.members ?? 0, stories: s.stories ?? 0, photos: s.photos ?? 0 });
				}
			} catch { }
		} catch (e: any) {
			setError(e?.message || "Failed to create post");
			if (e?.message?.includes("401") || e?.message?.includes("unauthorized")) {
				Cookies.remove("goldenNileToken");
				navigate("/auth");
			}
		} finally {
			setIsPosting(false);
		}
	};

	// Derived filtered posts
	const filteredPosts = posts.filter((p) => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return true;
		const author = (p.author || "").toLowerCase();
		const content = (p.content || "").toLowerCase();
		return author.includes(q) || content.includes(q);
	});

	// Display only the first displayedPostsCount posts
	const displayedPosts = filteredPosts.slice(0, displayedPostsCount);

	// Show nothing while checking auth (prevents flash of content)
	if (!isAuthenticated) {
		return null;
	}

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-muted/20 pt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-4xl mx-auto">
						{/* Header */}
						<div className="text-center mb-12 animate-fade-in">
							<h1 className="text-4xl md:text-5xl font-bold mb-4">
								Travel <span className="text-primary">Community</span>
							</h1>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
								Connect with travelers, share experiences, and get inspired for your next Egyptian adventure
							</p>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-6 mb-8 animate-slide-up">
							<Card>
								<CardContent className="p-6 text-center">
									<Users className="h-8 w-8 text-primary mx-auto mb-2" />
									<div className="text-2xl font-bold">{stats.members}</div>
									<div className="text-sm text-muted-foreground">Members</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6 text-center">
									<MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
									<div className="text-2xl font-bold">{stats.stories}</div>
									<div className="text-sm text-muted-foreground">Posts</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6 text-center">
									<Heart className="h-8 w-8 text-primary mx-auto mb-2" />
									<div className="text-2xl font-bold">16</div>
									<div className="text-sm text-muted-foreground">Likes</div>
								</CardContent>
							</Card>
						</div>

						{/* Search */}
						<Card className="mb-8 animate-scale-in">
							<CardContent className="p-6">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
									<Input
										placeholder="Search discussions, travelers, or destinations..."
										className="pl-10"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Create Post */
						}
						<Card className="mb-8 animate-fade-in">
							<CardContent className="p-6">
								<div className="flex items-start gap-4">
									<UserAvatar
										src={getFullImageUrl(currentUser?.photo)}
										name={currentUser?.name || "User"}
										className="w-12 h-12"
									/>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-4">
											<Input
												placeholder="Share your travel experience..."
												className="flex-1"
												value={newPostContent}
												onChange={(e) => setNewPostContent(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter" && !e.shiftKey) {
														e.preventDefault();
														handleCreatePost();
													}
												}}
												disabled={isPosting}
											/>
											<Button onClick={handleCreatePost} disabled={isPosting || (!newPostContent.trim() && newPostFiles.length === 0)}>
												{isPosting ? "Posting..." : "Post"}
											</Button>
											<label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline text-sm">
												uploud Photos
											</label>
											<input
												id="file-upload"
												type="file"
												accept="image/*"
												multiple
												className="hidden"
												onChange={(e) => {
													const files = Array.from(e.target.files || []);
													setNewPostFiles(prev => [...prev, ...files]);
													setNewPostPreviews(prev => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
												}}
											/>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setProgramModalOpen(true)}
												disabled={isPosting}
											>
												<MapPin className="h-4 w-4 mr-1" />
												Attach Program
											</Button>
										</div>
										{newPostPreviews.length > 0 && (
											<div className="flex items-center gap-2 mb-2">
												{newPostPreviews.map((src, i) => (
													<img key={i} src={src} alt="preview" className="h-12 w-12 object-cover rounded" />
												))}
											</div>
										)}
										{selectedProgram && (
											<div className="mb-2 p-3 bg-muted rounded-lg">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<MapPin className="h-4 w-4 text-primary" />
														<div>
															<p className="font-medium text-sm">{selectedProgram.name}</p>
															<p className="text-xs text-muted-foreground">{selectedProgram.destination}</p>
														</div>
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setSelectedProgram(null)}
													>
														×
													</Button>
												</div>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Posts */}
						<div className="space-y-6">
							{loading && (
								<Card className="animate-fade-in">
									<CardContent className="p-6">
										<p>Loading posts...</p>
									</CardContent>
								</Card>
							)}
							{error && (
								<Card className="animate-fade-in">
									<CardContent className="p-6">
										<p className="text-destructive">{error}</p>
									</CardContent>
								</Card>
							)}
							{displayedPosts.length === 0 && (
								<div className="text-center text-destructive">No posts found.</div>
							)}
							{displayedPosts.map((post, index) => (
								<PostCard
									key={post._id}
									post={post}
									index={index}
									currentUser={currentUser ? { ...currentUser, photo: getFullImageUrl(currentUser.photo) } : null}
									handleLike={handleLike}
									handleComment={handleComment}
									handleDelete={handleDelete}
									handleUpdatePost={handleUpdatePost}
									handleUpdateComment={handleUpdateComment}
									handleDeleteComment={handleDeleteComment}
									toggleComments={toggleComments}
									expandedComments={expandedComments}
									commentDrafts={commentDrafts}
									setCommentDrafts={setCommentDrafts}
									onImageClick={handleImageClick}
									authToken={authToken}
									apiBase={apiBase}
								/>
							))}
						</div>

						{/* Load More */}
						{!allPostsLoaded && displayedPostsCount < filteredPosts.length && (
							<div className="text-center mt-8">
								<Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loadingMore}>
									{loadingMore ? "Loading..." : "See More Posts"}
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="max-w-4xl">
					<Carousel>
						<CarouselContent>
							{modalImages.map((src, i) => (
								<CarouselItem key={i}>
									<img src={src} alt="post" className="w-full h-auto max-h-screen object-contain" />
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</DialogContent>
			</Dialog>

			{/* Program Selection Modal */}
			<Dialog open={programModalOpen} onOpenChange={setProgramModalOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Select a Program to Attach</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						{userPrograms.length === 0 ? (
							<div className="text-center py-8">
								<MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground">No programs found. Create a program first from the Trip Planner.</p>
							</div>
						) : (
							userPrograms.map((program) => (
								<Card
									key={program._id}
									className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedProgram?._id === program._id ? 'border-primary bg-primary/5' : ''
										}`}
									onClick={() => {
										setSelectedProgram(program);
										setProgramModalOpen(false);
									}}
								>
									<CardContent className="p-4">
										<div className="flex items-center gap-3">
											<div className="flex-1">
												<h3 className="font-semibold">{program.name}</h3>
												<div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
													<div className="flex items-center gap-1">
														<MapPin className="h-3 w-3" />
														{program.destination}
													</div>
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{program.checkInDate} - {program.checkOutDate}
													</div>
												</div>
												<p className="text-xs text-muted-foreground mt-1">
													{program.activities?.length || 0} activities
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</DialogContent>
			</Dialog>
			<Footer />
		</>
	);
};

export default Community;

