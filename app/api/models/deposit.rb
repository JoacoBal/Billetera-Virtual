class Deposit < ActiveRecord::Base
  belongs_to :wallet, primary_key: 'cvu', foreign_key: 'wallet_cvu'

  validates :wallet_cvu, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }

  after_create :apply_deposit

  private

  def apply_deposit
    wallet.balance += amount
    wallet.save!
  end
end

