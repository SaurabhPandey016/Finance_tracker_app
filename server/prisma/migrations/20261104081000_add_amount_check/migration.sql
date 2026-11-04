ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_amountMinor_positive"
CHECK ("amountMinor" > 0);
