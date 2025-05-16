# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_05_15_025209) do
  create_table "transactions", force: :cascade do |t|
    t.string "origin_cvu", null: false
    t.string "destination_cvu", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["destination_cvu"], name: "index_transactions_on_destination_cvu"
    t.index ["origin_cvu"], name: "index_transactions_on_origin_cvu"
  end

  create_table "users", primary_key: "dni", id: :string, force: :cascade do |t|
    t.string "name", null: false
    t.string "lastName", null: false
    t.string "email", null: false
    t.string "password", null: false
    t.date "birthdate", null: false
    t.string "phone", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "wallet_members", primary_key: ["wallet_cvu", "user_dni"], force: :cascade do |t|
    t.string "wallet_cvu", null: false
    t.string "user_dni", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "wallets", primary_key: "cvu", id: :string, force: :cascade do |t|
    t.string "dni_owner", null: false
    t.string "alias"
    t.decimal "balance", precision: 15, scale: 2, default: "0.0"
    t.string "type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["alias"], name: "index_wallets_on_alias", unique: true
    t.index ["cvu"], name: "index_wallets_on_cvu", unique: true
    t.check_constraint "type IN ('principal', 'secondary')", name: "wallet_type_check"
  end

  add_foreign_key "transactions", "wallets", column: "destination_cvu", primary_key: "cvu"
  add_foreign_key "transactions", "wallets", column: "origin_cvu", primary_key: "cvu"
  add_foreign_key "wallet_members", "users", column: "user_dni", primary_key: "dni"
  add_foreign_key "wallet_members", "wallets", column: "wallet_cvu", primary_key: "cvu"
  add_foreign_key "wallets", "users", column: "dni_owner", primary_key: "dni"
end
