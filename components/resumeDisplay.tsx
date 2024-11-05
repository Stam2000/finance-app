
const message = {content:""}


const resumeDisplay = ()=>{
    return(
        <div  className={`word-break p-4 whitespace-pre-wrap break-words shadow-md border-slate-50 border-[1px] ${sender==="user"?"bg-slate-300 max-w-full":"bg-white w-full"  } rounded-xl p-1 overflow-auto ml-3 mr-3 mb-3 `} dangerouslySetInnerHTML={{__html:message.content}} />
    )
}