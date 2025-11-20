use crate::errors::LockBoxError;
use crate::states::{LockBox, LOCKBOX_SEED, VAULT_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseLockBox<'info> {
    #[account(
        mut,
        seeds = [LOCKBOX_SEED, owner.key().as_ref()],
        bump = lockbox.bump,
        has_one = owner @ LockBoxError::Unauthorized,
        close = owner
    )]
    pub lockbox: Account<'info, LockBox>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is the PDA that holds the SOL
    #[account(
        mut,
        seeds = [VAULT_SEED, lockbox.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn close_lockbox(ctx: Context<CloseLockBox>) -> Result<()> {
    let vault_balance = ctx.accounts.vault.lamports();

    // Check if there are any funds left in the vault
    require!(vault_balance == 0, LockBoxError::InsufficientBalance);

    msg!("LockBox closed successfully. Rent lamports returned to owner.");

    Ok(())
}
