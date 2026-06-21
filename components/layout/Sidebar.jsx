import { getCategories, getLatestPosts, getMostCommentedPosts } from '@/lib/wordpress'
import CategoryList from '@/components/widgets/CategoryList'
import RecentPosts from '@/components/widgets/RecentPosts'
import PopularPosts from '@/components/widgets/PopularPosts'

export default async function Sidebar() {
  const recentPosts = await getLatestPosts(12)
  const [categories, popularPosts] = await Promise.all([
    getCategories(),
    getMostCommentedPosts(5, recentPosts.slice(0, 5)),
  ])

  return (
    <aside className="render-deferred w-full self-start space-y-6 lg:sticky lg:top-20">

      {/* Search */}
      {/* <div className="widget-box">
        <h3 className="section-title">Search</h3>
        <SearchWidget />
      </div> */}

      {/* Recent Posts */}
      <div className="widget-box">
        <h3 className="section-title">Recent Posts</h3>
        <RecentPosts posts={recentPosts} />
      </div>
      {/* Popular Posts */}
      <div className="widget-box">
        <h3 className="section-title">Popular Posts</h3>
        <PopularPosts posts={popularPosts} />
      </div>

      {/* Categories */}
      <div className="widget-box">
        <h3 className="section-title">Categories</h3>
        <CategoryList categories={categories} />
      </div>


    </aside>
  )
}
