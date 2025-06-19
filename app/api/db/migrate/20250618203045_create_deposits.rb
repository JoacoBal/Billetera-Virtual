class CreateDeposits < ActiveRecord::Migration[7.1]
  def change
    create_table :deposits do |t|
      t.string :wallet_cvu, null: false
      t.float :amount, null: false
      t.timestamps
    end

    add_foreign_key :deposits, :wallets, column: :wallet_cvu, primary_key: :cvu
  end
end

