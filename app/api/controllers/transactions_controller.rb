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

  results = []
  transactions.each do |tx|
    origin_owned = wallet_cvus.include?(tx.origin_cvu)
    dest_owned = wallet_cvus.include?(tx.destination_cvu)

    if origin_owned
      results << {
        origin_cvu: tx.origin_cvu,
        destination_cvu: tx.destination_cvu,
        amount: tx.amount,
        description: tx.description,
        created_at: tx.created_at,
        type: "sent",
        contact: tx.destination_wallet&.owner && {
          name: tx.destination_wallet.owner.name,
          last_name: tx.destination_wallet.owner.lastName,
          email: tx.destination_wallet.owner.email,
          dni: tx.destination_wallet.owner.dni
        }
      }
    end

    if dest_owned
      results << {
        origin_cvu: tx.origin_cvu,
        destination_cvu: tx.destination_cvu,
        amount: tx.amount,
        description: tx.description,
        created_at: tx.created_at,
        type: "received",
        contact: tx.origin_wallet&.owner && {
          name: tx.origin_wallet.owner.name,
          last_name: tx.origin_wallet.owner.lastName,
          email: tx.origin_wallet.owner.email,
          dni: tx.origin_wallet.owner.dni
        }
      }
    end
  end

  results.sort_by! { |tx| [-tx[:created_at].to_i, tx[:type] == "sent" ? 1 : 0] }

  content_type :json
  {
    page: page,
    per_page: per_page,
    total: total_count,
    total_pages: (total_count.to_f / per_page).ceil,
    transactions: results
  }.to_json
end

post "#{AppConfig::API_BASE_PATH}/deposit" do
  protected!
  data = JSON.parse(request.body.read)

  cvu = data["cvu"]
  amount = data["amount"].to_d

  if cvu.blank? || amount <= 0
    status 400
    content_type :json
    return { errors: { general: "CVU inválido o monto no permitido" } }.to_json
  end

  begin
    wallet = Wallet.find_by(cvu: cvu)

    unless wallet
      status 404
      content_type :json
      return { errors: { cvu: "No se encontró una billetera con ese CVU" } }.to_json
    end

    wallet.balance += amount
    wallet.save!

    status 200
    content_type :json
    { message: "Depósito exitoso" }.to_json
  rescue ActiveRecord::RecordInvalid => e
    status 422
    content_type :json
    formatted_errors = e.record.errors.to_hash(true).transform_values(&:first)
    { errors: formatted_errors }.to_json
  rescue => e
    status 400
    content_type :json
    { errors: { general: e.message } }.to_json
  end
end

post "#{AppConfig::API_BASE_PATH}/withdraw" do
  protected!
  data = JSON.parse(request.body.read)

  cvu = data["cvu"]
  amount = data["amount"].to_d

  if cvu.blank? || amount <= 0
    status 400
    content_type :json
    return { errors: { general: "CVU inválido o monto no permitido" } }.to_json
  end

  begin
    wallet = Wallet.find_by(cvu: cvu)

    unless wallet
      status 404
      content_type :json
      return { errors: { cvu: "No se encontró una billetera con ese CVU" } }.to_json
    end

    if wallet.balance < amount
      status 403
      content_type :json
      return { errors: { balance: "Saldo insuficiente para realizar el retiro" } }.to_json
    end

    wallet.balance -= amount
    wallet.save!

    status 200
    content_type :json
    { message: "Retiro exitoso", new_balance: wallet.balance.to_s }.to_json
  rescue ActiveRecord::RecordInvalid => e
    status 422
    content_type :json
    formatted_errors = e.record.errors.to_hash(true).transform_values(&:first)
    { errors: formatted_errors }.to_json
  rescue => e
    status 400
    content_type :json
    { errors: { general: e.message } }.to_json
  end
end

