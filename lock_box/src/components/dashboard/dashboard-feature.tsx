'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
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
      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LockBoxCardSkeleton />
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

function LockBoxCardSkeleton() {
  return (
    <Card className="w-full">
      <CardContent>
        {/* Header Section Skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        {/* Progress Section Skeleton */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        {/* Actions Section Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Skeleton className="h-10 w-full sm:w-32" />
          <Skeleton className="h-10 w-full sm:w-32" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>

        {/* Footer Skeleton */}
        <div className="mt-4 pt-4 border-t">
          <Skeleton className="h-3 w-40" />
        </div>
      </CardContent>
    </Card>
  )
}
