import {useRef,useState} from "react"
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog"
import { useGetAccounts } from "../api/use-get-accounts"
import { useCreateAccount } from "../api/use-create-accounts"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { unknown } from "zod"

export const useSelectAccount =():[()=>JSX.Element,()=>Promise<unknown>]=>{
    const accountMutation = useCreateAccount()
    const accountQuery = useGetAccounts()

    const accountOptions = (accountQuery.data ?? []).map((account)=>({
        label:account.name,
        value:account.id
    }))

    const onCreateAccount = (name:string)=> accountMutation.mutate({name})
    
    const [promise,setPromise] = useState<{resolve:(value:string|undefined)=>void}|null>(null)
    const setValue = useRef<string>()

    const confirm = ()=> new Promise((resolve,reject)=>{ setPromise({resolve})})

    const handleClose = ()=>{
        setPromise(null)
    }
    
    const handleConfirm = ()=>{
        promise?.resolve(setValue.current)
        handleClose()
    }

    const handleCancel = ()=>{
        promise?.resolve(undefined)
        handleClose()
    }

    const ComfirmationDialog = ()=>(
        <Dialog open={promise !== null } >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Select Account
                    </DialogTitle>
                    <DialogDescription>
                        Please select an account to continue.
                    </DialogDescription>
                </DialogHeader> 
                <Select 
                    placeholder="Select an Account"
                    options={accountOptions}
                    onCreate={onCreateAccount}
                    onChange={(value)=> setValue.current = value}
                    disabled={accountQuery.isLoading || accountMutation.isPending}
                />
                <DialogFooter className="pt-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    return [ComfirmationDialog,confirm]
}