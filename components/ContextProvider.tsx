"use client"

import React from "react"



export const ThemeContext =React.createContext({
    ip: { "ip": "test" },
    updateIp: (ip:{"ip":string}) => {},
    chatOpen:false,
    toggleChatOpen:()=>{}
})

export const useThemeContext = () => {
    const context = React.useContext(ThemeContext);
    if (context === undefined) {
      throw new Error("useThemeContext must be used within a ThemeProvider");
    }
    return context;
  };

export const ContextProvider =({children}:{children:any})=>{


    const [ip,setIp]= React.useState({"ip":"test"})
    const [chatOpen,setChatOpen] = React.useState(false)

    function updateIp (ip:{"ip":string}){
        setIp(ip)
    }
    function toggleChatOpen(){
        setChatOpen((prev)=>!prev)
    }
    return(<ThemeContext.Provider value={{ip,updateIp,chatOpen,toggleChatOpen}}>
        {children}
    </ThemeContext.Provider>)
}

