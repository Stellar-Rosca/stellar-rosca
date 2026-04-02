#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, env, symbol_short, Address, BytesN,
    ConversionError, Env, Symbol, Vec,
};

// Contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    GroupNotFound = 1,
    GroupAlreadyExists = 2,
    NotGroupAdmin = 3,
    NotGroupMember = 4,
    InvalidContributionAmount = 5,
    ContributionPeriodNotActive = 6,
    MemberAlreadyExists = 7,
    MaxMembersReached = 8,
    InvalidRoundNumber = 9,
    PayoutAlreadyClaimed = 10,
    InsufficientBalance = 11,
}

// Data keys for storage
#[contracttype]
pub enum DataKey {
    Group(BytesN<32>), // group_id -> Group
    GroupList,         // Vec<BytesN<32>>
    MemberContributions(BytesN<32>, Address), // group_id, member -> Contributions
    RoundPayouts(BytesN<32>, u32), // group_id, round -> Address
}

// Group structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Group {
    pub id: BytesN<32>,
    pub admin: Address,
    pub name: Symbol,
    pub description: Symbol,
    pub contribution_amount: i128,
    pub max_members: u32,
    pub current_members: u32,
    pub round_duration: u64, // in seconds
    pub start_time: u64,
    pub current_round: u32,
    pub total_rounds: u32,
    pub is_active: bool,
    pub members: Vec<Address>,
}

// Member contributions tracking
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Contributions {
    pub member: Address,
    pub total_contributed: i128,
    pub rounds_paid: Vec<u32>,
    pub rounds_missed: Vec<u32>,
}

// Events
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GroupCreatedEvent {
    pub group_id: BytesN<32>,
    pub admin: Address,
    pub name: Symbol,
    pub contribution_amount: i128,
    pub max_members: u32,
    pub total_rounds: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MemberJoinedEvent {
    pub group_id: BytesN<32>,
    pub member: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContributionMadeEvent {
    pub group_id: BytesN<32>,
    pub member: Address,
    pub round: u32,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PayoutClaimedEvent {
    pub group_id: BytesN<32>,
    pub member: Address,
    pub round: u32,
    pub amount: i128,
}

pub struct ROSCAContract;

#[contractimpl]
impl ROSCAContract {
    /// Create a new ROSCA group
    pub fn create_group(
        env: Env,
        admin: Address,
        name: Symbol,
        description: Symbol,
        contribution_amount: i128,
        max_members: u32,
        round_duration: u64,
        total_rounds: u32,
    ) -> Result<BytesN<32>, Error> {
        admin.require_auth();
        
        if contribution_amount <= 0 {
            return Err(Error::InvalidContributionAmount);
        }
        
        if max_members < 2 || max_members > 20 {
            return Err(Error::MaxMembersReached);
        }

        // Generate unique group ID
        let group_id = env.crypto().sha256(&[
            admin.to_string().into(),
            name,
            env.ledger().timestamp().into(),
        ].concat().into());

        // Check if group already exists
        if Self::has_group(env.clone(), group_id.clone()) {
            return Err(Error::GroupAlreadyExists);
        }

        let group = Group {
            id: group_id.clone(),
            admin: admin.clone(),
            name,
            description,
            contribution_amount,
            max_members,
            current_members: 0,
            round_duration,
            start_time: env.ledger().timestamp(),
            current_round: 1,
            total_rounds,
            is_active: false, // Will be activated when minimum members join
            members: Vec::new(&env),
        };

        // Store group
        env.storage().instance().set(&DataKey::Group(group_id.clone()), &group);
        
        // Add to group list
        let mut group_list: Vec<BytesN<32>> = env
            .storage()
            .instance()
            .get(&DataKey::GroupList)
            .unwrap_or_else(|| Vec::new(&env));
        group_list.push_back(group_id.clone());
        env.storage().instance().set(&DataKey::GroupList, &group_list);

        // Emit event
        env.events().publish(
            symbol_short!("group_created"),
            GroupCreatedEvent {
                group_id: group_id.clone(),
                admin,
                name: group.name,
                contribution_amount,
                max_members,
                total_rounds,
            },
        );

        Ok(group_id)
    }

    /// Join a ROSCA group
    pub fn join_group(env: Env, group_id: BytesN<32>, member: Address) -> Result<(), Error> {
        member.require_auth();

        let mut group = Self::get_group(env.clone(), group_id.clone())?;
        
        if group.current_members >= group.max_members {
            return Err(Error::MaxMembersReached);
        }

        // Check if member already exists
        if group.members.contains(member.clone()) {
            return Err(Error::MemberAlreadyExists);
        }

        // Add member
        group.members.push_back(member.clone());
        group.current_members += 1;

        // Activate group if we have minimum members (at least 2)
        if group.current_members >= 2 && !group.is_active {
            group.is_active = true;
            group.start_time = env.ledger().timestamp();
        }

        // Update group
        env.storage().instance().set(&DataKey::Group(group_id.clone()), &group);

        // Initialize contributions tracking
        let contributions = Contributions {
            member: member.clone(),
            total_contributed: 0,
            rounds_paid: Vec::new(&env),
            rounds_missed: Vec::new(&env),
        };
        env.storage().instance().set(
            &DataKey::MemberContributions(group_id.clone(), member.clone()),
            &contributions,
        );

        // Emit event
        env.events().publish(
            symbol_short!("member_joined"),
            MemberJoinedEvent {
                group_id: group_id.clone(),
                member,
            },
        );

        Ok(())
    }

    /// Make a contribution for the current round
    pub fn contribute(env: Env, group_id: BytesN<32>, member: Address) -> Result<(), Error> {
        member.require_auth();

        let mut group = Self::get_group(env.clone(), group_id.clone())?;
        
        if !group.is_active {
            return Err(Error::ContributionPeriodNotActive);
        }

        if !group.members.contains(member.clone()) {
            return Err(Error::NotGroupMember);
        }

        let current_round = group.current_round;
        
        // Get member contributions
        let mut contributions = Self::get_member_contributions(env.clone(), group_id.clone(), member.clone())?;
        
        // Check if already paid for this round
        if contributions.rounds_paid.contains(current_round) {
            return Err(Error::InvalidContributionAmount); // Already paid
        }

        // Process contribution
        env.current_contract_address().require_auth_for_args(
            env.invoked_contract_args()
                .into_iter()
                .enumerate()
                .map(|(i, arg)| (i as u32, arg))
                .collect(),
        );

        // Update contributions
        contributions.total_contributed += group.contribution_amount;
        contributions.rounds_paid.push_back(current_round);
        
        // Store updated contributions
        env.storage().instance().set(
            &DataKey::MemberContributions(group_id.clone(), member.clone()),
            &contributions,
        );

        // Emit event
        env.events().publish(
            symbol_short!("contribution_made"),
            ContributionMadeEvent {
                group_id: group_id.clone(),
                member,
                round: current_round,
                amount: group.contribution_amount,
            },
        );

        // Check if round is complete and advance to next round
        Self::check_and_advance_round(env.clone(), group_id.clone())?;

        Ok(())
    }

    /// Claim payout for a specific round
    pub fn claim_payout(env: Env, group_id: BytesN<32>, round: u32) -> Result<(), Error> {
        let caller = env.current_contract_address();
        caller.require_auth();

        let group = Self::get_group(env.clone(), group_id.clone())?;
        
        if round > group.current_round {
            return Err(Error::InvalidRoundNumber);
        }

        // Check if payout is already claimed
        if let Some(claimed_by) = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::RoundPayouts(group_id.clone(), round))
        {
            return Err(Error::PayoutAlreadyClaimed);
        }

        // Determine who should receive the payout (simple round-robin for now)
        let payout_recipient = Self::get_payout_recipient(env.clone(), group_id.clone(), round)?;
        
        let payout_amount = group.contribution_amount * group.current_members as i128;

        // Mark payout as claimed
        env.storage().instance().set(
            &DataKey::RoundPayouts(group_id.clone(), round),
            &payout_recipient,
        );

        // Emit event
        env.events().publish(
            symbol_short!("payout_claimed"),
            PayoutClaimedEvent {
                group_id: group_id.clone(),
                member: payout_recipient,
                round,
                amount: payout_amount,
            },
        );

        Ok(())
    }

    /// Get group information
    pub fn get_group(env: Env, group_id: BytesN<32>) -> Result<Group, Error> {
        if let Some(group) = env.storage().instance().get(&DataKey::Group(group_id)) {
            Ok(group)
        } else {
            Err(Error::GroupNotFound)
        }
    }

    /// Get member contributions
    pub fn get_member_contributions(env: Env, group_id: BytesN<32>, member: Address) -> Result<Contributions, Error> {
        if let Some(contributions) = env
            .storage()
            .instance()
            .get(&DataKey::MemberContributions(group_id, member))
        {
            Ok(contributions)
        } else {
            Err(Error::NotGroupMember)
        }
    }

    /// Get all groups
    pub fn get_all_groups(env: Env) -> Vec<BytesN<32>> {
        env.storage()
            .instance()
            .get(&DataKey::GroupList)
            .unwrap_or_else(|| Vec::new(&env))
    }

    // Helper functions
    fn has_group(env: Env, group_id: BytesN<32>) -> bool {
        env.storage().instance().has(&DataKey::Group(group_id))
    }

    fn check_and_advance_round(env: Env, group_id: BytesN<32>) -> Result<(), Error> {
        let group = Self::get_group(env.clone(), group_id.clone())?;
        
        // Count how many members have paid for current round
        let mut paid_count = 0;
        for member in group.members.iter() {
            if let Ok(contributions) = Self::get_member_contributions(env.clone(), group_id.clone(), member) {
                if contributions.rounds_paid.contains(group.current_round) {
                    paid_count += 1;
                }
            }
        }

        // If all members have paid, advance to next round
        if paid_count == group.current_members && group.current_round < group.total_rounds {
            let mut updated_group = group;
            updated_group.current_round += 1;
            env.storage().instance().set(&DataKey::Group(group_id), &updated_group);
        }

        Ok(())
    }

    fn get_payout_recipient(env: Env, group_id: BytesN<32>, round: u32) -> Result<Address, Error> {
        let group = Self::get_group(env.clone(), group_id.clone())?;
        
        // Simple round-robin: member at index (round-1) % current_members
        let member_index = ((round - 1) % group.current_members) as usize;
        
        if let Some(member) = group.members.get(member_index as u32) {
            Ok(member)
        } else {
            Err(Error::NotGroupMember)
        }
    }
}
