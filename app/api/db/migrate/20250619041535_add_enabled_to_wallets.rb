class AddEnabledToWallets < ActiveRecord::Migration[8.0]
  def change
    add_column :wallets, :enabled, :boolean, default: true, null: false
  end
end
