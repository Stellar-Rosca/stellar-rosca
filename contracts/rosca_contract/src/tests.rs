use soroban_sdk::Env;

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{symbol_short, Address, BytesN};

    #[test]
    fn test_create_group() {
        let env = Env::default();
        let admin = Address::generate(&env);
        
        let group_id = ROSCAContract::create_group(
            env.clone(),
            admin.clone(),
            symbol_short!("Test Group"),
            symbol_short!("Test Description"),
            100, // contribution_amount
            5,   // max_members
            604800, // round_duration (1 week)
            10,  // total_rounds
        ).unwrap();

        let group = ROSCAContract::get_group(env.clone(), group_id.clone()).unwrap();
        assert_eq!(group.admin, admin);
        assert_eq!(group.contribution_amount, 100);
        assert_eq!(group.max_members, 5);
        assert_eq!(group.current_members, 0);
        assert!(!group.is_active);
    }

    #[test]
    fn test_join_group() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let member = Address::generate(&env);
        
        let group_id = ROSCAContract::create_group(
            env.clone(),
            admin.clone(),
            symbol_short!("Test Group"),
            symbol_short!("Test Description"),
            100,
            5,
            604800,
            10,
        ).unwrap();

        // First member joins (admin can also join)
        ROSCAContract::join_group(env.clone(), group_id.clone(), admin.clone()).unwrap();
        
        // Second member joins
        ROSCAContract::join_group(env.clone(), group_id.clone(), member.clone()).unwrap();

        let group = ROSCAContract::get_group(env.clone(), group_id.clone()).unwrap();
        assert_eq!(group.current_members, 2);
        assert!(group.is_active);
        assert!(group.members.contains(admin));
        assert!(group.members.contains(member));
    }

    #[test]
    fn test_contribute() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let member = Address::generate(&env);
        
        let group_id = ROSCAContract::create_group(
            env.clone(),
            admin.clone(),
            symbol_short!("Test Group"),
            symbol_short!("Test Description"),
            100,
            2,
            604800,
            2,
        ).unwrap();

        // Both members join
        ROSCAContract::join_group(env.clone(), group_id.clone(), admin.clone()).unwrap();
        ROSCAContract::join_group(env.clone(), group_id.clone(), member.clone()).unwrap();

        // First contribution
        ROSCAContract::contribute(env.clone(), group_id.clone(), admin.clone()).unwrap();
        
        let contributions = ROSCAContract::get_member_contributions(env.clone(), group_id.clone(), admin.clone()).unwrap();
        assert_eq!(contributions.total_contributed, 100);
        assert!(contributions.rounds_paid.contains(1));
    }
}
