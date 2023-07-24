import { FC, useState } from "react";
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import { FilePondFile } from "filepond";
import { redirect } from "react-router-dom";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

interface props {
  type: string;
  com: string;
}

const PostForm: FC<props> = (props) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<FilePondFile[]>([]);
  
  const createPost = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const form_data = new FormData();

    if (props.type == "filePost") {
      form_data.append("title", title);
      form_data.append("com", props.com);
      form_data.append("type", props.type);
      form_data.append("file", file[0].file as Blob);
    } else if (props.type == "textPost") {
      form_data.append("title", title);
      form_data.append("com", props.com);
      form_data.append("type", props.type);
      form_data.append("text", text);
    }

    const res = await fetch("/api/p/create", {
      method: "POST",
      body: form_data,
    });
    if (res.ok){
      const data = await res.json()
      window.location.replace("/p/" + data)
    }
  };

  if (props.type == "filePost") {
    return (
      <form
        className="flex flex-col gap-4 w-full"
        encType="multipart/form-data"
        onSubmit={createPost}
      >
        <label className="hidden">Title</label>
        <input
          placeholder="Title"
          name="title"
          className="form-input-w-svg"
          onChange={(e) => setTitle(e.target.value)}
        />

        <FilePond
          files={file}
          onupdatefiles={setFile}
          allowMultiple={false}
          imagePreviewMinHeight={600}
          name="files" /* sets the file input name, it's filepond by default */
          labelIdle='Drag & Drop your image or videos or <span class="filepond--label-action">Browse</span> them.'
        />

        <input type="submit" className="button-colored w-full"/>
      </form>
    );
  }
  return (
    <form
      className="flex flex-col gap-4 w-full"
      encType="multipart/form-data"
      onSubmit={createPost}
    >
      <label className="hidden">Title</label>
      <input
        placeholder="Title"
        name="title"
        className="form-input-w-svg"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Writee....."
        name="text"
        className="form-input-w-svg resize-none min-h-[300px]"
        onChange={(e) => setText(e.target.value)}
      />

      <input type="submit" className="button-colored w-full"/>
    </form>
  );
};

export default PostForm;
