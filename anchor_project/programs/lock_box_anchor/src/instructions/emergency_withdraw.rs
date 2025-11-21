use crate::errors::LockBoxError;
use crate::states::{LockBox, LOCKBOX_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
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

pub fn emergency_withdraw(ctx: Context<EmergencyWithdraw>) -> Result<()> {
    let lockbox = &ctx.accounts.lockbox;

    // Check if vault is still active
    require!(lockbox.is_active, LockBoxError::VaultInactive);

    // Withdraw everything in the vault
    let withdraw_amount = ctx.accounts.vault.lamports();

    // Check if there's anything to withdraw
    require!(withdraw_amount > 0, LockBoxError::InsufficientBalance);

    // Transfer all SOL from vault to owner using CPI with signer seeds
    let lockbox_key = lockbox.key();
    let vault_seeds = &[VAULT_SEED, lockbox_key.as_ref(), &[ctx.bumps.vault]];
    let signer_seeds = &[&vault_seeds[..]];

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.owner.to_account_info(),
        },
        signer_seeds,
    );

    transfer(cpi_context, withdraw_amount)?;

    msg!(
        "⚠️ Emergency withdrawal executed! Withdrawn {} lamports.",
        withdraw_amount
    );
    msg!("The LockBox account is now closed.");

    Ok(())
}
