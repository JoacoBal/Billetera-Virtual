require_relative '../lib/errors'

class Transaction < ActiveRecord::Base
  belongs_to :origin_wallet, class_name: 'Wallet', foreign_key: 'origin_cvu', primary_key: 'cvu'
  belongs_to :destination_wallet, class_name: 'Wallet', foreign_key: 'destination_cvu', primary_key: 'cvu'

  validates :origin_cvu, presence: true
  validates :destination_cvu, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }

  validate :validate_wallets

  after_create :transfer_balance

  private

  def validate_wallets
    if Wallet.find_by(cvu: origin_cvu).nil?
      errors.add(:origin_cvu, Errors::TRANSACTION[:invalid_source][:message])
    end

    destination_wallet = Wallet.find_by(cvu: destination_cvu)

    if destination_wallet.nil?
      errors.add(:destination_cvu, Errors::TRANSACTION[:invalid_destination][:message])
    elsif destination_wallet.enabled == false
      errors.add(:destination_cvu, "La caja de destino está deshabilitada, no puede recibir pagos.")
    end

    if origin_cvu == destination_cvu
      errors.add(:destination_cvu, Errors::TRANSACTION[:same_wallet][:message])
    end
  end

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
      raise Errors::TRANSACTION[:insufficient_funds][:message] if origin_wallet.balance < amount
      
      origin_wallet.balance -= amount
      origin_wallet.save!

      destination_wallet.balance += amount
      destination_wallet.save!
    end
  end
end