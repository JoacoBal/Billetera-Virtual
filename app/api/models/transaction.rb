class Transaction < ActiveRecord::Base
  belongs_to :origin_wallet, class_name: 'Wallet', foreign_key: 'origin_cvu', primary_key: 'cvu'
  belongs_to :destination_wallet, class_name: 'Wallet', foreign_key: 'destination_cvu', primary_key: 'cvu'

  validates :origin_cvu, presence: true
  validates :destination_cvu, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }

  private

  # Performs a fund transfer between wallets in a single atomic database transaction.
  #
  # This method ensures that both debit from the origin wallet and credit to the destination wallet
  # are completed together. If any part of the operation fails (e.g., due to validation errors),
  # the entire transaction is rolled back to maintain data consistency.
  #
  # @raise [ActiveRecord::RecordInvalid] If saving either wallet fails due to validation issues.
  # @raise [StandardError] If any other unexpected error occurs during the transfer.
  #
  # @return [void]
  def transfer_balance
    ActiveRecord::Base.transaction do
      raise 'Origin wallet not found' unless origin_wallet
      raise 'Destination wallet not found' unless destination_wallet
      raise 'Insufficient funds' if origin_wallet.balance < amount
      
      origin_wallet.balance -= amount
      origin_wallet.save!

      destination_wallet.balance += amount
      destination_wallet.save!
    end
  end
end