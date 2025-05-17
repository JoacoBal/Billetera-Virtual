class User < ActiveRecord::Base
    # Asociaciones
    has_many :wallets, foreign_key: 'dni_owner', primary_key: 'dni'

    # Validaciones
    validates :dni, presence: true, uniqueness: true
    validates :name, :lastName, :email, :password, :birthdate, :phone, presence: true
    validates :email, uniqueness: true
    validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
end