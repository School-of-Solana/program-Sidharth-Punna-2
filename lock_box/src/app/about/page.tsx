import { GradualSpacing } from '@/components/ui/gradual-spacing-test'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Target, Wallet, Shield, Zap, Code, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      {/* Title with GradualSpacing */}
      <div className="mb-8 text-center">
        <GradualSpacing
          text="LockBox"
          className="text-4xl md:text-6xl font-bold mb-4"
          duration={0.6}
          delayMultiple={0.05}
        />
        <p className="text-xl text-muted-foreground mt-4">
          A decentralized savings application built on Solana blockchain
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {/* Hero Card - Spans 2 columns */}
        <Card className="md:col-span-2 lg:row-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Project Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed text-base">
              LockBox is a Solana-based decentralized application (dApp) that helps users achieve their savings goals
              through a secure, transparent, and trustless savings mechanism. Built on the Solana blockchain, LockBox
              leverages smart contracts to ensure your funds are safely locked until you reach your target savings goal.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              Whether you're saving for a specific purchase, building an emergency fund, or working towards a financial
              milestone, LockBox provides a disciplined approach to saving by preventing premature withdrawals until
              your goal is achieved.
            </p>
          </CardContent>
        </Card>

        {/* Key Features - Combined Card */}
        <Card className="md:col-span-2 lg:col-span-2 group hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Goal-Based Saving</h3>
                    <p className="text-xs text-muted-foreground">
                      Set a target amount and track your progress as you deposit funds towards your goal.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Secure Storage</h3>
                    <p className="text-xs text-muted-foreground">
                      Your funds are stored in a Program Derived Address (PDA) vault, secured by Solana's blockchain.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                    <Lock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Disciplined Saving</h3>
                    <p className="text-xs text-muted-foreground">
                      Withdrawals are only allowed once you've reached your target amount, helping you stay committed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                    <Wallet className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Easy Management</h3>
                    <p className="text-xs text-muted-foreground">
                      Simple interface to create, deposit, and manage your LockBox with just a few clicks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Use - Large Card spanning 2 columns */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">How to Use LockBox</CardTitle>
                <CardDescription>Follow these simple steps to start saving</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Connect Your Wallet</h3>
                    <p className="text-xs text-muted-foreground">
                      Connect your Solana wallet (like Phantom or Solflare) to get started.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Create a LockBox</h3>
                    <p className="text-xs text-muted-foreground">
                      Set your savings target amount. This is the goal you want to reach before withdrawing funds.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Deposit SOL</h3>
                    <p className="text-xs text-muted-foreground">
                      Make deposits into your LockBox whenever you want. Track your progress as you get closer to your
                      goal.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Reach Your Goal</h3>
                    <p className="text-xs text-muted-foreground">
                      Once your balance reaches or exceeds your target amount, you can withdraw your funds.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-destructive">!</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Emergency Withdrawal</h3>
                    <p className="text-xs text-muted-foreground">
                      In case of emergencies, you can use the emergency withdrawal feature, which closes your LockBox
                      but allows you to access all funds immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
