import PostCard from './PostCard';

export default function PostGrid({ posts, showDate = true }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-2xl mb-2">📭</p>
        <p className="text-text-secondary text-lg">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showDate={showDate} />
      ))}
    </div>
  );
}
