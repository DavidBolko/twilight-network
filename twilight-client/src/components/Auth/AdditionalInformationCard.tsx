const AdditionalInformationCard = () =>{
    return(
        <form onSubmit={handleNext} className="flex flex-col justify-center min-w-[300px] gap-2 p-8 text-lg bg-nord-snow-200 dark:bg-nord-night-300 backdrop-blur-sm rounded-l-md text-center">
        <p>Create an account</p> 
        <button type="submit" className="button-colored w-full">Next</button>
        <div className="text-sm">
          <p>Already have an account?</p>
          <a className="font-bold hover:text-indigo-700 hover:cursor-pointer" onClick={(e) => props.toggleCard(false)}>
            Sign In
          </a>
        </div>
      </form>
    )
}

export default AdditionalInformationCard