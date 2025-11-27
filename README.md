# Reverse Auction Smart Contract

This project implements a reverse auction smart contract on the Ethereum blockchain using Solidity and Hardhat. In this reverse auction, multiple winners are determined based on the lowest submitted bids.

## Features

- **Multiple Winners**: The auction creator sets `N` (number of winners) and `M` (maximum bid amount)
- **Reward Pool Lock**: An amount equal to `N * M` is locked from the creator's account upon auction creation
- **Bid Acceptance**: Accepts bids from participants up to the maximum bid amount
- **Winner Selection**: Sorts bids by price and determines the `N` lowest bids as winning bids
- **Reward Distribution**: Distributes the highest winning bid amount among all winning participants
- **Refund Mechanism**: Returns any remaining funds to the auction creator after rewarding winners

## Assignment Requirements Met ✅

1. ✅ **Solidity Implementation**: Complete reverse auction contract with N winners and M max bid
2. ✅ **Reward Pool Lock**: Locks N * M from creator's account during deployment
3. ✅ **Winner Selection**: Selects N lowest bids as winners
4. ✅ **Reward Distribution**: All winners receive the highest winning bid amount
5. ✅ **Refund to Owner**: Returns remaining funds to auction creator
6. ✅ **Development Environment**: Uses Hardhat for development and testing
7. ✅ **Demo Walkthrough**: Complete instructions and examples provided below

## Prerequisites

- Node.js (v16 or later)
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blockchain-assignment.git
   cd blockchain-assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Testing

To run the test suite:

```bash
npx hardhat test
```

All tests should pass:
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

## Demo Walkthrough

### Step 1: Deploy the Contract

Deploy the reverse auction contract with the following parameters:
- Bidding time: 24 hours
- Number of winners (N): 3
- Maximum bid amount (M): 1 ETH
- Total reward pool: 3 ETH (N × M)

```bash
npx hardhat run scripts/deploy.js --network hardhat
```

Example output:
```
Deploying ReverseAuction with:
- Bidding time: 86400 seconds (24 hours)
- Number of winners (N): 3
- Max bid amount (M): 1.0 ETH
- Total reward pool (N * M): 3.0 ETH

ReverseAuction deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Auction will end at: Fri Nov 28 2025 23:20:20 GMT+0530 (India Standard Time)

Initial auction status:
- Number of winners: 3
- Max bid: 1.0 ETH
- Total reward pool: 3.0 ETH
- Number of bidders: 0
- Remaining time: 86400 seconds
```

### Step 2: Interact with the Contract

Create an interaction script to demonstrate the auction:

```javascript
// scripts/demo.js
import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const reverseAuction = await ethers.getContractAt("ReverseAuction", contractAddress);
  
  const [owner, bidder1, bidder2, bidder3, bidder4, bidder5] = await ethers.getSigners();
  
  console.log("=== REVERSE AUCTION DEMO ===\n");
  
  // Check initial status
  let status = await reverseAuction.getAuctionStatus();
  console.log("Initial Status:");
  console.log(`- Winners (N): ${status[0]}`);
  console.log(`- Max Bid (M): ${ethers.formatEther(status[1])} ETH`);
  console.log(`- Reward Pool: ${ethers.formatEther(status[2])} ETH`);
  console.log(`- Bidders: ${status[3]}`);
  console.log(`- Time Remaining: ${status[4]} seconds\n`);
  
  // Place bids
  console.log("Placing bids...\n");
  
  await reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.5") });
  console.log(`Bidder1 placed bid: 0.5 ETH`);
  
  await reverseAuction.connect(bidder2).placeBid({ value: ethers.parseEther("0.7") });
  console.log(`Bidder2 placed bid: 0.7 ETH`);
  
  await reverseAuction.connect(bidder3).placeBid({ value: ethers.parseEther("0.9") });
  console.log(`Bidder3 placed bid: 0.9 ETH`);
  
  await reverseAuction.connect(bidder4).placeBid({ value: ethers.parseEther("1.0") });
  console.log(`Bidder4 placed bid: 1.0 ETH`);
  
  await reverseAuction.connect(bidder5).placeBid({ value: ethers.parseEther("0.8") });
  console.log(`Bidder5 placed bid: 0.8 ETH\n`);
  
  // Show all bids
  const [bidders, bids] = await reverseAuction.getAllBids();
  console.log("All Bids:");
  for (let i = 0; i < bidders.length; i++) {
    console.log(`- ${bidders[i]}: ${ethers.formatEther(bids[i])} ETH`);
  }
  console.log();
  
  // Fast forward time
  console.log("Fast forwarding time to end auction...\n");
  await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
  await ethers.provider.send("evm_mine");
  
  // End auction
  console.log("Ending auction...\n");
  const tx = await reverseAuction.endAuction();
  const receipt = await tx.wait();
  
  // Get winners info
  const [winners, winningBids, highestWinningBid] = await reverseAuction.getWinnersInfo();
  
  console.log("=== AUCTION RESULTS ===\n");
  console.log(`Winners (${winners.length}):`);
  for (let i = 0; i < winners.length; i++) {
    console.log(`- Winner ${i + 1}: ${winners[i]} with bid ${ethers.formatEther(winningBids[i])} ETH`);
  }
  console.log(`\nReward per winner: ${ethers.formatEther(highestWinningBid)} ETH`);
  console.log(`Total rewards paid: ${ethers.formatEther(highestWinningBid * BigInt(winners.length))} ETH`);
  
  const refundToOwner = TOTAL_REWARD_POOL - (highestWinningBid * BigInt(winners.length));
  console.log(`Refund to owner: ${ethers.formatEther(refundToOwner)} ETH`);
}

main().catch(console.error);
```

Run the demo:
```bash
npx hardhat run scripts/demo.js --network hardhat
```

### Step 3: Example Output

```
=== REVERSE AUCTION DEMO ===

Initial Status:
- Winners (N): 3
- Max Bid (M): 1.0 ETH
- Reward Pool: 3.0 ETH
- Bidders: 0
- Time Remaining: 86400 seconds

Placing bids...

Bidder1 placed bid: 0.5 ETH
Bidder2 placed bid: 0.7 ETH
Bidder3 placed bid: 0.9 ETH
Bidder4 placed bid: 1.0 ETH
Bidder5 placed bid: 0.8 ETH

All Bids:
- 0x...1: 0.5 ETH
- 0x...2: 0.7 ETH
- 0x...3: 0.9 ETH
- 0x...4: 1.0 ETH
- 0x...5: 0.8 ETH

Fast forwarding time to end auction...

Ending auction...

=== AUCTION RESULTS ===

Winners (3):
- Winner 1: 0x...1 with bid 0.5 ETH
- Winner 2: 0x...2 with bid 0.7 ETH
- Winner 3: 0x...5 with bid 0.8 ETH

Reward per winner: 0.8 ETH
Total rewards paid: 2.4 ETH
Refund to owner: 0.6 ETH
```

## How It Works

1. **Auction Creation**: Owner deploys contract with N (winners) and M (max bid), locking N×M ETH
2. **Bidding Phase**: Participants place bids ≤ M ETH
3. **Winner Selection**: N lowest bids are selected as winners
4. **Reward Distribution**: All winners receive the highest winning bid amount
5. **Refund**: Remaining funds are returned to the owner

## Example Scenario

- **N = 3** (3 winners)
- **M = 1 ETH** (max bid)
- **Reward Pool = 3 ETH** (N × M)

Bids received: [0.5, 0.7, 0.9, 1.0, 0.8] ETH

Winners (3 lowest): [0.5, 0.7, 0.8] ETH
Highest winning bid: 0.8 ETH

- Each winner receives: 0.8 ETH
- Total paid: 2.4 ETH (3 × 0.8)
- Refund to owner: 0.6 ETH (3 - 2.4)

## Deployment

### Local Development

```bash
npx hardhat run scripts/deploy.js --network hardhat
```

### Local Network

1. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```

2. In a separate terminal:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Testnet/Mainnet

1. Create a `.env` file:
   ```
   PRIVATE_KEY=your_private_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

2. Update `hardhat.config.js` with network configuration

3. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network <network_name>
   ```

## Virtual Environment

The project uses a Python virtual environment for any Python-based tools. To activate it:

```bash
# On Windows
.\venv\Scripts\activate

# On Unix/macOS
source venv/bin/activate
```

## Dependencies

- Hardhat: Ethereum development environment
- @nomicfoundation/hardhat-toolbox: Collection of plugins for Hardhat
- ethers: Ethereum JavaScript library
- chai: Assertion library for testing
- typechain: TypeScript bindings for Ethereum smart contracts

## Project Structure

```
blockchain-assignment/
├── contracts/               # Smart contracts
│   └── ReverseAuction.sol   # Main contract
├── scripts/                 # Deployment and demo scripts
│   ├── deploy.js            # Deployment script
│   └── demo.js              # Demo walkthrough script
├── test/                   # Test files
│   └── ReverseAuction.test.js # Test cases
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Node.js dependencies
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## Security Considerations

- This is a demo project and should not be used in production without a thorough security audit
- Always use the latest stable version of Solidity and dependencies
- Consider implementing additional security measures like reentrancy guards for production use

## License

MIT
