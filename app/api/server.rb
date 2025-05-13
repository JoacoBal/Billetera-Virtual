require 'bundler/setup'
require 'sinatra/base'
require 'sinatra/reloader' if Sinatra::Base.environment == :development
require 'logger'
require 'active_record'
require 'sinatra/activerecord'

require_relative 'models/user'

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

  get '/' do
    "Welcome"
  end
end