import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/solid'
import { AuthCard } from './components/AuthCard'
import useSWR from 'swr'
import { fetcher } from './utils'

export const Auth = () =>{
  const { data, isLoading } = useSWR('/api/auth/verify', fetcher)
  console.log(data);

  if(data){
    window.location.replace("/")
  }
  else if(!data){
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-12">
        <div className='flex flex-col gap-2 text-right'>
          <h1 className='text-8xl'>Twilight</h1>
          <p>Connect with world...</p>
        </div>
        <AuthCard/>
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

