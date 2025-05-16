require 'sinatra'
require 'json'
require_relative '../models/wallet'
require_relative '../models/transaction'

module TransactionsService
  def self.transfer_funds(origin_cvu:, destination_cvu:, amount:, description: nil)
    raise ArgumentError, "El monto debe ser positivo" if amount <= 0
    raise ArgumentError, "El CVU de origen no puede ser igual al CVU de destino" if origin_cvu == destination_cvu

    ActiveRecord::Base.transaction do
      origin = Wallet.find_by(cvu: origin_cvu)
      destination = Wallet.find_by(cvu: destination_cvu)

      raise ActiveRecord::RecordNotFound, "Caja de origen no encontrada" if origin.nil?
      raise ActiveRecord::RecordNotFound, "Caja de destino no encontrada" if destination.nil?
      raise "Saldo insuficiente" if origin.balance < amount

      origin.balance -= amount
      destination.balance += amount

      origin.save!
      destination.save!

      Transaction.create!(
        origin_cvu: origin_cvu,
        destination_cvu: destination_cvu,
        amount: amount,
        description: description # será nil si no se pasa
      )
    end
  end
end