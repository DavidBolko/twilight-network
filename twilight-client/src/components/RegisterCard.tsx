import { AtSymbolIcon, KeyIcon, UserIcon } from "@heroicons/react/24/solid"
import { FC, useState } from "react"

interface Props{
  toggleCard: Function,
}

export const RegisterCard:FC<Props> = (props) =>{
  const [email, setEmail] = useState("");
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const handleSubmit = async(e: React.SyntheticEvent) =>{
    e.preventDefault();
    const data = {
      Email: email,
      nickName: nickName,
      password: password,
      password2: password2,
    }
    await fetch("/api/auth/signup", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)

    })
  }

  return(
    <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-8 text-lg border-2 bg-slate-800/60 backdrop-blur-sm rounded-md text-center shadow-2xl shadow-indigo-800'>
      <p>Create an account</p>
      <div className='flex border-b-2'>
        <label htmlFor="email" className='hidden'>E-Mail</label>
        <AtSymbolIcon width={20}/>
        <input type="text" name="email" placeholder='JohnDoe@gmail.com' onChange={(e)=>setEmail(e.target.value)}/>
      </div>
      <div className='flex border-b-2'>
        <label htmlFor="email" className='hidden'>Display Name</label>
        <UserIcon width={20}/>
        <input type="text" name="email" placeholder='John Doe' onChange={(e)=>setNickName(e.target.value)}/>
      </div>
      <div className='flex border-b-2'>
        <label htmlFor="password" className='hidden'>Password</label>
        <KeyIcon width={20}/>
        <input type="password" name="password" placeholder='Password' onChange={(e)=>setPassword(e.target.value)}/>
      </div>
      <div className='flex border-b-2'>
        <label htmlFor="password" className='hidden'>Password</label>
        <KeyIcon width={20}/>
        <input type="password" name="password2" placeholder='Repeat password' onChange={(e)=>setPassword2(e.target.value)}/>
      </div>
      <input type="submit"/>
      <div className="text-sm">
        <p>Already have an account?</p>
        <a className="font-bold hover:text-indigo-700 hover:cursor-pointer" onClick={(e)=>props.toggleCard(false)}>Sign In</a>
      </div>
    </form>
  )
}