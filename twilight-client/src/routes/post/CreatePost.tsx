import photo from "../../../public/post.png"
import { useEffect, useState} from "react";
import { useNavigate, useParams} from "react-router-dom";
import PostForm from "../../components/PostForm";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

type apiData = {
  data:{
    community:{
      name: string
    }
  }
}

const CreatePost = () => {
  const navigate = useNavigate()
  const {id} = useParams()

  const { error, data } = useQuery<apiData, AxiosError>({
    queryFn: async() => await axios.get(`/api/c/` + id),
    retry:false
  });

  if(error){
    navigate("/")
  }
  
  return (
    <>
      <section className="p-6 pt-20">
          <div className="flex gap-2 flex-col p-8 mr-auto ml-auto max-w-[700px] bg-twilight-300 dark:bg-twilight-800 col-start-2 rounded-md shadow-twilight">
            <div className="flex justify-between items-center">
              <h1 className="text-xl">Create a post - {data?.data.community.name}</h1>
              <img src={photo} className="w-12 h-12 rounded-full object-cover" />
            </div>
            <PostForm id={id!}/>
          </div>
      </section>
    </>
  );
};

export default CreatePost;
