# 🌐 Reverse Auction Smart Contract

![Solidity](https://img.shields.io/badge/Solidity-^0.8.0-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-Development-orange)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![License](https://img.shields.io/badge/License-MIT-green)

A **reverse auction** smart contract built using **Solidity** and **Hardhat**, where **multiple winners** are selected based on the **lowest submitted bids**. Rewards are distributed automatically, and unused funds are refunded to the auction creator.

---

# 📦 Features

| Feature | Description |
|--------|-------------|
| 🎯 **Multiple Winners** | Auction creator sets `N` winners |
| 💰 **Reward Pool Locking** | Creator deposits `N × M` ETH at creation |
| 📉 **Reverse Bidding** | Lowest bids win (not highest) |
| 🔍 **Bid Validation** | Rejects bids above max bid and duplicate bidders |
| 🧮 **Deterministic Sorting** | Sorts bids and selects lowest `N` |
| 🎁 **Reward Distribution** | All winners get the **highest winning bid** |
| 🔄 **Automatic Refunds** | Remaining funds returned to the owner |
| 🧪 **Fully Tested** | Includes Hardhat test suite (8 passing cases) |

---

# 🧱 System Architecture (ASCII Diagram)

```
                 ┌───────────────────────────┐
                 │   Auction Creation         │
                 │  (N, M, biddingTime, ETH)  │
                 └───────────────┬───────────┘
                                 │
                                 ▼
                     ┌────────────────────┐
                     │   Bidding Phase    │
                     │   placeBid(value)  │
                     └─────────┬──────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   End Auction         │
                    │  (after time expiry)  │
                    └──────────┬────────────┘
                               │
                               ▼
                 ┌─────────────────────────────────┐
                 │ Sort Bids → Select N Lowest     │
                 │ Determine highestWinningBid      │
                 └─────────────────┬───────────────┘
                                   │
                                   ▼
                 ┌─────────────────────────────────┐
                 │ Distribute Rewards to Winners    │
                 │ Refund Remaining to Owner        │
                 └─────────────────────────────────┘
```

---

# 📁 Project Structure

```
blockchain-assignment/
├── contracts/
│   └── ReverseAuction.sol
├── scripts/
│   ├── deploy.js
│   └── demo.js
├── test/
│   └── ReverseAuction.test.js
├── hardhat.config.js
├── package.json
└── README.md
```

---

# ⚙️ Installation

```bash
git clone https://github.com/yourusername/blockchain-assignment.git
cd blockchain-assignment
npm install
```

---

# 🧪 Running Tests

Run the full Hardhat test suite:

```bash
npx hardhat test
```

Expected output:

```
ReverseAuction
  ✔ Should set the right owner and lock the reward pool
  ✔ Should accept bids from participants
  ✔ Should not accept bids higher than max bid
  ✔ Should not allow the same bidder to place multiple bids
  ✔ Should not allow ending the auction before the bidding time is over
  ✔ Should determine winners correctly and distribute rewards
  ✔ Should refund remaining funds to owner
  ✔ Should not end auction if not enough bidders

8 passing (1s)
```

---

# 🎬 Demo Walkthrough

A complete demonstration of the auction lifecycle.

---

## ▶️ Step 1: Deploy the Contract

```bash
npx hardhat run scripts/deploy.js --network hardhat
```

Expected output:

```
ReverseAuction deployed to: 0x5FbDB...
Auction will end at...
Number of winners: 3
Max bid: 1.0 ETH
Reward pool: 3.0 ETH
```

---

## ▶️ Step 2: Run Demo Script

```bash
npx hardhat run scripts/demo.js --network hardhat
```

Example output:

```
Placing bids...
Bidder1: 0.5 ETH
Bidder2: 0.7 ETH
Bidder3: 0.9 ETH
Bidder4: 1.0 ETH
Bidder5: 0.8 ETH

=== AUCTION RESULTS ===
Winners (3):
- Bidder1 → 0.5 ETH
- Bidder2 → 0.7 ETH
- Bidder5 → 0.8 ETH

Reward per winner: 0.8 ETH
Refund to owner: 0.6 ETH
```

---

# 📘 Reward Calculation Example

- N = 3  
- M = 1 ETH  
- Bids: `[0.5, 0.7, 0.9, 1.0, 0.8]`  
- Winners: `[0.5, 0.7, 0.8]`  
- Reward = `0.8 ETH` per winner  
- Total paid: `2.4 ETH`  
- Refund: `0.6 ETH`

---

# 🔐 Security Considerations

- Demo contract — not production-ready  
- Add reentrancy guards before real deployment  
- Use OpenZeppelin libraries  
- Audit logic for edge cases  

---

# 📄 License

MIT License © 2025
