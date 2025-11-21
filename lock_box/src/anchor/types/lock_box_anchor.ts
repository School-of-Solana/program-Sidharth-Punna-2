/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lock_box_anchor.json`.
 */
export type LockBoxAnchor = {
  address: 'FkFyFob5oYm4Q9aukvK1ttXduveWh16HYmhCvMXyw6tr'
  metadata: {
    name: 'lockBoxAnchor'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'closeLockbox'
      docs: ['Close the LockBox account and reclaim rent (vault must be empty)']
      discriminator: [249, 5, 46, 49, 123, 1, 211, 26]
      accounts: [
        {
          name: 'lockbox'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [108, 111, 99, 107, 98, 111, 120]
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
          relations: ['lockbox']
        },
        {
          name: 'vault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [118, 97, 117, 108, 116]
              },
              {
                kind: 'account'
                path: 'lockbox'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: []
    },
    {
      name: 'deposit'
      docs: ['Deposit SOL into the LockBox vault']
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182]
      accounts: [
        {
          name: 'lockbox'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [108, 111, 99, 107, 98, 111, 120]
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
          relations: ['lockbox']
        },
        {
          name: 'vault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [118, 97, 117, 108, 116]
              },
              {
                kind: 'account'
                path: 'lockbox'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        },
      ]
    },
    {
      name: 'emergencyWithdraw'
      docs: ['Emergency withdrawal - withdraws all funds but deactivates the vault permanently']
      discriminator: [239, 45, 203, 64, 150, 73, 218, 92]
      accounts: [
        {
          name: 'lockbox'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [108, 111, 99, 107, 98, 111, 120]
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
          relations: ['lockbox']
        },
        {
          name: 'vault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [118, 97, 117, 108, 116]
              },
              {
                kind: 'account'
                path: 'lockbox'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: []
    },
    {
      name: 'initializeLockbox'
      docs: ['Initialize a new LockBox vault with a target amount']
      discriminator: [246, 70, 73, 242, 138, 236, 46, 130]
      accounts: [
        {
          name: 'lockbox'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [108, 111, 99, 107, 98, 111, 120]
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'targetAmount'
          type: 'u64'
        },
      ]
    },
    {
      name: 'withdraw'
      docs: ['Withdraw SOL from the LockBox vault (only when target is reached)']
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34]
      accounts: [
        {
          name: 'lockbox'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [108, 111, 99, 107, 98, 111, 120]
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
          relations: ['lockbox']
        },
        {
          name: 'vault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [118, 97, 117, 108, 116]
              },
              {
                kind: 'account'
                path: 'lockbox'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        },
      ]
    },
  ]
  accounts: [
    {
      name: 'lockBox'
      discriminator: [146, 255, 195, 118, 40, 186, 40, 119]
    },
  ]
  errors: [
    {
      code: 6000
      name: 'invalidTargetAmount'
      msg: 'Target amount must be greater than zero'
    },
    {
      code: 6001
      name: 'invalidDepositAmount'
      msg: 'Deposit amount must be greater than zero'
    },
    {
      code: 6002
      name: 'targetNotReached'
      msg: 'Target not reached yet. Current balance is below the target amount.'
    },
    {
      code: 6003
      name: 'vaultInactive'
      msg: 'This vault has been deactivated and is no longer accessible'
    },
    {
      code: 6004
      name: 'unauthorized'
      msg: 'Unauthorized: Only the owner can perform this action'
    },
    {
      code: 6005
      name: 'insufficientBalance'
      msg: 'Insufficient balance in vault for withdrawal'
    },
  ]
  types: [
    {
      name: 'lockBox'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'owner'
            type: 'pubkey'
          },
          {
            name: 'targetAmount'
            type: 'u64'
          },
          {
            name: 'currentBalance'
            type: 'u64'
          },
          {
            name: 'createdAt'
            type: 'i64'
          },
          {
            name: 'isActive'
            type: 'bool'
          },
          {
            name: 'hasReachedTarget'
            type: 'bool'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
  ]
}
