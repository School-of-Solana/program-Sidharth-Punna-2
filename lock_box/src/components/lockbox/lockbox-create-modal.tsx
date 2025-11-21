'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useInitializeLockBox } from './lockbox-data-access'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface LockBoxCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LockBoxCreateModal({ open, onOpenChange }: LockBoxCreateModalProps) {
  const { publicKey } = useWallet()
  const [targetAmount, setTargetAmount] = useState('')
  const initMutation = useInitializeLockBox({ address: publicKey! })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) return

    const amountInSol = parseFloat(targetAmount)
    if (isNaN(amountInSol) || amountInSol <= 0) {
      return
    }

    const amountInLamports = Math.floor(amountInSol * LAMPORTS_PER_SOL)

    initMutation.mutate(
      { targetAmount: amountInLamports },
      {
        onSuccess: () => {
          setTargetAmount('')
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Lock Box</DialogTitle>
            <DialogDescription>
              Set your savings goal. You can withdraw funds once you reach this target amount.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="target">Target Amount (SOL)</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="5.0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                disabled={initMutation.isPending}
              />
              <p className="text-sm text-muted-foreground">Enter the amount of SOL you want to save</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={initMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={initMutation.isPending}>
              {initMutation.isPending && <Spinner />}
              Create Lock Box
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
