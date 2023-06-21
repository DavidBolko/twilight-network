import Navbar from "../../components/Navbar";
import photo from "../../../public/post.png"
import { useState } from "react";
import { LanguageIcon, PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/solid";

const CreatePost = () => {
  const [type, setType] = useState("picturePost");

  const [title, setTitle] = useState("");
  const [com, setCom] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();

  console.log(type);
  
  const createPost = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const form_data = new FormData();

    if(type=="picturePost" || type =="videoPost"){
      form_data.append("title", title);
      form_data.append("com", com);
      form_data.append("type", type);
      form_data.append("file", file as Blob);
    }
    else if(type == "textPost"){
      form_data.append("title", title);
      form_data.append("com", com);
      form_data.append("type", type);
      form_data.append("text", text);
    }

    for (var [key, value] of form_data.entries()) {
      console.log(key, value);
    }

    await fetch("/api/p/create", {
      method: "POST",
      body: form_data,
    });
  };

  if(type == "picturePost"){
    return (
      <>
        <Navbar />
        <section className="p-6 pt-20">
            <div className="flex gap-2 flex-col p-8 mr-auto ml-auto max-w-[800px] bg-slate-700 col-start-2 rounded-md">
              <div className="flex justify-between items-center">
                <h1 className="text-xl">Create a post</h1>
                <img src={photo} className="w-12 h-12 rounded-full object-cover" />
              </div>
              <div className="flex gap-2">
                <input name="postType" id="picturePost" className="hidden" type="radio" value="picturePost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="picturePost" className="radio-btn-active"><PhotoIcon width={32}/></label>
                <input name="postType" id="textPost" className="hidden" type="radio" value="textPost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="textPost" className="radio-btn"><LanguageIcon width={32}/></label>
                <input name="postType" id="videoPost" className="hidden" type="radio" value="videoPost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="videoPost" className="radio-btn"><VideoCameraIcon width={32}/></label>
              </div>
              <form className="flex flex-col gap-4 w-full" encType="multipart/form-data" onSubmit={createPost}>
                <label className="hidden">Title</label>
                <input placeholder="Title" name="title" className="form-input" onChange={(e)=>setTitle(e.target.value)}/>
                
                <label className="hidden">Community</label>
                <input placeholder="Community" name="com" className="form-input" onChange={(e)=>setCom(e.target.value)}/>

                <input type="file" name="file" onChange={(e)=>setFile(e.target.files![0])}/>
  
                <input type="submit"/>
              </form>
            </div>
        </section>
      </>
    );
  }
  else if(type == "videoPost"){
    return (
      <>
        <Navbar />
        <section className="p-6 pt-20">
            <div className="flex gap-2 flex-col p-8 mr-auto ml-auto max-w-[800px] bg-slate-700 col-start-2 rounded-md">
              <div className="flex justify-between items-center">
                <h1 className="text-xl">Create a post</h1>
                <img src={photo} className="w-12 h-12 rounded-full object-cover" />
              </div>
              <div className="flex gap-2">
                <input name="postType" id="picturePost" className="hidden" type="radio" value="picturePost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="picturePost" className="radio-btn"><PhotoIcon width={32}/></label>
                <input name="postType" id="textPost" className="hidden" type="radio" value="textPost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="textPost" className="radio-btn"><LanguageIcon width={32}/></label>
                <input name="postType" id="videoPost" className="hidden" type="radio" value="videoPost" onChange={(e)=>setType(e.target.value)}/>
                <label htmlFor="videoPost" className="radio-btn-active"><VideoCameraIcon width={32}/></label>
              </div>
              <form className="flex flex-col gap-4 w-full" encType="multipart/form-data" onSubmit={createPost}>
                <label className="hidden">Title</label>
                <input placeholder="Title" name="title" className="form-input" onChange={(e)=>setTitle(e.target.value)}/>

                <label className="hidden">Community</label>
                <input placeholder="Community" name="com" className="form-input" onChange={(e)=>setCom(e.target.value)}/>
  
                <input type="file" name="file" onChange={(e)=>setFile(e.target.files![0])}/>
  
                <input type="submit"/>
              </form>
            </div>
        </section>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <section className="p-6 pt-20">
          <div className="flex gap-2 flex-col p-8 mr-auto ml-auto max-w-[800px] bg-slate-700 col-start-2 rounded-md">
            <div className="flex justify-between items-center">
              <h1 className="text-xl">Create a post</h1>
              <img src={photo} className="w-12 h-12 rounded-full object-cover" />
            </div>
            <div className="flex gap-2">
              <input name="postType" id="picturePost" className="hidden" type="radio" value="picturePost" onChange={(e)=>setType(e.target.value)}/>
              <label htmlFor="picturePost" className="radio-btn"><PhotoIcon width={32}/></label>
              <input name="postType" id="textPost" className="hidden" type="radio" value="textPost" onChange={(e)=>setType(e.target.value)}/>
              <label htmlFor="textPost" className="radio-btn-active"><LanguageIcon width={32}/></label>
              <input name="postType" id="videoPost" className="hidden" type="radio" value="videoPost" onChange={(e)=>setType(e.target.value)}/>
              <label htmlFor="videoPost" className="radio-btn"><VideoCameraIcon width={32}/></label>
            </div>
            <form className="flex flex-col gap-4 w-full" encType="multipart/form-data" onSubmit={createPost}>
              <label className="hidden">Title</label>
              <input placeholder="Title" name="title" className="form-input" onChange={(e)=>setTitle(e.target.value)}/>
              
              <label className="hidden">Community</label>
              <input placeholder="Community" name="com" className="form-input" onChange={(e)=>setCom(e.target.value)}/>

              <label className="hidden">Description</label>
              <textarea placeholder="Writee....." name="text" className="form-input resize-none" onChange={(e)=>setText(e.target.value)}/>
            
              <input type="submit"/>
            </form>
          </div>
      </section>
    </>
  );

  
};

export default CreatePost;
