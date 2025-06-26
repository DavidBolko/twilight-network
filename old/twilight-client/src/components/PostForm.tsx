import { FC, useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { FilePondFile } from "filepond";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LanguagesIcon, PaperclipIcon } from "lucide-react";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type props = {
  id: String
}

const PostForm:FC<props> = (props) => {
  const navigate = useNavigate()
  const [filePost, setFilePost] = useState(false);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<FilePondFile[]>([]);

  const createPost = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const form_data = new FormData();
    
    form_data.append("title", title);
    form_data.append("com", props.id.toString());

    if (filePost){
      form_data.append("type", "file");
      form_data.append("file", file[0].file as Blob);
    }
    else 
      form_data.append("text", text);

    const res = await axios.post(`/api/p/create`, form_data);
    if(res.status == 200){
      navigate("/p/"+res.data)
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full" encType="multipart/form-data" onSubmit={createPost}>
      <div className="flex gap-2">
        <label className="hidden">Title</label>
        <input placeholder="Title" name="title" className="form-input-w-svg" onChange={(e) => setTitle(e.target.value)} />
        <input name="postType" id="textPost" className="hidden" type="radio" value="textPost" onChange={()=>setFilePost(false)}/>
        <label htmlFor="textPost" className="radio-btn"><LanguagesIcon width={24}/></label>
        <input name="postType" id="filePost" className="hidden" type="radio" value="filePost" onChange={(e)=>setFilePost(true)}/>
        <label htmlFor="filePost" className="radio-btn-active"><PaperclipIcon width={24}/></label>
      </div>

      {filePost 
        ? <FilePond files={file} onupdatefiles={setFile} allowMultiple={false} required imagePreviewMinHeight={600} name="files" labelIdle='Drag & Drop your image or videos or <span class="filepond--label-action">Browse</span> them.'/>
        : <textarea required placeholder="Writee....." name="text" className="form-input-w-svg resize-none min-h-[300px]" onChange={(e) => setText(e.target.value)} />
      }

      <input type="submit" className="button-colored w-full" />
    </form>
  );
};

export default PostForm;
