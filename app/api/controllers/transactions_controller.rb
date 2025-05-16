require 'sinatra'
require 'json'
require_relative '../config/constants'
require_relative '../services/transactions_service'

# Crea una nueva transacción
post "#{AppConfig::API_BASE_PATH}/transfer" do
  data = JSON.parse(request.body.read)

  origin_cvu = data["origin_cvu"]
  destination_cvu = data["destination_cvu"]
  amount = data["amount"].to_d

  begin
    transfer_funds(origin_cvu: origin_cvu, destination_cvu: destination_cvu, amount: amount)
    status 200
    content_type :json
    { message: "Transferencia exitosa" }.to_json
  rescue => e
    status 400
    content_type :json
    { error: e.message }.to_json
  end
end