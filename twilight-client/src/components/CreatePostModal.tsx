import React, {useState, useCallback, type SyntheticEvent} from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, FileTextIcon } from "lucide-react";
import axios from "axios";
import Modal from "./Modal.tsx";
import {useNavigate} from "@tanstack/react-router";

const mediaTypeIcons: React.ReactNode[] = [<ImageIcon />, <FileTextIcon />];
const mediaTypes: string[] = ["images", "text"];

type props = {
    communityId:string;
    setIsOpen: (isOpen: boolean) => void;
    isOpen: boolean;
}

export default function CreatePostModal(props:props){
    const navigate = useNavigate();

    const modalRoot = document.getElementById('modal-root');

    if (!modalRoot) {
        throw new Error("Missing #modal-root in HTML");
    }


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
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            if(result.status === 200){
                await navigate({to: `/post/${result.data.id}`});
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    }

    const commonHeader = (
        <div className="flex  justify-between gap-2">
            <input type="text"  aria-label="Post Title" onChange={(e)=>setTitle(e.target.value)}  placeholder="Post title" className="flex-grow border p-2 rounded w-2/3" />
            <button type="button" onClick={() => setMediaType((mediaType + 1) % mediaTypeIcons.length)}  className="btn" aria-label="Toggle media type">
                {mediaTypeIcons[mediaType]}
            </button>
        </div>
    );
    if(props.isOpen) {
        if (mediaType === 0) {
            return (
                <Modal onClose={() => props.setIsOpen(false)}>
                    <form className="flex gap-2 flex-col" onSubmit={(e) => post(e)}>
                        {commonHeader}

                        <div {...getRootProps()} className="card border-2 text-sm border-tw-border border-dashed min-h-[300px] items-center justify-center cursor-pointer hover:border-tw-primary">
                            <input {...getInputProps()} required={true} />
                            {isDragActive ? (<p>Drop the images here…</p>) : (<p>Drag and drop images here, or click to select files</p>)}
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {images.map((file, idx) => (
                                        <img key={idx} src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="object-cover h-24 w-full rounded"/>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" className="btn primary self-end">Submit</button>
                    </form>
                </Modal>
            );
        } else {
            return (
                <Modal onClose={() => props.setIsOpen(false)}>
                    <form className="flex flex-col gap-2" onSubmit={(e) => post(e)}>
                        {commonHeader}
                        <textarea aria-required={true} aria-label="Post Content" required
                               onChange={(e) => setTextContent(e.target.value)} placeholder="Write something..."
                               className="min-h-[300px]"/>
                        <button type="submit" className="btn primary">Submit</button>
                    </form>
                </Modal>
            );
        }
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