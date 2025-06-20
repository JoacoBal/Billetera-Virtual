require 'bundler/setup'
require 'sinatra/base'
require 'sinatra/reloader' if Sinatra::Base.environment == :development
require 'logger'
require 'active_record'
require 'sinatra/activerecord'

require 'json'
require_relative './lib/jwt_helper'

require_relative 'models/user'
require_relative 'models/wallet'
require_relative 'models/wallet_member'
require_relative 'models/transaction'

Dir["./services/**/*.rb"].each { |file| require_relative file }
Dir["./controllers/**/*.rb"].each { |file| require_relative file }

class App < Sinatra::Application
  configure :development do
    set :bind, '0.0.0.0'
    enable :logging
    logger = Logger.new(STDOUT)
    logger.level = Logger::DEBUG if development?
    set :logger, logger

    register Sinatra::Reloader
    after_reload do
      logger.info 'Reloading...'
    end
  end

  options '*' do
    200
  end

  helpers do
    def current_user
      auth_header = request.env['HTTP_AUTHORIZATION']
      token = auth_header.split(' ').last if auth_header
      decoded = JwtHelper.decode(token)
      @current_user ||= User.find(decoded[:dni]) if decoded
    rescue
      nil
    end

    def protected!
      return if current_user
      halt 401, { error: 'Unauthorized' }.to_json
    end
  end


  get '/' do
    "Welcome"
  end

  post "#{AppConfig::API_BASE_PATH}/login" do
    content_type :json
    data = JSON.parse(request.body.read)
    user = User.find_by(email: data['email'])
    logger.info("Intentando loguear")

    if user && user.password == data['password']
      token = JwtHelper.encode({ dni: user.dni })
      { token: token }.to_json
    else
      status 401
      { error: 'Invalid email or password' }.to_json
    end
  end

  post "#{AppConfig::API_BASE_PATH}/register" do
    content_type :json
    data = JSON.parse(request.body.read)
    logger.info(data)
    user = User.new({
      dni: data['dni'],
      email: data['email'],
      name: data['name'],
      lastName: data['lastName'],
      birthdate: data['birthdate'],
      phone: data['phone']
    })
    user.password = data['password']

    if user.save
      status 201
      { message: 'User created successfully' }.to_json
    else
      status 422
      {
        errors: user.errors.messages.transform_values(&:first)
      }.to_json
    end
  end
  
  
  
  post "#{AppConfig::API_BASE_PATH}/add" do
	  content_type :json
	  data = JSON.parse(request.body.read)
	  cvu = data['cvu']
	  amount = data['amount']&.to_f

	  unless amount > 0
		status 400
		return { error: 'El monto debe ser positivo' }.to_json
	  end

	  begin
		wallet = Wallet.find_by!(cvu: cvu)

		
		new_balance = wallet.balance + amount
		wallet.update!(balance: new_balance)

		status 200
		{ message: "Depósito realizado con éxito", new_balance: wallet.balance }.to_json # wallet.balance valor actualizado
	  rescue ActiveRecord::RecordNotFound
		status 404
		{ error: "Cartera con CVU #{cvu} no encontrada" }.to_json
	  rescue => e
		status 500
		{ error: "Error interno del servidor: #{e.message}" }.to_json
	  end
  end
  
  
  
end
