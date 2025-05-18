class WalletMember < ActiveRecord::Base
  belongs_to :user, class_name: 'User', foreign_key: 'user_dni', primary_key: 'dni'
  belongs_to :wallet, class_name: 'Wallet', foreign_key: 'wallet_cvu', primary_key: 'cvu'

  validate :must_be_owner_or_shared_wallet

  private

  def must_be_owner_or_shared_wallet
    return if wallet.nil? || user.nil?

    if wallet.type != 'shared' && wallet.dni_owner != user.dni
      errors.add(:user, 'can only be added if they are the owner or the wallet is shared')
    end
  end
end