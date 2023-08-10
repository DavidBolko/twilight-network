import photo from "../../../public/post.png"
import { useState } from "react";
import { LanguageIcon} from "@heroicons/react/24/solid";
import { useSearchParams } from "react-router-dom";
import PostForm from "../../components/PostForm";
import { DocumentIcon } from "@heroicons/react/24/outline";
import SearchBarNav from "../../components/SearchBarNav";

const CreatePost = () => {
  const [searchParams] = useSearchParams()
  const [type, setType] = useState("textPost");
  const [com, setCom] = useState(searchParams.get("com")!);

  return (
    <>
      <section className="p-6 pt-20">
          <div className="flex gap-2 flex-col p-8 mr-auto ml-auto max-w-[700px] bg-twilight-300 dark:bg-twilight-800 col-start-2 rounded-md shadow-twilight">
            <div className="flex justify-between items-center">
              <h1 className="text-xl">Create a post</h1>
              <img src={photo} className="w-12 h-12 rounded-full object-cover" />
            </div>
            <div className="flex relative gap-2 items-center w-full">
              <SearchBarNav setCom={setCom}/>
              <div className="flex ml-auto gap-2">
                <input name="postType" id="textPost" className="hidden" type="radio" value="textPost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="textPost" className={`${type=="textPost" ? "radio-btn-active":"radio-btn"}`}><LanguageIcon width={24}/></label>
                <input name="postType" id="filePost" className="hidden" type="radio" value="filePost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="filePost" className={`${type=="filePost" ? "radio-btn-active":"radio-btn"}`}><DocumentIcon width={24}/></label>
              </div>
            </div>
            <PostForm com={com} type={type}/>
          </div>
      </section>
    </>
  );
};

export default CreatePost;
