require 'sinatra'
require 'json'
require_relative '../models/wallet'
require_relative '../models/user'
require_relative '../config/constants'
require_relative '../services/wallets_service'
require_relative '../lib/errors'

# API endpoint to retrieve all wallets available to a user identified by their DNI.
# It first attempts to find the user with the given DNI. If the user is not found,
# it returns a 404 status with a corresponding error message.
# If the user exists, it fetches all wallets they have access to (e.g., owned or shared).
#
# @route GET /wallets/:dni
# @param [String] :dni - The DNI of the user
# @response [200] JSON array of wallets or empty array if none
# @response [404] JSON error message if the user is not found
get "#{AppConfig::API_BASE_PATH}/wallets/:dni" do
  protected!

  user = User.find_by(dni: params[:dni])
  if user.nil?
    status 404
    content_type :json
    return { error: Errors::USER[:not_found][:message] }.to_json
  end
  wallets = user.available_wallets
  content_type :json
  if wallets.any?
    if(params[:fields])
      selected_fields = params[:fields].split(',').map(&:strip)
      
      projected_wallets = wallets.map do |wallet|
        data = wallet.respond_to?(:attributes) ? wallet.attributes : wallet.as_json
        data.slice(*selected_fields)
      end

      projected_wallets.to_json
    else
      wallets.to_json
    end
  else
   [].to_json 
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

delete "#{AppConfig::API_BASE_PATH}/wallets/:cvu" do
  protected!
  cvu = params[:cvu]
  begin
    WalletsService.delete_wallet(cvu)
    status 204
  rescue ArgumentError => e
    status 400
    { error: e.message }.to_json
  rescue ActiveRecord::RecordNotFound => e
    status 404
    { error: e.message }.to_json
  rescue => e
    status 500
    { error: "Error inesperado: #{e.message}" }.to_json
  end
end

# GET - Obtener una Wallet por CVU