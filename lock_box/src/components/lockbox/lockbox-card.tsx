'use client'

import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Lock, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { LockBoxActions } from './lockbox-actions'

interface LockBoxData {
  owner: PublicKey
  targetAmount: { toString: () => string }
  currentBalance: { toString: () => string }
  createdAt: number
  hasReachedTarget: boolean
  bump: number
}

interface LockBoxCardProps {
  data: LockBoxData
  address: PublicKey
}

export function LockBoxCard({ data, address }: LockBoxCardProps) {
  const targetInSol = parseInt(data.targetAmount.toString()) / LAMPORTS_PER_SOL
  const balanceInSol = parseInt(data.currentBalance.toString()) / LAMPORTS_PER_SOL
  const progressPercentage = (balanceInSol / targetInSol) * 100
  const createdDate = new Date(data.createdAt * 1000)
  const remainingAmount = Math.max(0, targetInSol - balanceInSol)

  return (
    <Card className="w-full transition-shadow hover:shadow-lg">
      <CardContent>
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate">Lock Box</h3>
                {data.hasReachedTarget && (
                  <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Goal Reached!
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {address.toString().slice(0, 8)}...{address.toString().slice(-8)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {balanceInSol.toFixed(4)} / {targetInSol.toFixed(4)} SOL
            </span>
          </div>
          <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{progressPercentage.toFixed(1)}% complete</span>
            {remainingAmount > 0 && (
              <span className="text-muted-foreground">{remainingAmount.toFixed(4)} SOL remaining</span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Current Balance
            </div>
            <div className="text-2xl font-bold">{balanceInSol.toFixed(4)}</div>
            <div className="text-xs text-muted-foreground">SOL</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Target Amount
            </div>
            <div className="text-2xl font-bold">{targetInSol.toFixed(4)}</div>
            <div className="text-xs text-muted-foreground">SOL</div>
          </div>
        </div>

        {/* Actions Section - Integrated */}
        <LockBoxActions data={data} />

        {/* Footer */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Created on {format(createdDate, 'PPP')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
