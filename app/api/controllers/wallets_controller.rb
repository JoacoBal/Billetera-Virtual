require 'sinatra'
require 'json'
require_relative '../models/wallet'
require_relative '../models/user'
require_relative '../config/constants'
require_relative '../services/wallets_service'

# Obtener todas las cajas
get "#{AppConfig::API_BASE_PATH}/wallets" do
  protected!
  
  wallets = Wallet.all
  content_type :json
  wallets.to_json
end

# Obtener cajas por dni (cajas donde el usuario es dueño)
get "#{AppConfig::API_BASE_PATH}/wallets/:dni" do
  wallets = Wallet.where(dni_owner: params[:dni])

  content_type :json
  if wallets.any?
    wallets.to_json
    status 404
    { error: 'No se encontraron cajas para el DNI proporcionado' }.to_json
  end
end

post "#{AppConfig::API_BASE_PATH}/wallets" do
  data = JSON.parse(request.body.read)

  required_keys = %w[dni_owner type]
  missing_keys = required_keys.select { |k| data[k].nil? || data[k].strip.empty? }

  unless missing_keys.empty?
    status 400
    return { error: "Faltan los siguientes campos requeridos: #{missing_keys.join(', ')}" }.to_json
  end

  dni_owner = data["dni_owner"]
  type = data["type"]
  alias_name = data["alias"] # puede ser nil

  begin
    wallet = WalletsService.create_wallets(dni_owner: dni_owner, type: type, alias_name: alias_name)
    status 201
    content_type :json
    wallet.to_json
  rescue ActiveRecord::RecordInvalid => e
    status 422
    { error: e.record.errors.full_messages.join(', ') }.to_json
  rescue ArgumentError, StandardError => e
    status 400
    { error: e.message }.to_json
  rescue JSON::ParserError
    status 400
    { error: "JSON inválido" }.to_json
  rescue => e
    status 500
    { error: "Error inesperado: #{e.message}" }.to_json
  end
end

# DELETE - Eliminar una wallet por CVU, los fondos, en caso de tener, deben ser transferidos a
# la caja principal del dueño.
# Si la Wallet es tipo "Principal" entonces no puede ser borrada.

# GET - Obtener una Wallet por CVU