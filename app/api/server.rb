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
    user = User.new(email: data['email'])
    user.password = data['password']

    if user.save
      status 201
      { message: 'User created successfully' }.to_json
    else
      status 422
      { error: user.errors.full_messages }.to_json
    end
  end
end