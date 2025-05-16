class CreateTransactions < ActiveRecord::Migration[8.0]
  def change
    create_table :transactions do |t|
      t.string :origin_cvu, null: false
      t.string :destination_cvu, null: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :description

      t.timestamps
    end
    add_index :transactions, :origin_cvu
    add_index :transactions, :destination_cvu

    add_foreign_key :transactions, :wallets, column: :origin_cvu, primary_key: :cvu
    add_foreign_key :transactions, :wallets, column: :destination_cvu, primary_key: :cvu    
  end
end
