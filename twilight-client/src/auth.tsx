import { AuthCard } from './components/Auth/AuthCard'
import { useQuery } from 'react-query'
import DarkModeToggler from './components/Navbar/DarkModeToggler'
import axios from 'axios'

export const Auth = () =>{
  const {error, data, refetch} = useQuery(["authData"], {queryFn: async()=> axios.get(`/api/auth/verify`), retry:false})
  console.log(data);

  if(!data){
    return (
      <div className="flex flex-col md:p-4 h-screen">
        <div className='flex flex-col sm:flex-row-reverse m-auto  bg-twilight-100 dark:bg-twilight-800 dark:shadow-glow rounded-md min-h-[400px] shadow-twilight'>
          <div className='flex flex-col gap-2 text-right p-12'>
            <h1 className='text-6xl md:text-8xl dark:text-white text-twilight-600 dark:text-glow text-center'>Twilight</h1>
            <p className='dark:text-twilight-white-300 text-twilight-400 mt-auto text-xl text-center'>Modern connection with world</p>
            <div className='ml-auto mr-auto'><DarkModeToggler/></div>
          </div>
          <AuthCard refetch={refetch}/>
        </div>
      </div>
    )
  }
  else if(error){
    return(
      <h1>error</h1>
    )
  }
  return(
    window.location.replace("/")
  )
}
