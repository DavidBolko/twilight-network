import { Users } from "@phosphor-icons/react"
import { CDN } from "../../utils"
import { useNavigate } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";

type props = {
  author: {
    displayName: string;
  };
  comments: number;
  community?: {
    displayName: string;
    id: string;
    Img: string;
  };
  content: string;
  id: string;
  likeCount: number;
  title?: string;
  userId?: string;
  liked?:boolean,
  refetch: Function
  preview: boolean
};


const TextPost:FC<props> = (props) =>{
  const navigate = useNavigate();

  const likePost = async(id:string) =>{
    const res = await fetch("/api/p/like",{
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id:props.id})
    })
    if(res.ok){
      props.refetch()
    }
  }
  
  return(
    <div className="card">
      <div className="flex items-center gap-2">
        <img src={CDN("898dde0c5e4360f80d790a1a92c18503.jpg")} className="w-12 h-12 rounded-full object-cover" />
        <div className="w-full">
          <p className="font-bold">Title</p>
          <p className="text-xs">{"by " + "TheSillus"}</p>
        </div>
        <a href="" onClick={()=>navigate(`/c/das`)} className="flex items-center self-end text-xs font-normal dark:text-twilight-300 hover:text-moonlight-300 ml-auto">
          <Users width={20} height={20}/>
          Witcher
        </a>
      </div>
      <p className="text-justify">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eius, animi impedit quod optio adipisci harum ad explicabo accusamus praesentium tempora molestiae. Sapiente possimus alias nemo consequatur, earum facere vero sint dolores architecto vitae provident consequuntur facilis. Debitis sit unde dignissimos magnam sunt iste porro? Debitis fuga velit quae quibusdam ipsa et, eveniet consequatur eum sequi, obcaecati hic eos beatae vero aspernatur possimus maxime dolor harum. Blanditiis delectus cupiditate laborum eius praesentium soluta, temporibus corrupti dolorum quos laudantium mollitia omnis excepturi impedit iure aliquam aspernatur saepe vitae repellat odit facilis quasi veritatis laboriosam! Quaerat eveniet, exercitationem accusantium eligendi facilis id perspiciatis! Optio mollitia nisi, impedit neque adipisci incidunt distinctio nemo repellendus veniam totam. Laudantium reprehenderit, cumque quo suscipit maiores ut numquam, cupiditate autem alias, recusandae voluptatibus ex explicabo. Expedita provident obcaecati, officia dolore earum aperiam aspernatur fugit minus similique? Corporis eos deleniti dignissimos quae maxime amet aliquam voluptas odio sunt quis iusto ad, laudantium at totam tempora, ullam id voluptatum dicta sed cumque dolor vel expedita! Expedita iste velit, deleniti, possimus voluptate perspiciatis animi provident blanditiis, quasi necessitatibus illum est architecto alias culpa. Et praesentium sint odit unde rem necessitatibus adipisci quas, provident aliquam, eos mollitia ex ad repellendus, quia voluptate quis atque inventore neque sunt accusamus totam. Aperiam porro laboriosam voluptates doloremque earum cupiditate ipsa deleniti incidunt officiis, non placeat similique, quam delectus perferendis tempore maiores nam unde! Quaerat odit vel deserunt quos facilis in ea sit, cumque, aut optio nostrum! Possimus voluptas expedita totam dolorem repellat error quaerat recusandae voluptates delectus fuga. Repudiandae dolorem provident numquam. Quaerat molestiae recusandae eaque consequatur eum, provident ullam iure autem inventore. Maiores eaque consequuntur nam libero laudantium accusamus velit distinctio quisquam cumque ab delectus adipisci aspernatur animi aperiam, vel sed quasi reprehenderit autem dignissimos? Accusamus inventore quam distinctio, amet corporis dolor dolorem quae expedita fugiat tenetur sapiente, voluptate dolorum odio! Quidem ratione vitae eius praesentium voluptates aperiam ab autem sed explicabo dolorum? Corporis eius unde exercitationem tempore vitae. Sed reprehenderit quam, ea, totam nam illum obcaecati dolor animi tenetur at tempora similique. Nihil architecto accusantium fugit odit rerum officiis excepturi assumenda ex amet cupiditate saepe doloribus corrupti unde, nobis libero cumque vel labore doloremque, ad ipsam possimus consectetur eveniet in dicta. Optio unde repellendus accusamus minima consectetur qui sequi ipsam placeat quibusdam magni voluptatum quos officiis quasi, repudiandae quod, velit pariatur sint. Tempora alias, esse vitae maxime in est nihil nulla enim libero voluptas asperiores illum nemo voluptates unde, quas facilis iste. Repellendus autem porro, voluptatem facilis suscipit ipsum cum deleniti amet repellat qui quaerat ducimus consequatur iure deserunt nemo beatae. Mollitia molestias velit porro nihil architecto. Possimus, delectus velit nobis molestias explicabo exercitationem commodi fuga a aliquid reiciendis suscipit veritatis odit laboriosam quae, enim eum rerum? Sed eius beatae voluptatibus quo, earum illo veniam labore enim illum tempora vero reprehenderit quasi officiis, cum quidem accusantium voluptatum ipsa perspiciatis tenetur voluptate architecto odio doloremque! Nesciunt amet asperiores cupiditate libero consequuntur illo, provident veniam nostrum veritatis nulla alias, exercitationem impedit quod suscipit dicta eos placeat consectetur odit perferendis et officiis repudiandae maiores? Nulla, doloribus eveniet exercitationem recusandae, temporibus quam harum velit soluta quod nostrum asperiores ab unde dicta fugit impedit itaque possimus quaerat iste excepturi corporis ad. Sequi temporibus cum voluptates voluptatum explicabo dolorem nam, quod doloremque quas aspernatur soluta ab cumque fugit assumenda fuga magnam nesciunt atque deserunt reprehenderit delectus sit? Exercitationem magni dolores tenetur nihil repellat. Enim suscipit similique modi ut quis! Nemo dolore a consequuntur corrupti natus eius hic, architecto fugit voluptatem deserunt modi distinctio facilis praesentium quam asperiores quia enim adipisci maiores repellat animi? Quisquam doloribus aliquid a exercitationem qui!</p>
      <div className="flex w-full">
        <div className="flex items-center gap-1 text-xs">
          {props.liked
          ?<button onClick={()=>likePost(props.id)}><HeartIconSolid width={24} height={24} className="text-moonlight-200 dark:text-glow hover:text-moonlight-300"/></button>
          :<button onClick={()=>likePost(props.id)}><HeartIcon width={24} height={24} className="hover:text-moonlight-300"/></button>
          }
          <p>{props.likeCount}</p>
        </div>
        <a href="#" onClick={() => navigate(`/p/${props.id}`)} className="flex ml-auto items-center hover:text-moonlight-200">
          <ChatBubbleOvalLeftIcon width={24} />
          <p className="text-sm">{props.comments}</p>
        </a>
      </div>
    </div>
  )
}

export default TextPost