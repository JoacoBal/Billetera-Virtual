require_relative '../lib/errors'

class Wallet < ActiveRecord::Base
  self.primary_key = 'cvu'
  self.inheritance_column = :_type_disabled

  belongs_to :owner, class_name: 'User', foreign_key: 'dni_owner', primary_key: 'dni'

  has_many :users, through: :wallet_members

  has_many :sent_transactions,
           class_name: 'Transaction',
           foreign_key: 'origin_cvu',
           dependent: :nullify

  has_many :received_transactions,
           class_name: 'Transaction',
           foreign_key: 'destination_cvu',
           dependent: :nullify

  validates :cvu, presence: true, uniqueness: true
  validates :dni_owner, presence: true
  validates :balance, numericality: { greater_than_or_equal_to: 0 }
  validates :type, presence: true, inclusion: { in: %w[principal secondary] }

  validate :only_one_principal_wallet_per_user

  def self.create_wallet!(data)
    ActiveRecord::Base.transaction do
      wallet = create!(data)
      user = User.find_by!(dni: wallet.dni_owner)
      WalletMember.create!(user: user, wallet: wallet)
      wallet
    end
  end

  private
  # Validates that a user can only have one wallet of type 'principal'.
  #
  # This method adds a validation error if another wallet with type 'principal'
  # already exists for the same user (`dni_owner`).
  #
  # @return [void]
  def only_one_principal_wallet_per_user
    return unless type == 'principal'

    existing = Wallet.where(dni_owner: dni_owner, type: 'principal')
    existing = existing.where.not(cvu: cvu) if persisted?

    if existing.exists?
      error = Errors::WALLET[:principal_exists]
      errors.add(:type, "#{error[:message]}")
    end
  end
end