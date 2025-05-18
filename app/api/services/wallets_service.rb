require 'sinatra'
require 'json'
require_relative '../models/wallet'

module WalletsService
  def self.create_wallets(dni_owner:, type:, alias_name: nil)
    # Verificar que el usuario exista
    user = User.find_by(dni: dni_owner)
    raise ActiveRecord::RecordNotFound, "Usuario con DNI #{dni_owner} no existe" if user.nil?
    raise ArgumentError, "Tipo inválido. Debe ser 'principal' o 'secondary'" unless %w[principal secondary].include?(type)
    
    wallet = Wallet.create_wallet!(
      dni_owner: dni_owner,
      alias: alias_name,
      type: type
    )
    wallet
  end
end