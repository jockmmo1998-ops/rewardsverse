-- Additive migration: support Binance withdrawals without removing legacy values from existing rows.
ALTER TABLE `withdrawals`
  MODIFY COLUMN `cryptoType` enum('bitcoin','ethereum','usdt_trc20','usdt_erc20','solana','litecoin','dogecoin','binance') NOT NULL;
