class CreateWallets < ActiveRecord::Migration[8.0]
  def change
    create_table :wallets, id: false do |t|
      t.string :cvu, primary_key: true
      t.string :dni_owner, null: false  # campo personalizado de referencia a users.dni
      t.string :alias
      t.decimal :balance, precision: 15, scale: 2, default: 0.0
      t.string :type, null: false # 'principal' o 'secundaria'

      t.timestamps
    end
    add_foreign_key :wallets, :users, column: :dni_owner, primary_key: :dni, name: 'fk_wallets_users_dni_owner'

    add_index :wallets, :cvu, unique: true
    add_index :wallets, :alias, unique: true
    add_check_constraint :wallets, "type IN ('principal', 'secondary')", name: "wallet_type_check"
  end
end
