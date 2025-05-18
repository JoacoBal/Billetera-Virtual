require 'jwt'
require 'dotenv/load'

module JwtHelper
  SECRET_KEY = ENV['SECRET_KEY'] || 'dev_key_no_usar'

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    raise ArgumentError, 'Payload must include :dni' unless payload.key?(:dni)

    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  rescue JWT::DecodeError => e
    nil
  end
end