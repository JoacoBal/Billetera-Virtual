class CreateWalletMembers < ActiveRecord::Migration[8.0]
  def change
    create_table :wallet_members, primary_key: [:wallet_cvu, :user_dni] do |t|
      t.string :wallet_cvu, null: false
      t.string :user_dni, null: false

      t.timestamps
    end

    add_foreign_key :wallet_members, :wallets, column: :wallet_cvu, primary_key: :cvu
    add_foreign_key :wallet_members, :users, column: :user_dni, primary_key: :dni

  end
end
