import { getCategories, getSidebarPostLists } from '@/lib/cms'
import CategoryList from '@/components/widgets/CategoryList'
import RecentPosts from '@/components/widgets/RecentPosts'
import PopularPosts from '@/components/widgets/PopularPosts'

export default async function Sidebar() {
  const [categories, postLists] = await Promise.all([
    getCategories(),
    getSidebarPostLists(),
  ])
  const { recentPosts, popularPosts } = postLists

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
