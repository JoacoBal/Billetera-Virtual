module Errors
  USER = {
    not_found: {
      code: 'USER_001',
      message: 'User not found'
    }
  }
  WALLET = {
    principal_exists: {
      code: 'WALLET_001',
      message: 'A principal wallet already exists for this user'
    }
  }
  TRANSACTION = {
    invalid_source: {
      code: 'TRANSACTION_001',
      message: 'Source does not reference a valid wallet'
    },
    invalid_destination: {
      code: 'TRANSACTION_002',
      message: 'Destination does not reference a valid wallet'
    },
    same_wallet: {
      code: 'TRANSACTION_003',
      message: 'must be different from origin'
    },
    insufficient_funds: {
      code: 'TRANSACTION_003',
      message: 'Insufficient funds'
    }
  }
end