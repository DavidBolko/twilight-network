import { FC} from "react"
import { CDN } from "../../utils"


const UserCardSkeleton:FC = () =>{
  return(
    <section className="grid grid-cols-userCard gap-2 pt-12">
      <div className="h-[64px] w-[64px] lg:h-[128px] lg:w-[128px] xl:h-[200px] xl:w-[200px] rounded-full bg-twilight-white-300 dark:bg-twilight-dark-300"></div>
      <div className="flex flex-col  justify-evenly text-justify">
        <div className="flex items-center justify-between">
          <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none text-3xl">Loremipsum</span>
        </div>
        <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none text-sm">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint assumenda adipisci voluptas ea, dolores magni excepturi consequuntur nisi pariatur porro architecto culpa iusto earum eaque cum suscipit commodi fugit optio.</span>
      </div>
    </section>
  )
}

export default UserCardSkeleton;