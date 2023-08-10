import Navbar from "../../components/Navbar";
import photo from "../../../public/post.jpg"
import { useState } from "react";

const CreateCommunity = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [image, setImage] = useState<File>();


    const createCom = async(e: React.SyntheticEvent) =>{
        e.preventDefault();
        const data = {
          title: title,
          desc: desc,
          image: image
        }

        const form_data = new FormData()
        form_data.append('title', title)
        form_data.append('desc', desc)
        form_data.append('avatar', image as Blob)

        for (var [key, value] of form_data.entries()) { 
          console.log(key, value);
        }

        await fetch("/api/c/create", {
          method: "POST",

          body: form_data
        })
      }
  
    return (
    <>
      <Navbar img="default.svg"/>
      <section className="p-6 pt-20">
          <div className="flex gap-8 flex-col p-8 mr-auto ml-auto max-w-[800px] bg-twilight-300 dark:bg-twilight-700 shadow-twilight col-start-2 rounded-md">
            <div className="flex justify-between items-center">
              <h1 className="text-xl">Create a community</h1>
              <img src={photo} className="w-12 h-12 rounded-full object-cover" />
            </div>
            <form className="flex flex-col gap-4 w-full" encType="multipart/form-data" onSubmit={createCom}>
              <label className="hidden">Title</label>
              <input placeholder="Title" name="title" className="form-input-w-svg" onChange={(e)=>setTitle(e.target.value)}/>

              <label className="hidden">Description</label>
              <textarea placeholder="Describe your community..." name="desc" className="form-input-w-svg resize-none" onChange={(e)=>setDesc(e.target.value)}/>

              <label>Community Photo</label>
              <input type="file" name="avatar" onChange={(e)=>setImage(e.target.files![0])}/>

              <input type="submit" className="button-colored w-full"/>
            </form>
          </div>
      </section>
    </>
  );
};

export default CreateCommunity;
