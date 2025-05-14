class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, id: false do |t|
      t.string :dni, primary_key: true
      t.string :name, null: false
      t.string :lastName, null: false
      t.string :email, null: false
      t.string :password, null: false
      t.date :birthdate, null: false
      t.string :phone, null: false

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
