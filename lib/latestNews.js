function shufflePosts(posts, random = Math.random) {
  const shuffled = [...posts]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function selectLatestNewsPosts(posts = [], limit = 6, random = Math.random) {
  const fixedCount = Math.min(2, limit)
  const fixedPosts = posts.slice(0, fixedCount)
  const randomCount = Math.max(limit - fixedPosts.length, 0)
  const randomPosts = shufflePosts(posts.slice(fixedCount), random).slice(0, randomCount)

  return [...fixedPosts, ...randomPosts]
}

export function selectRandomPosts(posts = [], limit = 5, random = Math.random) {
  return shufflePosts(posts, random).slice(0, Math.max(limit, 0))
}
