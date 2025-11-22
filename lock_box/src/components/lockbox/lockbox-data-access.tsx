'use client'

import { AnchorProvider } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BN } from '@coral-xyz/anchor'
import { toast } from 'sonner'
import { getLockBoxProgram, LOCK_BOX_PROGRAM_ID } from '@/anchor/lock_box_exports'

// Helper function to derive LockBox PDA
function getLockBoxPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('lockbox'), owner.toBuffer()], LOCK_BOX_PROGRAM_ID)
}

// Hook to get Anchor provider
function useAnchorProvider(): AnchorProvider | null {
  const { connection } = useConnection()
  const wallet = useWallet()

  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    return null
  }

  return new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    { commitment: 'confirmed' },
  )
}

interface LockBoxAccount {
  owner: PublicKey
  targetAmount: BN
  currentBalance: BN
  createdAt: BN
  hasReachedTarget: boolean
  bump: number
}

interface LockBoxData {
  data: LockBoxAccount
  address: PublicKey
}

export function useGetLockBox({ address }: { address: PublicKey | null | undefined }) {
  const { connection } = useConnection()
  const provider = useAnchorProvider()

  return useQuery({
    queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    queryFn: async (): Promise<LockBoxData | null> => {
      if (!address || !provider) return null

      try {
        const [lockboxPda] = getLockBoxPda(address)
        const program = getLockBoxProgram(provider)

        const lockboxAccount = await program.account.lockBox.fetch(lockboxPda)

        return {
          data: {
            owner: lockboxAccount.owner,
            targetAmount: lockboxAccount.targetAmount,
            currentBalance: lockboxAccount.currentBalance,
            createdAt: lockboxAccount.createdAt,
            hasReachedTarget: lockboxAccount.hasReachedTarget,
            bump: lockboxAccount.bump,
          },
          address: lockboxPda,
        }
      } catch {
        // Account doesn't exist
        return null
      }
    },
    enabled: !!address && !!provider,
  })
}

export function useInitializeLockBox({ address }: { address: PublicKey | null | undefined }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const provider = useAnchorProvider()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['initialize-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    mutationFn: async (input: { targetAmount: number }) => {
      if (!address || !provider || !wallet.publicKey) {
        throw new Error('Wallet not connected')
      }

      const program = getLockBoxProgram(provider)

      const tx = await program.methods
        .initializeLockbox(new BN(input.targetAmount))
        .accounts({
          owner: address,
        })
        .rpc()

      return tx
    },
    onSuccess: async (tx) => {
      toast.success('Lock Box Created Successfully', {
        description: `Your Lock Box has been initialized. Transaction: ${tx.slice(0, 8)}...`,
      })
      await client.invalidateQueries({
        queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to Create Lock Box', {
        description: error.message || 'An error occurred while initializing your Lock Box. Please try again.',
      })
    },
  })
}

export function useDeposit({ address }: { address: PublicKey | null | undefined }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const provider = useAnchorProvider()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['deposit', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    mutationFn: async (input: { amount: number }) => {
      if (!address || !provider || !wallet.publicKey) {
        throw new Error('Wallet not connected')
      }

      const program = getLockBoxProgram(provider)

      const tx = await program.methods
        .deposit(new BN(input.amount))
        .accounts({
          owner: address,
        })
        .rpc()

      return { tx, amount: input.amount }
    },
    onSuccess: async ({ tx, amount }) => {
      const amountInSol = amount / LAMPORTS_PER_SOL
      toast.success('Deposit Successful', {
        description: `${amountInSol.toFixed(4)} SOL has been deposited to your Lock Box. Transaction: ${tx.slice(0, 8)}...`,
      })
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
    },
    onError: (error: Error) => {
      toast.error('Deposit Failed', {
        description: error.message || 'An error occurred while depositing funds. Please try again.',
      })
    },
  })
}

export function useWithdraw({ address }: { address: PublicKey | null | undefined }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const provider = useAnchorProvider()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['withdraw', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    mutationFn: async (input: { amount: number }) => {
      if (!address || !provider || !wallet.publicKey) {
        throw new Error('Wallet not connected')
      }

      const program = getLockBoxProgram(provider)

      const tx = await program.methods
        .withdraw(new BN(input.amount))
        .accounts({
          owner: address,
        })
        .rpc()

      return { tx, amount: input.amount }
    },
    onSuccess: async ({ tx, amount }) => {
      const amountInSol = amount / LAMPORTS_PER_SOL
      toast.success('Withdrawal Successful', {
        description: `${amountInSol.toFixed(4)} SOL has been withdrawn from your Lock Box. Transaction: ${tx.slice(0, 8)}...`,
      })
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
    },
    onError: (error: Error) => {
      toast.error('Withdrawal Failed', {
        description: error.message || 'An error occurred while withdrawing funds. Please try again.',
      })
    },
  })
}

export function useEmergencyWithdraw({ address }: { address: PublicKey | null | undefined }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const provider = useAnchorProvider()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['emergency-withdraw', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    mutationFn: async () => {
      if (!address || !provider || !wallet.publicKey) {
        throw new Error('Wallet not connected')
      }

      const program = getLockBoxProgram(provider)

      const tx = await program.methods
        .emergencyWithdraw()
        .accounts({
          owner: address,
        })
        .rpc()

      return tx
    },
    onSuccess: async (tx) => {
      toast.success('Emergency Withdrawal Completed', {
        description: `All funds have been withdrawn and your Lock Box has been closed. Transaction: ${tx.slice(0, 8)}...`,
      })
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
    },
    onError: (error: Error) => {
      toast.error('Emergency Withdrawal Failed', {
        description: error.message || 'An error occurred during the emergency withdrawal. Please try again.',
      })
    },
  })
}

export function useCloseLockBox({ address }: { address: PublicKey | null | undefined }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const provider = useAnchorProvider()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['close-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    mutationFn: async () => {
      if (!address || !provider || !wallet.publicKey) {
        throw new Error('Wallet not connected')
      }

      const program = getLockBoxProgram(provider)

      const tx = await program.methods
        .closeLockbox()
        .accounts({
          owner: address,
        })
        .rpc()

      return tx
    },
    onSuccess: async (tx) => {
      toast.success('Lock Box Closed Successfully', {
        description: `Your Lock Box has been closed and rent (~0.002 SOL) has been returned to your wallet. Transaction: ${tx.slice(0, 8)}...`,
      })
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
    },
    onError: (error: Error) => {
      toast.error('Failed to Close Lock Box', {
        description:
          error.message || 'An error occurred while closing your Lock Box. Please ensure it is empty and try again.',
      })
    },
  })
}
