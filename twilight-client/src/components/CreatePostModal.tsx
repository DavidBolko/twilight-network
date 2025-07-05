import React, {useState, useCallback, type SyntheticEvent} from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, FileTextIcon } from "lucide-react";
import axios from "axios";

const mediaTypeIcons: React.ReactNode[] = [<ImageIcon />, <FileTextIcon />];
const mediaTypes: string[] = ["images", "text"];

type props = {
    communityId:string;
}

export default function CreatePostModal(props:props){
    const [mediaType, setMediaType] = useState(0);
    const [images, setImages] = useState<File[]>([]);
    const [title, setTitle] = useState<string>("");
    const [textContent, setTextContent] = useState<string>("");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setImages((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({accept: { "image/*": [] }, onDrop, multiple: true,});

    const post = async(e:SyntheticEvent) =>{
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", mediaTypes[mediaType]);
        images.forEach((file) => {
            formData.append("images", file);
        });
        formData.append("text", textContent);

        console.log(formData.get("images"))
        try {
            const result = await axios.post(`http://localhost:8080/api/p/${props.communityId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Upload success:", result.data);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    }

    const commonHeader = (
        <div className="flex items-center justify-between gap-2">
            <input type="text"  aria-label="Post Title" onChange={(e)=>setTitle(e.target.value)}  placeholder="Post title" className="flex-grow border p-2 rounded" />
            <button onClick={() => setMediaType((mediaType + 1) % mediaTypeIcons.length)}  className="text-gray-600 hover:text-black" aria-label="Toggle media type">
                {mediaTypeIcons[mediaType]}
            </button>
        </div>
    );

    if (mediaType === 0) {
        return (
            <form onSubmit={(e)=>post(e)} className="flex flex-col gap-3 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 bg-white rounded-xl shadow-md w-full max-w-md">
                {commonHeader}

                <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-6 rounded text-center cursor-pointer bg-gray-50">
                    <input {...getInputProps()} />
                    {isDragActive ? (<p>Drop the images here…</p>) : (<p>Drag and drop images here, or click to select files</p>)}

                    {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((file, idx) => (
                                <img key={idx} src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="object-cover h-24 w-full rounded"/>
                            ))}
                        </div>
                    )}
                </div>
                <button type="submit">Submit</button>
            </form>
        );
    } else {
        return (
            <form onSubmit={(e)=>post(e)} className="flex flex-col gap-3 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4 bg-white rounded-xl shadow-md w-full max-w-md">
                {commonHeader}
                <input type="text" aria-label="Post Content" required={true} onChange={(e)=>setTextContent(e.target.value)} placeholder="Write something..." className="w-full border p-2 rounded"/>
                <button type="submit">Submit</button>
            </form>
        );
    }
}


/*
export default function CreatePostModal() {
    const [modal, setModal] = React.useState(false)
    const [mediaType, setMediaType] = React.useState(0);

    if(mediaType === 0){
        return(
            <div className="flex flex-col gap-2 fixed top-50 z-50 p-2 bg-red-500">
                <div>
                    <input type="text" aria-label="Title" placeholder="Title"/>
                    <button onClick={() => setMediaType((mediaType + 1) % mediaTypeIcons.length)} className="text-gray-600 hover:text-black" aria-label="Zmeniť typ média">
                        {mediaTypeIcons[mediaType]}
                    </button>
                </div>
                <input type="text" aria-label="Content"/>
            </div>
        )
    } else {
        return(
            <div className="flex flex-col gap-2 fixed top-50 z-50 p-2 bg-red-500">
                <div>
                    <input type="text" aria-label="Title" placeholder="Title"/>
                    <button onClick={() => setMediaType((mediaType + 1) % mediaTypeIcons.length)} className="text-gray-600 hover:text-black" aria-label="Zmeniť typ média">
                        {mediaTypeIcons[mediaType]}
                    </button>
                </div>
                <input type="text" aria-label="Content" placeholder="T"/>
            </div>
        )
    }

}
 */