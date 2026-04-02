# Stellar ROSCA Platform

A full-stack Web3 ROSCA (Rotating Savings and Credit Association) platform built on Stellar Soroban. This platform enables users to create and join savings groups with transparent, on-chain contribution tracking and automatic payout logic.

## 🚀 Features

### Smart Contract (Rust/Soroban)
- **Group Management**: Create ROSCA groups with customizable parameters
- **Member Management**: Join groups via wallet address authentication
- **Contribution Tracking**: On-chain tracking of all contributions with round management
- **Automatic Payouts**: Round-robin payout system with claim functionality
- **Event Emission**: Comprehensive event logging for all contract interactions
- **Error Handling**: Robust error handling for edge cases (missed payments, invalid operations)

### Backend (Node.js/Express)
- **RESTful API**: Complete API for interacting with the Soroban contract
- **Transaction Management**: Handle transaction signing and submission
- **Event Monitoring**: Real-time event tracking and indexing
- **Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: Health checks and monitoring endpoints

### Frontend (React)
- **Wallet Integration**: Seamless Freighter wallet connection
- **Dashboard**: Overview of user's ROSCA activities
- **Group Management**: Create, join, and manage ROSCA groups
- **Contribution Interface**: Easy contribution making with real-time status
- **Profile Management**: User profile with activity history
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## 📋 Requirements

- Node.js 16+
- Rust 1.70+
- Soroban CLI
- Freighter wallet extension
- Stellar testnet account

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stellar-rosca
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Smart Contract Setup
```bash
cd contracts/rosca_contract
cargo build --target wasm32-unknown-unknown --release
```

## ⚙️ Configuration

### Environment Variables (Backend)
```env
STELLAR_NETWORK="testnet"
SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
CONTRACT_ID="your_deployed_contract_id"
HORIZON_URL="https://horizon-testnet.stellar.org"
FRONTEND_URL="http://localhost:3000"
PORT=5000
LOG_LEVEL="info"
```

### Environment Variables (Frontend)
```env
REACT_APP_API_URL="http://localhost:5000/api"
```

## 🚀 Deployment

### Smart Contract Deployment
```bash
# Deploy to testnet
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/rosca_contract.wasm --source <your_account> --network testnet

# Set the contract ID in your backend .env file
```

### Backend Deployment
```bash
# Install dependencies
npm install --production

# Start the server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy the build/ directory to your hosting service
```

## 📖 Usage

### Creating a Group
1. Connect your Freighter wallet
2. Navigate to "Create Group"
3. Fill in group details:
   - Group name and description
   - Contribution amount (in XLM)
   - Maximum members (2-20)
   - Round duration (in seconds)
   - Total rounds
4. Approve the transaction in Freighter

### Joining a Group
1. Browse available groups on the "Groups" page
2. Click "Join Group" on an active group with available slots
3. Approve the transaction in Freighter

### Making Contributions
1. Go to your group's detail page
2. Click "Contribute Now" if it's your turn
3. Approve the transaction in Freighter
4. Your contribution will be recorded on-chain

### Claiming Payouts
1. When it's your turn to receive the pooled funds
2. Navigate to your group page
3. Click "Claim Payout"
4. Approve the transaction in Freighter

## 🏗️ Architecture

```
stellar-rosca/
├── contracts/
│   └── rosca_contract/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs          # Main contract implementation
│           └── tests.rs        # Contract tests
├── backend/
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   ├── pages/            # Page components
    │   ├── contexts/         # React contexts
    │   └── services/         # API services
    ├── package.json
    └── public/
```

## 🔧 Smart Contract Details

### Storage Structure
- **Groups**: Stored by unique group ID with complete group metadata
- **Member Contributions**: Per-member contribution tracking with round history
- **Round Payouts**: Track which rounds have been paid out and to whom

### Key Functions
- `create_group()`: Initialize a new ROSCA group
- `join_group()`: Add a member to an existing group
- `contribute()`: Make a contribution for the current round
- `claim_payout()`: Claim the pooled funds for a specific round

### Event Types
- `GroupCreated`: Emitted when a new group is created
- `MemberJoined`: Emitted when a member joins a group
- `ContributionMade`: Emitted when a contribution is made
- `PayoutClaimed`: Emitted when a payout is claimed

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts/rosca_contract
cargo test
```

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔍 API Documentation

### Contract Endpoints
- `GET /api/contract/info` - Get contract information
- `GET /api/contract/events` - Get contract events
- `POST /api/contract/create-group` - Create a new group
- `POST /api/contract/join-group` - Join an existing group
- `POST /api/contract/contribute` - Make a contribution
- `POST /api/contract/claim-payout` - Claim a payout

### Group Endpoints
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get specific group
- `GET /api/groups/:id/stats` - Get group statistics
- `GET /api/groups/:id/events` - Get group events

### Member Endpoints
- `GET /api/members/:id/contributions` - Get member contributions
- `GET /api/members/:id/stats` - Get member statistics
- `GET /api/members/:id/groups` - Get member's groups
- `GET /api/members/:id/payouts` - Get member's payout history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Stellar Development Foundation for the Soroban platform
- Freighter team for the wallet integration
- ROSCA communities for the inspiration

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This is a hackathon project. Please audit the smart contract and thoroughly test before using with real funds.
