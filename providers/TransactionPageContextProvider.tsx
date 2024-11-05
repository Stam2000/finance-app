import React from "react"


 const ThemeContext = React.createContext({
    expandedRows:new Set(),
    
 })

export const TransactionContext =({children})=>{

    const toggleRowExpanded = (rowId:string)=>{
        const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

        setExpandedRows((prev)=>{
          const newSet = new Set(prev)
          if(newSet.has(rowId)){
            newSet.delete(rowId)
          }else{
            newSet.add(rowId)
          }
    
          return newSet
        })}

        return(
            <ThemeContext.Provider value = {{expandedRows,toggleRowExpanded}} >
                {children}
            </ThemeContext.Provider>
        )

    
}