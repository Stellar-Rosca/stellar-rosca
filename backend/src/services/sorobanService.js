const sorobanClient = require('soroban-client');
const StellarSdk = require('stellar-sdk');
const logger = require('../utils/logger');

class SorobanService {
  constructor() {
    this.network = process.env.STELLAR_NETWORK || 'testnet';
    this.rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
    this.horizonUrl = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
    this.contractId = process.env.CONTRACT_ID;
    
    this.server = new sorobanClient.Server(this.rpcUrl);
    this.horizonServer = new StellarSdk.Horizon.Server(this.horizonUrl);
    
    // Network configuration
    this.networkDetails = {
      testnet: {
        networkPassphrase: StellarSdk.Networks.TESTNET,
        friendbot: 'https://friendbot.stellar.org',
      },
      // Add mainnet configuration when ready
    };
  }

  getNetworkConfig() {
    return this.networkDetails[this.network];
  }

  async getAccount(accountId) {
    try {
      const account = await this.horizonServer.loadAccount(accountId);
      return account;
    } catch (error) {
      logger.error(`Failed to load account ${accountId}:`, error);
      throw new Error('Account not found or network error');
    }
  }

  async getContractData(key, ...args) {
    try {
      const contract = new sorobanClient.Contract(this.contractId);
      const result = await this.server.simulateTransaction(
        new sorobanClient.TransactionBuilder(
          new sorobanClient.Account(StellarSdk.Keypair.random().publicKey(), '0'),
          {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: this.getNetworkConfig().networkPassphrase,
          }
        )
          .addOperation(contract.call(key, ...args))
          .build()
      );

      if (result.status !== 'SUCCESS') {
        throw new Error(`Contract call failed: ${result.error}`);
      }

      return sorobanClient.xdr.ScVal.fromXDR(result.results[0].xdr, 'base64');
    } catch (error) {
      logger.error(`Contract data retrieval failed:`, error);
      throw error;
    }
  }

  async invokeContract(key, ...args) {
    try {
      const contract = new sorobanClient.Contract(this.contractId);
      const result = await this.server.simulateTransaction(
        new sorobanClient.TransactionBuilder(
          new sorobanClient.Account(StellarSdk.Keypair.random().publicKey(), '0'),
          {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: this.getNetworkConfig().networkPassphrase,
          }
        )
          .addOperation(contract.call(key, ...args))
          .build()
      );

      if (result.status !== 'SUCCESS') {
        throw new Error(`Contract invocation failed: ${result.error}`);
      }

      return sorobanClient.xdr.ScVal.fromXDR(result.results[0].xdr, 'base64');
    } catch (error) {
      logger.error(`Contract invocation failed:`, error);
      throw error;
    }
  }

  async submitTransaction(transactionXDR, sourceAccount) {
    try {
      const transaction = sorobanClient.TransactionBuilder.fromXDR(
        transactionXDR,
        this.getNetworkConfig().networkPassphrase
      );

      // Prepare transaction
      const preparedTx = await this.server.prepareTransaction(transaction);
      
      // Submit transaction
      const result = await this.server.sendTransaction(preparedTx);
      
      if (result.status === 'ERROR') {
        throw new Error(`Transaction failed: ${result.error}`);
      }

      // Wait for transaction confirmation
      const txResult = await this.server.getTransaction(result.hash);
      
      if (txResult.status === 'SUCCESS') {
        return txResult;
      } else {
        throw new Error(`Transaction not successful: ${txResult.resultXdr}`);
      }
    } catch (error) {
      logger.error(`Transaction submission failed:`, error);
      throw error;
    }
  }

  async getContractEvents(startLedger = null, limit = 10) {
    try {
      const events = await this.server.getEvents({
        startLedger,
        limit,
        filters: [
          {
            type: 'contract',
            contractIds: [this.contractId],
          },
        ],
      });
      
      return events.events;
    } catch (error) {
      logger.error(`Failed to get contract events:`, error);
      throw error;
    }
  }

  // Helper methods for ROSCA-specific operations
  async createGroup(admin, name, description, contributionAmount, maxMembers, roundDuration, totalRounds) {
    return await this.invokeContract(
      'create_group',
      new sorobanClient.Address(admin),
      new sorobanClient.Symbol(name),
      new sorobanClient.Symbol(description),
      new sorobanClient.Int128(contributionAmount),
      new sorobanClient.Uint32(maxMembers),
      new sorobanClient.Uint64(roundDuration),
      new sorobanClient.Uint32(totalRounds)
    );
  }

  async joinGroup(groupId, member) {
    return await this.invokeContract(
      'join_group',
      sorobanClient.Native.xdr.ScVal.scvBytes(Buffer.from(groupId, 'hex')),
      new sorobanClient.Address(member)
    );
  }

  async contribute(groupId, member) {
    return await this.invokeContract(
      'contribute',
      sorobanClient.Native.xdr.ScVal.scvBytes(Buffer.from(groupId, 'hex')),
      new sorobanClient.Address(member)
    );
  }

  async getGroup(groupId) {
    return await this.getContractData(
      'get_group',
      sorobanClient.Native.xdr.ScVal.scvBytes(Buffer.from(groupId, 'hex'))
    );
  }

  async getMemberContributions(groupId, member) {
    return await this.getContractData(
      'get_member_contributions',
      sorobanClient.Native.xdr.ScVal.scvBytes(Buffer.from(groupId, 'hex')),
      new sorobanClient.Address(member)
    );
  }

  async getAllGroups() {
    return await this.getContractData('get_all_groups');
  }
}

module.exports = new SorobanService();
