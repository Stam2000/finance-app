import { useGetTransaction } from "@/features/transactions/api/use-get-transaction";
import { DataTable } from "./Overviewtable";
import { useOpenTransactionOverview } from "@/features/detailsTransactions/hooks/use-open-Overview";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {columns} from "./columns"



export const TransactionOverview  = ()=> { 
    const {isOpen,id,onClose} = useOpenTransactionOverview()
    const transactionQuery = useGetTransaction(id)

    const transaction = transactionQuery.data
   const data = [transaction]

    return(
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Transaction overview
                        </DialogTitle>
                    </DialogHeader>
                    <DataTable 
                        columns={columns}
                        data={data}
                        disabled={transactionQuery.isLoading}
                    />
                </DialogContent>
                <DialogFooter>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </Dialog> 
        </>
    )

} 