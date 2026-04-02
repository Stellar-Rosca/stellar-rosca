# Quick Start Guide

Get your Stellar ROSCA platform running in minutes with this quick start guide.

## 🚀 Quick Setup

### 1. Prerequisites
- Install [Freighter wallet](https://freighter.app/) browser extension
- Create a Stellar testnet account (use [friendbot](https://friendbot.stellar.org/) for test XLM)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Contract Deployment (Optional for demo)
For demo purposes, you can use the pre-deployed testnet contract ID in the backend.

## 📱 First Steps

1. **Connect Wallet**: Open the frontend and connect your Freighter wallet
2. **Create Group**: Navigate to "Create Group" and set up your first ROSCA group
3. **Invite Members**: Share your group ID with friends to join
4. **Make Contributions**: Members contribute their share each round
5. **Receive Payouts**: Rotate through members for automatic payouts

## 🔧 Demo Configuration

For quick testing, use these settings:
- Contribution Amount: 10 XLM
- Max Members: 5
- Round Duration: 604800 seconds (7 days)
- Total Rounds: 5

## 📞 Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Review [DEVELOPMENT.md](DEVELOPMENT.md) for development guidance
- Open an issue for bugs or feature requests
