import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { LockBoxAnchor } from "../target/types/lock_box_anchor";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { assert } from "chai";

describe("LockBox - Solana Savings Vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LockBoxAnchor as Program<LockBoxAnchor>;

  // Test users
  const alice = Keypair.generate();
  const bob = Keypair.generate();
  const charlie = Keypair.generate();

  // Helper function to airdrop SOL
  async function airdrop(address: PublicKey, amount = 10 * LAMPORTS_PER_SOL) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(address, amount),
      "confirmed"
    );
  }

  // Helper function to derive PDAs
  const getLockBoxPda = (ownerPubkey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("lockbox"), ownerPubkey.toBuffer()],
      program.programId
    );
  };

  const getVaultPda = (lockboxPubkey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), lockboxPubkey.toBuffer()],
      program.programId
    );
  };

  // Helper to get account balance
  const getBalance = async (pubkey: PublicKey): Promise<number> => {
    return await provider.connection.getBalance(pubkey);
  };

  // Derive PDAs for test users
  const [aliceLockboxPda] = getLockBoxPda(alice.publicKey);
  const [aliceVaultPda] = getVaultPda(aliceLockboxPda);

  const [bobLockboxPda] = getLockBoxPda(bob.publicKey);
  const [bobVaultPda] = getVaultPda(bobLockboxPda);

  const [charlieLockboxPda] = getLockBoxPda(charlie.publicKey);
  const [charlieVaultPda] = getVaultPda(charlieLockboxPda);

  before(async () => {
    // Setup: Airdrop SOL to test users
    await airdrop(alice.publicKey, 20 * LAMPORTS_PER_SOL);
    await airdrop(bob.publicKey, 20 * LAMPORTS_PER_SOL);
    await airdrop(charlie.publicKey, 20 * LAMPORTS_PER_SOL);
  });

  describe("Initialize LockBox", () => {
    it("✅ Alice creates LockBox with 5 SOL target", async () => {
      const targetAmount = new BN(5 * LAMPORTS_PER_SOL);

      await program.methods
        .initializeLockbox(targetAmount)
        .accounts({
          owner: alice.publicKey,
        })
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      const lockboxAccount = await program.account.lockBox.fetch(
        aliceLockboxPda
      );

      assert.strictEqual(
        lockboxAccount.owner.toString(),
        alice.publicKey.toString(),
        "Owner should be Alice"
      );
      assert.ok(
        lockboxAccount.targetAmount.eq(targetAmount),
        "Target should be 5 SOL"
      );
      assert.ok(
        lockboxAccount.currentBalance.eq(new BN(0)),
        "Initial balance should be 0"
      );
      assert.ok(
        lockboxAccount.createdAt.toNumber() > 0,
        "Should have timestamp"
      );
    });

    it("✅ Bob creates LockBox with 10 SOL target", async () => {
      const targetAmount = new BN(10 * LAMPORTS_PER_SOL);

      await program.methods
        .initializeLockbox(targetAmount)
        .accounts({
          owner: bob.publicKey,
        })
        .signers([bob])
        .rpc({ commitment: "confirmed" });

      const lockboxAccount = await program.account.lockBox.fetch(bobLockboxPda);

      assert.strictEqual(
        lockboxAccount.owner.toString(),
        bob.publicKey.toString(),
        "Owner should be Bob"
      );
      assert.ok(
        lockboxAccount.targetAmount.eq(targetAmount),
        "Target should be 10 SOL"
      );
    });

    it("✅ Charlie creates LockBox with 3 SOL target", async () => {
      const targetAmount = new BN(3 * LAMPORTS_PER_SOL);

      await program.methods
        .initializeLockbox(targetAmount)
        .accounts({
          owner: charlie.publicKey,
        })
        .signers([charlie])
        .rpc({ commitment: "confirmed" });

      const lockboxAccount = await program.account.lockBox.fetch(
        charlieLockboxPda
      );
      assert.ok(
        lockboxAccount.targetAmount.eq(targetAmount),
        "Target should be 3 SOL"
      );
    });

    it("❌ Cannot create LockBox with zero target", async () => {
      const newUser = Keypair.generate();
      await airdrop(newUser.publicKey);
      const [lockboxPda] = getLockBoxPda(newUser.publicKey);

      let flag = "This should fail";
      try {
        await program.methods
          .initializeLockbox(new BN(0))
          .accounts({
            owner: newUser.publicKey,
          })
          .signers([newUser])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed with InvalidTargetAmount");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("InvalidTargetAmount"),
          "Should fail with InvalidTargetAmount error"
        );
      }
      assert.strictEqual(flag, "Failed", "Zero target should fail");
    });

    it("❌ Cannot initialize LockBox twice", async () => {
      const targetAmount = new BN(3 * LAMPORTS_PER_SOL);
      let flag = "This should fail";

      try {
        await program.methods
          .initializeLockbox(targetAmount)
          .accounts({
            owner: alice.publicKey,
          })
          .signers([alice])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed - account already exists");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("already in use") ||
            error.toString().includes("Error"),
          "Should fail with account already exists"
        );
      }
      assert.strictEqual(
        flag,
        "Failed",
        "Duplicate initialization should fail"
      );
    });

    it("❌ Cannot initialize LockBox for someone else", async () => {
      const newUser = Keypair.generate();
      await airdrop(newUser.publicKey);

      let flag = "This should fail";
      try {
        await program.methods
          .initializeLockbox(new BN(5 * LAMPORTS_PER_SOL))
          .accounts({
            owner: newUser.publicKey, // New user's PDA
          })
          .signers([alice]) // But Alice signs
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed with signature mismatch");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("Error"),
          "Should fail with signature error"
        );
      }
      assert.strictEqual(flag, "Failed", "Wrong signer should fail");
    });
  });

  describe("Deposit Functionality", () => {
    it("✅ Alice deposits 2 SOL into her vault", async () => {
      const depositAmount = new BN(2 * LAMPORTS_PER_SOL);

      const vaultBalanceBefore = await getBalance(aliceVaultPda);
      const aliceBalanceBefore = await getBalance(alice.publicKey);

      await program.methods
        .deposit(depositAmount)
        .accounts({
          owner: alice.publicKey,
        })
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      const vaultBalanceAfter = await getBalance(aliceVaultPda);
      const aliceBalanceAfter = await getBalance(alice.publicKey);
      const lockboxAccount = await program.account.lockBox.fetch(
        aliceLockboxPda
      );

      assert.ok(
        lockboxAccount.currentBalance.eq(depositAmount),
        "Balance should be 2 SOL"
      );
      assert.strictEqual(
        vaultBalanceAfter - vaultBalanceBefore,
        depositAmount.toNumber(),
        "Vault should receive 2 SOL"
      );
      assert.ok(
        aliceBalanceAfter < aliceBalanceBefore,
        "Alice's balance should decrease"
      );
    });

    it("✅ Alice deposits another 2 SOL (cumulative 4 SOL)", async () => {
      const depositAmount = new BN(2 * LAMPORTS_PER_SOL);

      const lockboxBefore = await program.account.lockBox.fetch(
        aliceLockboxPda
      );
      const expectedBalance = lockboxBefore.currentBalance.add(depositAmount);

      await program.methods
        .deposit(depositAmount)
        .accounts({
          owner: alice.publicKey,
        })
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      const lockboxAfter = await program.account.lockBox.fetch(aliceLockboxPda);
      assert.ok(
        lockboxAfter.currentBalance.eq(expectedBalance),
        "Should have cumulative 4 SOL"
      );
    });

    it("✅ Bob deposits 6 SOL into his vault", async () => {
      const depositAmount = new BN(6 * LAMPORTS_PER_SOL);

      await program.methods
        .deposit(depositAmount)
        .accounts({
          owner: bob.publicKey,
        })
        .signers([bob])
        .rpc({ commitment: "confirmed" });

      const lockboxAccount = await program.account.lockBox.fetch(bobLockboxPda);
      assert.ok(
        lockboxAccount.currentBalance.eq(depositAmount),
        "Balance should be 6 SOL"
      );
    });

    it("❌ Cannot deposit zero amount", async () => {
      let flag = "This should fail";
      try {
        await program.methods
          .deposit(new BN(0))
          .accounts({
            owner: alice.publicKey,
          })
          .signers([alice])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(
          err.error.errorCode.code,
          "InvalidDepositAmount",
          "Should fail with InvalidDepositAmount"
        );
      }
      assert.strictEqual(flag, "Failed", "Zero deposit should fail");
    });

    it("❌ Cannot deposit with wrong owner signature", async () => {
      const depositAmount = new BN(1 * LAMPORTS_PER_SOL);
      let flag = "This should fail";

      try {
        await program.methods
          .deposit(depositAmount)
          .accounts({
            lockbox: aliceLockboxPda,
            owner: bob.publicKey, // Bob trying to deposit to Alice's vault
            vault: aliceVaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([bob])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("Error"),
          "Should fail with constraint error"
        );
      }
      assert.strictEqual(flag, "Failed", "Wrong owner should fail");
    });

    it("❌ Cannot deposit to non-existent vault", async () => {
      const newUser = Keypair.generate();
      await airdrop(newUser.publicKey);

      let flag = "This should fail";
      try {
        await program.methods
          .deposit(new BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            owner: newUser.publicKey,
          })
          .signers([newUser])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("AccountNotInitialized") ||
            error.toString().includes("Error"),
          "Should fail with AccountNotInitialized"
        );
      }
      assert.strictEqual(flag, "Failed", "Non-existent vault should fail");
    });

    it("❌ Cannot deposit more than user balance", async () => {
      const hugeAmount = new BN("999999999999999999");
      let flag = "This should fail";

      try {
        await program.methods
          .deposit(hugeAmount)
          .accounts({
            owner: alice.publicKey,
          })
          .signers([alice])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        // Should fail due to insufficient lamports
        assert.ok(
          error.toString().includes("Error"),
          "Should fail with insufficient funds"
        );
      }
      assert.strictEqual(flag, "Failed", "Overdraft should fail");
    });
  });

  describe("Withdraw - Before Reaching Target", () => {
    it("❌ Alice cannot withdraw (4 SOL < 5 SOL target)", async () => {
      const lockboxAccount = await program.account.lockBox.fetch(
        aliceLockboxPda
      );

      // Verify target not reached
      assert.ok(
        lockboxAccount.currentBalance.lt(lockboxAccount.targetAmount),
        "Should not have reached target yet"
      );

      let flag = "This should fail";
      try {
        await program.methods
          .withdraw(new BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            owner: alice.publicKey,
          })
          .signers([alice])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(
          err.error.errorCode.code,
          "TargetNotReached",
          "Should fail with TargetNotReached"
        );
      }
      assert.strictEqual(flag, "Failed", "Withdraw before target should fail");
    });

    it("❌ Bob cannot withdraw (6 SOL < 10 SOL target)", async () => {
      let flag = "This should fail";
      try {
        await program.methods
          .withdraw(new BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            owner: bob.publicKey,
          })
          .signers([bob])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(
          err.error.errorCode.code,
          "TargetNotReached",
          "Should fail with TargetNotReached"
        );
      }
      assert.strictEqual(flag, "Failed", "Withdraw before target should fail");
    });
  });

  describe("Reach Target and Withdraw", () => {
    it("✅ Alice deposits 1 more SOL to reach 5 SOL target", async () => {
      const depositAmount = new BN(1 * LAMPORTS_PER_SOL);

      await program.methods
        .deposit(depositAmount)
        .accounts({
          owner: alice.publicKey,
        })
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      const lockboxAccount = await program.account.lockBox.fetch(
        aliceLockboxPda
      );
      assert.ok(
        lockboxAccount.currentBalance.gte(lockboxAccount.targetAmount),
        "Should have reached target"
      );
    });

    it("✅ Alice can now withdraw 2 SOL after reaching target", async () => {
      const withdrawAmount = new BN(2 * LAMPORTS_PER_SOL);

      const vaultBalanceBefore = await getBalance(aliceVaultPda);
      const aliceBalanceBefore = await getBalance(alice.publicKey);
      const lockboxBefore = await program.account.lockBox.fetch(
        aliceLockboxPda
      );

      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          owner: alice.publicKey,
        })
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      const vaultBalanceAfter = await getBalance(aliceVaultPda);
      const aliceBalanceAfter = await getBalance(alice.publicKey);
      const lockboxAfter = await program.account.lockBox.fetch(aliceLockboxPda);

      assert.ok(
        lockboxAfter.currentBalance.eq(
          lockboxBefore.currentBalance.sub(withdrawAmount)
        ),
        "Balance should decrease by 2 SOL"
      );
      assert.strictEqual(
        vaultBalanceBefore - vaultBalanceAfter,
        withdrawAmount.toNumber(),
        "Vault should lose 2 SOL"
      );
      assert.ok(
        aliceBalanceAfter > aliceBalanceBefore,
        "Alice should receive SOL"
      );
    });

    it("✅ Alice can withdraw multiple times after reaching target", async () => {
      const withdrawAmount = new BN(1 * LAMPORTS_PER_SOL);

      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          owner: alice.publicKey,
        })
        .signers([alice])
        .rpc({ commitment: "confirmed" });

      const lockboxAccount = await program.account.lockBox.fetch(
        aliceLockboxPda
      );
    });

    it("❌ Cannot withdraw more than current balance", async () => {
      const lockboxAccount = await program.account.lockBox.fetch(
        aliceLockboxPda
      );
      const excessiveAmount = lockboxAccount.currentBalance.add(new BN(1000));

      let flag = "This should fail";
      try {
        await program.methods
          .withdraw(excessiveAmount)
          .accounts({
            owner: alice.publicKey,
          })
          .signers([alice])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(
          err.error.errorCode.code,
          "InsufficientBalance",
          "Should fail with InsufficientBalance"
        );
      }
      assert.strictEqual(flag, "Failed", "Overdraft should fail");
    });

    it("❌ Cannot withdraw from someone else's vault", async () => {
      let flag = "This should fail";
      try {
        await program.methods
          .withdraw(new BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            lockbox: bobLockboxPda, // Bob's vault
            owner: alice.publicKey, // Alice trying to withdraw
            vault: bobVaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([alice])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("Error"),
          "Should fail with seeds constraint error"
        );
      }
      assert.strictEqual(flag, "Failed", "Unauthorized withdrawal should fail");
    });
  });

  describe("Emergency Withdraw", () => {
    it("✅ Charlie executes emergency withdrawal (3 SOL in vault, 3 SOL target)", async () => {
      // First deposit some funds (but don't reach target)
      await program.methods
        .deposit(new BN(2 * LAMPORTS_PER_SOL))
        .accounts({
          owner: charlie.publicKey,
        })
        .signers([charlie])
        .rpc({ commitment: "confirmed" });

      const lockboxBefore = await program.account.lockBox.fetch(
        charlieLockboxPda
      );
      const vaultBalanceBefore = await getBalance(charlieVaultPda);
      const charlieBalanceBefore = await getBalance(charlie.publicKey);

      assert.ok(
        lockboxBefore.currentBalance.gt(new BN(0)),
        "Should have balance"
      );

      await program.methods
        .emergencyWithdraw()
        .accounts({
          owner: charlie.publicKey,
        })
        .signers([charlie])
        .rpc({ commitment: "confirmed" });

      const vaultBalanceAfter = await getBalance(charlieVaultPda);
      const charlieBalanceAfter = await getBalance(charlie.publicKey);

      // Verify lockbox account is closed after emergency withdrawal
      try {
        await program.account.lockBox.fetch(charlieLockboxPda);
        assert.fail(
          "LockBox account should be closed after emergency withdrawal"
        );
      } catch (error) {
        assert.ok(
          error.message.includes("Account does not exist"),
          "LockBox should not exist after emergency withdrawal"
        );
      }

      assert.strictEqual(
        vaultBalanceBefore - vaultBalanceAfter,
        lockboxBefore.currentBalance.toNumber(),
        "All funds should be withdrawn"
      );
      assert.ok(
        charlieBalanceAfter > charlieBalanceBefore,
        "Charlie should receive funds"
      );
    });

    it("❌ Cannot deposit to closed account after emergency", async () => {
      let flag = "This should fail";
      try {
        await program.methods
          .deposit(new BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            owner: charlie.publicKey,
          })
          .signers([charlie])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("AccountNotInitialized") ||
            error.toString().includes("Account does not exist") ||
            error.toString().includes("Error"),
          "Should fail because account is closed"
        );
      }
      assert.strictEqual(
        flag,
        "Failed",
        "Deposit to closed account should fail"
      );
    });

    it("❌ Cannot withdraw from closed account", async () => {
      let flag = "This should fail";
      try {
        await program.methods
          .withdraw(new BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            owner: charlie.publicKey,
          })
          .signers([charlie])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("AccountNotInitialized") ||
            error.toString().includes("Account does not exist") ||
            error.toString().includes("Error"),
          "Should fail because account is closed"
        );
      }
      assert.strictEqual(
        flag,
        "Failed",
        "Withdraw from closed account should fail"
      );
    });

    it("❌ Cannot perform emergency withdrawal twice", async () => {
      let flag = "This should fail";
      try {
        await program.methods
          .emergencyWithdraw()
          .accounts({
            owner: charlie.publicKey,
          })
          .signers([charlie])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("AccountNotInitialized") ||
            error.toString().includes("Account does not exist") ||
            error.toString().includes("Error"),
          "Should fail because account is closed"
        );
      }
      assert.strictEqual(flag, "Failed", "Double emergency should fail");
    });

    it("❌ Cannot emergency withdraw with zero balance", async () => {
      const emptyUser = Keypair.generate();
      await airdrop(emptyUser.publicKey);
      const [lockboxPda] = getLockBoxPda(emptyUser.publicKey);
      const [vaultPda] = getVaultPda(lockboxPda);

      // Create lockbox but don't deposit
      await program.methods
        .initializeLockbox(new BN(5 * LAMPORTS_PER_SOL))
        .accounts({
          owner: emptyUser.publicKey,
        })
        .signers([emptyUser])
        .rpc({ commitment: "confirmed" });

      let flag = "This should fail";
      try {
        await program.methods
          .emergencyWithdraw()
          .accounts({
            owner: emptyUser.publicKey,
          })
          .signers([emptyUser])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(
          err.error.errorCode.code,
          "InsufficientBalance",
          "Should fail with InsufficientBalance"
        );
      }
      assert.strictEqual(
        flag,
        "Failed",
        "Emergency with zero balance should fail"
      );
    });

    it("❌ Cannot emergency withdraw from someone else's vault", async () => {
      let flag = "This should fail";
      try {
        await program.methods
          .emergencyWithdraw()
          .accounts({
            lockbox: bobLockboxPda, // Bob's vault
            owner: alice.publicKey, // Alice trying to emergency withdraw
            vault: bobVaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([alice])
          .rpc({ commitment: "confirmed" });

        assert.fail("Should have failed");
      } catch (error) {
        flag = "Failed";
        assert.ok(
          error.toString().includes("Error"),
          "Should fail with authorization error"
        );
      }
      assert.strictEqual(flag, "Failed", "Unauthorized emergency should fail");
    });
  });

  describe("Edge Cases", () => {
    it("✅ Can set very large target amount", async () => {
      const richUser = Keypair.generate();
      await airdrop(richUser.publicKey);
      const [lockboxPda] = getLockBoxPda(richUser.publicKey);

      const hugeTarget = new BN(1_000_000).mul(new BN(LAMPORTS_PER_SOL));

      await program.methods
        .initializeLockbox(hugeTarget)
        .accounts({
          owner: richUser.publicKey,
        })
        .signers([richUser])
        .rpc({ commitment: "confirmed" });

      const lockboxAccount = await program.account.lockBox.fetch(lockboxPda);
      assert.ok(
        lockboxAccount.targetAmount.eq(hugeTarget),
        "Should handle large targets"
      );
    });

    it("✅ Multiple deposits accumulate correctly", async () => {
      const testUser = Keypair.generate();
      await airdrop(testUser.publicKey, 15 * LAMPORTS_PER_SOL);
      const [lockboxPda] = getLockBoxPda(testUser.publicKey);
      const [vaultPda] = getVaultPda(lockboxPda);

      await program.methods
        .initializeLockbox(new BN(5 * LAMPORTS_PER_SOL))
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Deposit multiple small amounts
      for (let i = 0; i < 5; i++) {
        await program.methods
          .deposit(new BN(0.5 * LAMPORTS_PER_SOL))
          .accounts({
            owner: testUser.publicKey,
          })
          .signers([testUser])
          .rpc({ commitment: "confirmed" });
      }

      const lockboxAccount = await program.account.lockBox.fetch(lockboxPda);
      assert.ok(
        lockboxAccount.currentBalance.eq(new BN(2.5 * LAMPORTS_PER_SOL)),
        "Should accumulate 2.5 SOL from 5 deposits"
      );
    });
  });

  describe("Close LockBox", () => {
    it("✅ Close LockBox successfully when vault is empty", async () => {
      const testUser = Keypair.generate();
      await airdrop(testUser.publicKey, 10 * LAMPORTS_PER_SOL);
      const [lockboxPda] = getLockBoxPda(testUser.publicKey);
      const [vaultPda] = getVaultPda(lockboxPda);

      // Create lockbox
      await program.methods
        .initializeLockbox(new BN(5 * LAMPORTS_PER_SOL))
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Get balance before closing
      const balanceBefore = await getBalance(testUser.publicKey);

      // Close the lockbox (vault is empty, so this should work)
      await program.methods
        .closeLockbox()
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Get balance after closing
      const balanceAfter = await getBalance(testUser.publicKey);

      // Verify lockbox account is closed
      try {
        await program.account.lockBox.fetch(lockboxPda);
        assert.fail("LockBox account should be closed");
      } catch (error) {
        assert.ok(
          error.message.includes("Account does not exist"),
          "LockBox should not exist after closing"
        );
      }

      // Verify rent was returned (balance should increase)
      assert.ok(
        balanceAfter > balanceBefore,
        "Rent should be returned to owner"
      );

      console.log("  ✅ LockBox closed and rent returned");
    });

    it("❌ Cannot close LockBox with funds in vault", async () => {
      const testUser = Keypair.generate();
      await airdrop(testUser.publicKey, 10 * LAMPORTS_PER_SOL);
      const [lockboxPda] = getLockBoxPda(testUser.publicKey);
      const [vaultPda] = getVaultPda(lockboxPda);

      // Create lockbox
      await program.methods
        .initializeLockbox(new BN(5 * LAMPORTS_PER_SOL))
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Deposit some funds
      await program.methods
        .deposit(new BN(2 * LAMPORTS_PER_SOL))
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Try to close - should fail because vault has funds
      try {
        await program.methods
          .closeLockbox()
          .accounts({
            owner: testUser.publicKey,
          })
          .signers([testUser])
          .rpc({ commitment: "confirmed" });
        assert.fail("Should not be able to close with funds in vault");
      } catch (error) {
        assert.ok(
          error.message.includes("InsufficientBalance"),
          "Should throw InsufficientBalance error"
        );
      }

      console.log("  ✅ Correctly prevented closing with funds in vault");
    });

    it("✅ Close after reaching goal and withdrawing all funds", async () => {
      const testUser = Keypair.generate();
      await airdrop(testUser.publicKey, 10 * LAMPORTS_PER_SOL);
      const [lockboxPda] = getLockBoxPda(testUser.publicKey);
      const [vaultPda] = getVaultPda(lockboxPda);

      // Create lockbox
      await program.methods
        .initializeLockbox(new BN(3 * LAMPORTS_PER_SOL))
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Deposit to reach goal
      await program.methods
        .deposit(new BN(3 * LAMPORTS_PER_SOL))
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Withdraw all funds
      await program.methods
        .withdraw(new BN(3 * LAMPORTS_PER_SOL))
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Close the lockbox
      await program.methods
        .closeLockbox()
        .accounts({
          owner: testUser.publicKey,
        })
        .signers([testUser])
        .rpc({ commitment: "confirmed" });

      // Verify account is closed
      try {
        await program.account.lockBox.fetch(lockboxPda);
        assert.fail("LockBox account should be closed");
      } catch (error) {
        assert.ok(
          error.message.includes("Account does not exist"),
          "LockBox should not exist after closing"
        );
      }

      console.log("  ✅ Successfully closed after normal withdrawal");
    });

    it("❌ Cannot close someone else's LockBox", async () => {
      const owner = Keypair.generate();
      const attacker = Keypair.generate();
      await airdrop(owner.publicKey, 10 * LAMPORTS_PER_SOL);
      await airdrop(attacker.publicKey, 10 * LAMPORTS_PER_SOL);
      const [lockboxPda] = getLockBoxPda(owner.publicKey);
      const [vaultPda] = getVaultPda(lockboxPda);

      // Owner creates lockbox
      await program.methods
        .initializeLockbox(new BN(5 * LAMPORTS_PER_SOL))
        .accounts({
          owner: owner.publicKey,
        })
        .signers([owner])
        .rpc({ commitment: "confirmed" });

      // Attacker tries to close owner's lockbox
      try {
        await program.methods
          .closeLockbox()
          .accounts({
            lockbox: lockboxPda,
            owner: attacker.publicKey,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([attacker])
          .rpc({ commitment: "confirmed" });
        assert.fail("Should not allow closing someone else's LockBox");
      } catch (error) {
        assert.ok(
          error.message.includes("ConstraintSeeds") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("has_one"),
          "Should fail authorization check"
        );
      }

      // Verify lockbox still exists
      const lockboxAccount = await program.account.lockBox.fetch(lockboxPda);
      assert.ok(lockboxAccount, "LockBox should still exist");

      console.log("  ✅ Correctly prevented unauthorized close");
    });
  });

  describe("Complete User Journey", () => {
    it("✅ Full savings journey: create, save, reach goal, withdraw", async () => {
      const saver = Keypair.generate();
      await airdrop(saver.publicKey, 20 * LAMPORTS_PER_SOL);
      const [lockboxPda] = getLockBoxPda(saver.publicKey);
      const [vaultPda] = getVaultPda(lockboxPda);

      console.log("  📦 Step 1: Create LockBox with 10 SOL goal");
      await program.methods
        .initializeLockbox(new BN(10 * LAMPORTS_PER_SOL))
        .accounts({
          owner: saver.publicKey,
        })
        .signers([saver])
        .rpc({ commitment: "confirmed" });

      console.log("  💰 Step 2: First deposit - 3 SOL");
      await program.methods
        .deposit(new BN(3 * LAMPORTS_PER_SOL))
        .accounts({
          owner: saver.publicKey,
        })
        .signers([saver])
        .rpc({ commitment: "confirmed" });

      console.log("  💰 Step 3: Second deposit - 4 SOL");
      await program.methods
        .deposit(new BN(4 * LAMPORTS_PER_SOL))
        .accounts({
          owner: saver.publicKey,
        })
        .signers([saver])
        .rpc({ commitment: "confirmed" });

      console.log("  💰 Step 4: Third deposit - 3 SOL");
      await program.methods
        .deposit(new BN(3 * LAMPORTS_PER_SOL))
        .accounts({
          owner: saver.publicKey,
        })
        .signers([saver])
        .rpc({ commitment: "confirmed" });

      let lockboxAccount = await program.account.lockBox.fetch(lockboxPda);
      assert.ok(
        lockboxAccount.currentBalance.gte(lockboxAccount.targetAmount),
        "Should have reached 10 SOL target"
      );
      console.log("  🎯 Target reached! 10 SOL saved");

      console.log("  ✅ Step 5: Withdraw 10 SOL");
      await program.methods
        .withdraw(new BN(10 * LAMPORTS_PER_SOL))
        .accounts({
          owner: saver.publicKey,
        })
        .signers([saver])
        .rpc({ commitment: "confirmed" });

      lockboxAccount = await program.account.lockBox.fetch(lockboxPda);

      assert.ok(
        lockboxAccount.currentBalance.eq(new BN(0)),
        "Should have 0 SOL remaining"
      );

      console.log("  ✅ Step 6: Close LockBox");
      await program.methods
        .closeLockbox()
        .accounts({
          owner: saver.publicKey,
        })
        .signers([saver])
        .rpc({ commitment: "confirmed" });

      console.log("  ✨ Journey complete! Goal achieved and funds withdrawn.");
    });
  });
});
