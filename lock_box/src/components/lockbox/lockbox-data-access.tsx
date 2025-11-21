'use client'

import { AnchorProvider } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BN } from '@coral-xyz/anchor'
import { getLockBoxProgram, LOCK_BOX_PROGRAM_ID } from '@/anchor/lock_box_exports'

// Helper function to derive LockBox PDA
function getLockBoxPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('lockbox'), owner.toBuffer()], LOCK_BOX_PROGRAM_ID)
}

// Helper function to derive Vault PDA
function getVaultPda(lockbox: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('vault'), lockbox.toBuffer()], LOCK_BOX_PROGRAM_ID)
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
      } catch (error) {
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
      const [lockboxPda] = getLockBoxPda(address)

      const tx = await program.methods
        .initializeLockbox(new BN(input.targetAmount))
        .accounts({
          lockbox: lockboxPda,
          owner: address,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc()

      return tx
    },
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
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
      const [lockboxPda] = getLockBoxPda(address)
      const [vaultPda] = getVaultPda(lockboxPda)

      const tx = await program.methods
        .deposit(new BN(input.amount))
        .accounts({
          lockbox: lockboxPda,
          vault: vaultPda,
          owner: address,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc()

      return tx
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
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
      const [lockboxPda] = getLockBoxPda(address)
      const [vaultPda] = getVaultPda(lockboxPda)

      const tx = await program.methods
        .withdraw(new BN(input.amount))
        .accounts({
          lockbox: lockboxPda,
          vault: vaultPda,
          owner: address,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc()

      return tx
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
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
      const [lockboxPda] = getLockBoxPda(address)
      const [vaultPda] = getVaultPda(lockboxPda)

      const tx = await program.methods
        .emergencyWithdraw()
        .accounts({
          lockbox: lockboxPda,
          vault: vaultPda,
          owner: address,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc()

      return tx
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
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
      const [lockboxPda] = getLockBoxPda(address)
      const [vaultPda] = getVaultPda(lockboxPda)

      const tx = await program.methods
        .closeLockbox()
        .accounts({
          lockbox: lockboxPda,
          owner: address,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc()

      return tx
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['get-lockbox', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
        }),
      ])
    },
  })
}
