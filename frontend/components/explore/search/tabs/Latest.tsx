import SinglePost from '@/components/post/SinglePost/singlePost'
import Loading from '@/shared/loading';
import ScrollTop from '@/shared/ScrollTop';
import { SearchResultProps } from '../searchTabs';

const Latest = ({searchResult,query,isLoading}:{searchResult:SearchResultProps,query:string,isLoading:boolean}) => {
  
  if (isLoading||!searchResult) {
    return (
      <div className="flex justify-center py-4">
        <Loading/>
      </div>
    );
  }
  
  if (searchResult&&searchResult?.latest && !searchResult.latest.length) {
    return (
      <div className="py-10 flex flex-col justify-center items-center">
        <h3 className="text-lg font-bold mb-4">No results for {query}</h3>
        <p className="text-gray-500 text-sm">
          Try searching for something else
        </p>
      </div>
    );
  }

  const tweetList=searchResult.latest
  return (
    <div>
  <ScrollTop/>

    <div>
      {
        tweetList.map((tweet:any) => <SinglePost tweet={tweet} key={tweet.id} />)}
    </div>
  </div>
  )
}

export default Latest