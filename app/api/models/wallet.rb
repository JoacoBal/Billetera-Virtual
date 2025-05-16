class Wallet < ActiveRecord::Base
  self.primary_key = 'cvu'
  self.inheritance_column = :_type_disabled

  belongs_to :owner, class_name: 'User', foreign_key: 'dni_owner'

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

  private

  def only_one_principal_wallet_per_user
    return unless type == 'principal'

    existing = Wallet.where(dni_owner: dni_owner, type: 'principal')
    existing = existing.where.not(cvu: cvu) if persisted?

    if existing.exists?
      errors.add(:type, 'ya existe una wallet principal para este usuario')
    end
  end
end