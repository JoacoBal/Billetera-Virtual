class Transaction < ActiveRecord::Base
  belongs_to :origin_wallet, class_name: 'Wallet', foreign_key: 'origin_cvu', primary_key: 'cvu'
  belongs_to :destination_wallet, class_name: 'Wallet', foreign_key: 'destination_cvu', primary_key: 'cvu'

  validates :origin_cvu, presence: true
  validates :destination_cvu, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
end