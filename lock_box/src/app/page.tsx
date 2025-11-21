'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/solana/solana-provider'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Wallet } from 'lucide-react'
import { DashboardFeature } from '@/components/dashboard/dashboard-feature'

export default function Page() {
  const { publicKey } = useWallet()

  if (publicKey) {
    return <DashboardFeature />
  }

  return (
    <div className="container mx-auto py-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wallet />
          </EmptyMedia>
          <EmptyTitle>No Wallet Connected</EmptyTitle>
          <EmptyDescription>Connect your wallet to to start using the LockBox.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <WalletButton />
        </EmptyContent>
      </Empty>
    </div>
  )
}
