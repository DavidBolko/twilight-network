import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useState} from "react";
import axios from "axios";

export const Route = createFileRoute('/communities/create')({
    component: CreateCommunity,
})

function CreateCommunity() {
    const navigate = useNavigate()

    const [title, setTitle] = useState("");
    const [, setDesc] = useState("");
    const [image, setImage] = useState<File>();

    const [error, setError] = useState("");

    const createCom = async(e: React.SyntheticEvent) =>{
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", title);
        formData.append("image", image as Blob);

        const result = await axios.post("http://localhost:8080/api/c/create", formData, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        if(result.status === 201) {
            await navigate({
                to: `/communities/${result.data.id}`,
                params: {id: result.data.id.toString()},
            });
        } else {
            setError(result.statusText);
        }
    }

    return(
        <section className="p-6 pt-20">
            <div className="flex gap-8 flex-col p-8 mr-auto ml-auto max-w-[800px] bg-twilight-300 dark:bg-twilight-700 shadow-twilight col-start-2 rounded-md">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl">Create a community</h1>
                </div>
                <form className="flex flex-col gap-4 w-full" encType="multipart/form-data" onSubmit={createCom}>
                    <div className="flex gap-2 w-full items-center">
                        <label className="hidden">Title</label>
                        <input placeholder="Title" name="title" className={`${error.includes("Name") ? "outline outline-red-600" : ""}`} onChange={(e)=>setTitle(e.target.value)}/>
                    </div>

                    <label className="hidden">Description</label>
                    <textarea placeholder="Describe your community..." name="desc" className="form-input resize-none" onChange={(e)=>setDesc(e.target.value)}/>

                    <label>Community Photo</label>
                    <input type="file" name="avatar" onChange={(e)=>setImage(e.target.files![0])}/>

                    <input type="submit" className="btn primary w-full"/>
                </form>
            </div>
        </section>
    );
}