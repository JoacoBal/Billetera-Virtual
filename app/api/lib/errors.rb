module Errors
  WALLET = {
    principal_exists: {
      code: 'WALLET_001',
      message: 'A principal wallet already exists for this user'
    }
  }
  def self.get(section, key)
    code, message = ERRORS.dig(section, key)
    { code: code, message: message }
  end
end