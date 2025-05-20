require 'sinatra'
require 'json'
require_relative '../config/constants'

# Crea una nueva transacción
post "#{AppConfig::API_BASE_PATH}/transfer" do
  data = JSON.parse(request.body.read)

  origin_cvu = data["origin_cvu"]
  destination_cvu = data["destination_cvu"]
  amount = data["amount"].to_d
  description = data["description"]

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