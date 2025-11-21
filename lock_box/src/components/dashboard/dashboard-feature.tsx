'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Plus } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useGetLockBox } from '@/components/lockbox/lockbox-data-access'
import { LockBoxCreateModal } from '@/components/lockbox/lockbox-create-modal'
import { LockBoxCard } from '@/components/lockbox/lockbox-card'

export function DashboardFeature() {
  const { publicKey } = useWallet()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: lockbox, isLoading } = useGetLockBox({ address: publicKey! })

  if (!publicKey) {
    return null
  }

  return (
    <div className="w-full space-y-6 py-8">
      {/* Header Card */}
      <Card className="w-full">
        <div className="flex items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">LockBox</CardTitle>
              <CardDescription className="text-base">Meet your saving goals with Lock Box</CardDescription>
            </div>
          </div>
          {!lockbox && !isLoading && (
            <Button size="lg" onClick={() => setIsCreateModalOpen(true)} className="flex-shrink-0">
              <Plus className="mr-2 h-5 w-5" />
              Create Lock Box
            </Button>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      )}

      {/* LockBox Display */}
      {!isLoading && lockbox && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LockBoxCard data={lockbox.data} address={lockbox.address} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !lockbox && (
        <Card className="w-full">
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Lock Box Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Create your first Lock Box to start saving towards your financial goals. Set a target amount and track
              your progress!
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Lock Box
            </Button>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <LockBoxCreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  )
}
