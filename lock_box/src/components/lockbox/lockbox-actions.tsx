'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useDeposit, useWithdraw, useEmergencyWithdraw, useCloseLockBox } from './lockbox-data-access'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, MoreVertical, X } from 'lucide-react'

interface LockBoxData {
  targetAmount: { toString: () => string }
  currentBalance: { toString: () => string }
  hasReachedTarget: boolean
}

interface LockBoxActionsProps {
  data: LockBoxData
}

export function LockBoxActions({ data }: LockBoxActionsProps) {
  const { publicKey } = useWallet()
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false)
  const [isCloseOpen, setIsCloseOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const depositMutation = useDeposit({ address: publicKey! })
  const withdrawMutation = useWithdraw({ address: publicKey! })
  const emergencyMutation = useEmergencyWithdraw({ address: publicKey! })
  const closeMutation = useCloseLockBox({ address: publicKey! })

  const balanceInSol = parseInt(data.currentBalance.toString()) / LAMPORTS_PER_SOL

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) return

    const amountInLamports = Math.floor(amount * LAMPORTS_PER_SOL)
    depositMutation.mutate(
      { amount: amountInLamports },
      {
        onSuccess: () => {
          setDepositAmount('')
          setIsDepositOpen(false)
        },
      },
    )
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) return

    const amountInLamports = Math.floor(amount * LAMPORTS_PER_SOL)
    withdrawMutation.mutate(
      { amount: amountInLamports },
      {
        onSuccess: () => {
          setWithdrawAmount('')
          setIsWithdrawOpen(false)
        },
      },
    )
  }

  const handleEmergencyWithdraw = () => {
    emergencyMutation.mutate(undefined, {
      onSuccess: () => {
        setIsEmergencyOpen(false)
      },
    })
  }

  const handleClose = () => {
    closeMutation.mutate(undefined, {
      onSuccess: () => {
        setIsCloseOpen(false)
      },
    })
  }

  return (
    <>
      {/* Unified Actions Section */}
      <div className="flex items-center gap-2">
        {/* Primary Deposit Button */}
        <Button
          size="lg"
          onClick={() => setIsDepositOpen(true)}
          className="flex-1"
          disabled={depositMutation.isPending}
        >
          {depositMutation.isPending ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <ArrowDownToLine className="mr-2 h-4 w-4" />
          )}
          Deposit SOL
        </Button>

        {/* Withdraw Button - Only shown when goal is reached */}
        {data.hasReachedTarget && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsWithdrawOpen(true)}
            className="flex-1"
            disabled={withdrawMutation.isPending}
          >
            {withdrawMutation.isPending ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
            )}
            Withdraw
          </Button>
        )}

        {/* Dropdown Menu for Advanced Actions */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="px-3">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {balanceInSol === 0 && (
                <>
                  <DropdownMenuItem
                    onClick={() => setIsCloseOpen(true)}
                    disabled={closeMutation.isPending}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Close Lock Box
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => setIsEmergencyOpen(true)}
                disabled={emergencyMutation.isPending}
                variant="destructive"
                className="text-destructive focus:text-destructive"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency Withdraw
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent>
          <form onSubmit={handleDeposit}>
            <DialogHeader>
              <DialogTitle>Deposit SOL</DialogTitle>
              <DialogDescription>Add funds to your Lock Box to work towards your savings goal.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="deposit-amount">Amount (SOL)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  disabled={depositMutation.isPending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDepositOpen(false)}
                disabled={depositMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={depositMutation.isPending}>
                {depositMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                Deposit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent>
          <form onSubmit={handleWithdraw}>
            <DialogHeader>
              <DialogTitle>Withdraw SOL</DialogTitle>
              <DialogDescription>
                Withdraw funds from your Lock Box. Available balance: {balanceInSol.toFixed(4)} SOL
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="withdraw-amount">Amount (SOL)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balanceInSol}
                  placeholder="1.0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                  disabled={withdrawMutation.isPending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWithdrawOpen(false)}
                disabled={withdrawMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={withdrawMutation.isPending}>
                {withdrawMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                Withdraw
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Emergency Withdraw Alert Dialog */}
      <AlertDialog open={isEmergencyOpen} onOpenChange={setIsEmergencyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Emergency Withdrawal
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <div>
                  <p>
                    This action cannot be undone. This will withdraw ALL funds ({balanceInSol.toFixed(4)} SOL) from your
                    Lock Box.
                  </p>
                  <p className="font-semibold text-destructive">
                    ⚠️ Warning: The LockBox account will be automatically closed and the rent (~0.002 SOL) will be
                    returned to your wallet.
                  </p>
                  <p>You will need to create a new Lock Box to continue saving.</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={emergencyMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmergencyWithdraw}
              disabled={emergencyMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {emergencyMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Withdraw All Funds
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Lock Box Alert Dialog */}
      <AlertDialog open={isCloseOpen} onOpenChange={setIsCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Lock Box</AlertDialogTitle>
            <AlertDialogDescription>
              This will close your Lock Box account and return the rent (~0.002 SOL) to your wallet. The vault must be
              empty before closing. You can create a new Lock Box anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closeMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} disabled={closeMutation.isPending}>
              {closeMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Close Lock Box
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
