import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {type SyntheticEvent, useMemo, useState} from "react";
import axios from "axios";

export const Route = createFileRoute('/auth/register')({
    component: Register,
})

function Register(){
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [name, setName] = useState("");

    const quotes = [
        "Your next chapter begins at twilight.",
        "Where moments glow.",
        "Not a feed. A feeling.",
        "Quiet social for loud minds."
    ]
    const quote = useMemo(() => {
        return quotes[Math.floor(Math.random() * quotes.length)];
    }, []);
    const submit = async (e:SyntheticEvent) => {
        e.preventDefault();


        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("password2", password2);

        try {
            const result = await axios.post("http://localhost:8080/api/auth/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            if(result.status === 200){
                await navigate({to:"/auth/login"})
            }
            console.log("Success:", result.data);
        } catch (err) {
            console.error("Error:", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
            <h1 className="text-4xl mb-6 text-center">Create a new account</h1>

            <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-16 items-center justify-center w-full max-w-5xl card rounded-xl p-6">

                <form onSubmit={submit} className="flex flex-col gap-2 w-full max-w-md lg:max-w-sm">
                    <label>Name</label>
                    <input onChange={(e) => setName(e.target.value)} />

                    <label>Email</label>
                    <input onChange={(e) => setEmail(e.target.value)} />

                    <label>Password</label>
                    <input type="password" onChange={(e) => setPassword(e.target.value)} />

                    <label>Retype password</label>
                    <input type="password" onChange={(e) => setPassword2(e.target.value)} />

                    <button type="submit" className="btn primary w-full mt-2">Continue</button>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Already have an accout?</p>
                        <a href="/auth/login" type="submit" className="text-tw-primary hover:text-tw-accent">Please log in.</a>
                    </div>
                </form>

                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
                    <img src="/twilight.png" alt="register illustration" className="max-w-[300px] w-full h-auto object-contain hover:animate-pulse"/>
                    <h2 className="text-lg text-glow">{quote}</h2>
                </div>
            </div>
        </div>
    );
}