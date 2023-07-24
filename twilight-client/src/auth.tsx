import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/solid'
import { AuthCard } from './components/Auth/AuthCard'
import useSWR from 'swr'
import { fetcher } from './utils'
import { useQuery } from 'react-query'
import DarkModeToggler from './components/Navbar/DarkModeToggler'

export const Auth = () =>{
  const {isLoading, error, data, refetch} = useQuery(["authData"], {queryFn: async()=> (await fetch(`/api/auth/verify`)).json()})
  console.log(data);

  if(data){
    window.location.replace("/")
  }
  else if(!data){
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className='flex flex-row-reverse bg-nord-snow-100 dark:bg-nord-night-200 rounded-md min-h-[400px] drop-shadow-md'>
          <div className='flex flex-col gap-2 text-right p-12'>
            <h1 className='text-8xl'>Twilight</h1>
            <p className='text-nord-frost-200 mt-auto text-xl text-center'>Modern connection with world</p>
            <div className='ml-auto mr-auto'><DarkModeToggler/></div>
          </div>
          <AuthCard refetch={refetch}/>
        </div>
      </div>
    )
  }
  else if(isLoading){
    return(<h1>loading</h1>) 
  }
  else{
    window.location.replace("/error")
  }
}

