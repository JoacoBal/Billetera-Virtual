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

  def self.delete_wallet(cvu)
    wallet = Wallet.find_by(cvu: cvu)
    raise ActiveRecord::RecordNotFound, "Wallet con CVU #{cvu} no encontrada" if wallet.nil?

    raise ArgumentError, "No se puede eliminar una wallet de tipo 'principal'" if wallet.type == 'principal'

    user = User.find_by(dni: wallet.dni_owner)
    raise ActiveRecord::RecordNotFound, "Dueño de la wallet no encontrado" if user.nil?

    main_wallet = user.wallets.find_by(type: 'principal')
    raise StandardError, "Wallet principal no encontrada" if main_wallet.nil?

    if wallet.balance > 0
      main_wallet.balance += wallet.balance
      main_wallet.save!
    end

    wallet.destroy!
  end
end