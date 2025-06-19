require 'sinatra'
require 'json'
require_relative '../config/constants'

# Crea una nueva transacción
post "#{AppConfig::API_BASE_PATH}/transfer" do
  protected!
  user = current_user
  wallets = user.available_wallets
  data = JSON.parse(request.body.read)

  origin_cvu = data["origin_cvu"]
  destination_cvu = data["destination_cvu"]
  amount = data["amount"].to_d
  description = data["description"]

   # Verificamos que el origin_cvu pertenezca al usuario
  unless wallets.any? { |wallet| wallet.cvu == origin_cvu }
    status 403
    content_type :json
    return { errors: { permission: "No tenés permiso para usar ese CVU de origen" } }.to_json
  end

  begin
    Transaction.create!(
        origin_cvu: origin_cvu,
        destination_cvu: destination_cvu,
        amount: amount,
        description: description
    )
    status 200
    content_type :json
    { message: "Transferencia exitosa" }.to_json
  rescue ActiveRecord::RecordInvalid => e
    status 422
    content_type :json
    formatted_errors = e.record.errors.to_hash(true).transform_values { |messages| messages.first }

    { errors: formatted_errors }.to_json
  rescue => e
    status 400
    content_type :json
    { errors: { general: [e.message] } }.to_json
  end
end

# Devuelve todas las transacciones de la sesión actual
get "#{AppConfig::API_BASE_PATH}/transactions" do
  protected!
  user = current_user
  wallets = user.available_wallets
  wallet_cvus = wallets.pluck(:cvu)

  # Parámetros de paginación
  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 10).to_i
  offset = (page - 1) * per_page

  transactions = Transaction
    .includes(origin_wallet: :owner, destination_wallet: :owner)
    .where(origin_cvu: wallet_cvus)
    .or(Transaction.where(destination_cvu: wallet_cvus))
    .order(created_at: :desc)
    .limit(per_page)
    .offset(offset)

  total_count = Transaction
    .where(origin_cvu: wallet_cvus)
    .or(Transaction.where(destination_cvu: wallet_cvus))
    .count

  content_type :json
  {
    page: page,
    per_page: per_page,
    total: total_count,
    total_pages: (total_count.to_f / per_page).ceil,
    transactions: transactions.map do |tx|
      type = wallet_cvus.include?(tx.origin_cvu) ? "sent" : "received"
      contact_user = type == "sent" ? tx.destination_wallet&.owner : tx.origin_wallet&.owner

      {
        origin_cvu: tx.origin_cvu,
        destination_cvu: tx.destination_cvu,
        amount: tx.amount,
        description: tx.description,
        created_at: tx.created_at,
        type: type,
        contact: contact_user && {
          name: contact_user.name,
          last_name: contact_user.lastName,
          email: contact_user.email,
          dni: contact_user.dni
        }
      }
    end
  }.to_json
end

#Retirar dinero de una wallet
post "#{AppConfig::API_BASE_PATH}/extraction" do
  #protected!
  user = current_user
  wallets = user.available_wallets
  data = JSON.parse(request.body.read)

  origin_cvu = data["origin_cvu"]
  amount = data["amount"].to_d
  description = data["description"] || "Retiro de dinero"

  wallet = wallets.find { |w| w.cvu == origin_cvu }

  halt 403, { error: "No tenes permiso para operar con este CVU" }.to_json unless wallet
  halt 400, { error: "El monto debe ser mayor a 0"}.to_json if amount <= 0
  halt 400, { error: "Saldo insuficiente"}.to_json if wallet.balance < amount

  begin 
    ActiveRecord::Base.transaction do
      Transaction.create!(
        origin_cvu: origin_cvu,
        destination_cvu: nil,
        amount: amount,
        description: description
      )

      wallet.update!(balance: wallet.balance - amount)
  end

  status 200
  content_type :json
  { message: "Retiro exitoso", new_balance: wallet.reload.balance }.to_json

rescue ActiveRecord::RecordInvalid => e
  status 422
  content_type :json
  formatted_errors = e.record.errors.to_hash(true).transform_values { |messages| messages.first }
  { errors: formatted_errors }.to_json
rescue => e
  status 500
  content_type :json
  { error: "Ocurrio un error: #{e.message}"}.to_json
end
end