# API Documentation

## Overview

The Stellar ROSCA API provides endpoints for interacting with the ROSCA smart contract and managing user data. All endpoints return JSON responses and follow RESTful conventions.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Authentication is handled through Stellar wallet signatures. Include the wallet public key in request headers for operations that require authentication.

```
X-Wallet-Public-Key: GABC...
X-Signature: <transaction_signature>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Contract Endpoints

### Get Contract Information
```http
GET /contract/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractId": "CONTRACT_ID_HERE",
    "network": "testnet",
    "rpcUrl": "https://soroban-testnet.stellar.org",
    "horizonUrl": "https://horizon-testnet.stellar.org"
  }
}
```

### Get Contract Events
```http
GET /contract/events?startLedger=12345&limit=10
```

**Query Parameters:**
- `startLedger` (optional): Starting ledger number
- `limit` (optional): Maximum number of events (max 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "type": "contract",
        "contractId": "CONTRACT_ID",
        "topic": "group_created",
        "value": {...},
        "timestamp": "2026-04-02T15:30:00Z"
      }
    ],
    "count": 1
  }
}
```

### Create Group
```http
POST /contract/create-group
```

**Request Body:**
```json
{
  "admin": "GADMIN_PUBLIC_KEY",
  "name": "Monthly Savings Club",
  "description": "A group for monthly savings",
  "contributionAmount": 10.5,
  "maxMembers": 5,
  "roundDuration": 604800,
  "totalRounds": 12
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groupId": "GENERATED_GROUP_ID",
    "message": "Group created successfully"
  }
}
```

### Join Group
```http
POST /contract/join-group
```

**Request Body:**
```json
{
  "groupId": "GROUP_ID_HEX",
  "member": "GMEMBER_PUBLIC_KEY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined group"
}
```

### Make Contribution
```http
POST /contract/contribute
```

**Request Body:**
```json
{
  "groupId": "GROUP_ID_HEX",
  "member": "GMEMBER_PUBLIC_KEY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contribution made successfully"
}
```

### Claim Payout
```http
POST /contract/claim-payout
```

**Request Body:**
```json
{
  "groupId": "GROUP_ID_HEX",
  "round": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout claimed successfully"
}
```

## Group Endpoints

### Get All Groups
```http
GET /groups
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "GROUP_ID",
        "admin": "GADMIN_KEY",
        "name": "Group Name",
        "description": "Group Description",
        "contributionAmount": 10.0,
        "maxMembers": 5,
        "currentMembers": 3,
        "roundDuration": 604800,
        "startTime": 1640995200,
        "currentRound": 2,
        "totalRounds": 12,
        "isActive": true,
        "members": ["GKEY1", "GKEY2", "GKEY3"]
      }
    ],
    "count": 1
  }
}
```

### Get Specific Group
```http
GET /groups/{groupId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "GROUP_ID",
    "admin": "GADMIN_KEY",
    "name": "Group Name",
    "description": "Group Description",
    "contributionAmount": 10.0,
    "maxMembers": 5,
    "currentMembers": 3,
    "roundDuration": 604800,
    "startTime": 1640995200,
    "currentRound": 2,
    "totalRounds": 12,
    "isActive": true,
    "members": ["GKEY1", "GKEY2", "GKEY3"]
  }
}
```

### Get Group Statistics
```http
GET /groups/{groupId}/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "GROUP_ID",
    "name": "Group Name",
    "contributionAmount": 10.0,
    "currentMembers": 3,
    "maxMembers": 5,
    "totalPool": 30.0,
    "currentRoundProgress": "2/12",
    "nextPayoutAmount": 30.0,
    "isActive": true,
    "completionPercentage": 17
  }
}
```

### Get Group Events
```http
GET /groups/{groupId}/events?limit=50
```

**Query Parameters:**
- `limit` (optional): Maximum number of events

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "type": "group_created",
        "groupId": "GROUP_ID",
        "timestamp": "2026-04-02T15:30:00Z",
        "data": {...}
      }
    ],
    "count": 1
  }
}
```

## Member Endpoints

### Get Member Contributions
```http
GET /members/{memberId}/contributions?groupId=GROUP_ID
```

**Query Parameters:**
- `groupId` (required): Group ID

**Response:**
```json
{
  "success": true,
  "data": {
    "member": "GMEMBER_KEY",
    "totalContributed": 20.0,
    "roundsPaid": [1, 2],
    "roundsMissed": []
  }
}
```

### Get Member Statistics
```http
GET /members/{memberId}/stats?groupId=GROUP_ID
```

**Query Parameters:**
- `groupId` (required): Group ID

**Response:**
```json
{
  "success": true,
  "data": {
    "memberId": "GMEMBER_KEY",
    "groupId": "GROUP_ID",
    "totalContributed": 20.0,
    "roundsPaid": 2,
    "roundsMissed": 0,
    "contributionRate": 100,
    "totalRounds": 12,
    "currentRound": 2,
    "remainingContributions": 10,
    "expectedTotalContribution": 120.0,
    "actualTotalContribution": 20.0
  }
}
```

### Get Member's Groups
```http
GET /members/{memberId}/groups
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "GROUP_ID",
        "name": "Group Name",
        "contributionAmount": 10.0,
        "currentMembers": 3,
        "maxMembers": 5,
        "currentRound": 2,
        "totalRounds": 12,
        "isActive": true
      }
    ],
    "count": 1
  }
}
```

### Get Member's Payout History
```http
GET /members/{memberId}/payouts?groupId=GROUP_ID
```

**Query Parameters:**
- `groupId` (required): Group ID

**Response:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "round": 1,
        "amount": 30.0,
        "timestamp": "2026-04-02T15:30:00Z",
        "status": "claimed"
      }
    ],
    "count": 1
  }
}
```

## Error Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Invalid wallet signature |
| 404 | Not Found | Group or member not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per wallet address

## Webhooks

### Event Notifications
Subscribe to contract events via webhook:

```http
POST /webhooks/subscribe
```

**Request Body:**
```json
{
  "url": "https://your-webhook-url.com/events",
  "events": ["group_created", "member_joined", "contribution_made", "payout_claimed"]
}
```

## SDK Integration

### JavaScript Example
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a group
const createGroup = async (groupData) => {
  try {
    const response = await api.post('/contract/create-group', groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};
```

### Python Example
```python
import requests

BASE_URL = 'http://localhost:5000/api'

def create_group(group_data):
    try:
        response = requests.post(f'{BASE_URL}/contract/create-group', json=group_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error creating group: {e}')
        raise
```

## Testing

### Test Environment
- Use Stellar testnet for development
- Test with small amounts of XLM
- Verify all operations in testnet before mainnet

### Test Data
Sample group data for testing:
```json
{
  "name": "Test Group",
  "description": "A test ROSCA group",
  "contributionAmount": 1.0,
  "maxMembers": 3,
  "roundDuration": 86400,
  "totalRounds": 3
}
```

---

For more information, visit the [GitHub repository](https://github.com/your-repo/stellar-rosca) or contact the development team.
