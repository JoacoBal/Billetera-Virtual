class AddDeletedFieldsToWallets < ActiveRecord::Migration[8.0]
  def change
    add_column :wallets, :deleted, :boolean, default: false, null: false
    add_column :wallets, :deleted_at, :datetime
  end
end
