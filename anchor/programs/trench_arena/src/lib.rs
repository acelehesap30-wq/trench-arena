use anchor_lang::prelude::*;

declare_id!("TrenchArena11111111111111111111111111111111");

#[program]
pub mod trench_arena {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("TRENCH ARENA: House Pool Initialized!");
        Ok(())
    }

    pub fn place_deep_needle(
        ctx: Context<PlaceDeepNeedle>, 
        amount: u64, 
        target_drop_percent: u8, 
        leverage: u8
    ) -> Result<()> {
        msg!("TRENCH ARENA: Limit order placed for {} lamports with {}x leverage.", amount, leverage);
        // Kontrat mantığı Aşama 6'da buraya inşa edilecek:
        // 1. Kullanıcıdan Kasaya (Vault) para transferi
        // 2. Pyth fiyatının doğrulanması
        // 3. Tasfiye veya Ödül hesaplaması
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct PlaceDeepNeedle<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // Buraya system_program, kasa hesabı vb. gelecek
}
