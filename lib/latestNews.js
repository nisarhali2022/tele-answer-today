function shufflePosts(posts) {
  const shuffled = [...posts]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function selectLatestNewsPosts(posts = [], limit = 6) {
  const fixedCount = Math.min(2, limit)
  const fixedPosts = posts.slice(0, fixedCount)
  const randomCount = Math.max(limit - fixedPosts.length, 0)
  const randomPosts = shufflePosts(posts.slice(2)).slice(0, randomCount)

  return [...fixedPosts, ...randomPosts]
}
