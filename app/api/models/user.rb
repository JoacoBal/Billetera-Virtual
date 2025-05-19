require 'bcrypt'

class User < ActiveRecord::Base
    include BCrypt

    # Asociaciones
    has_many :owned_wallets, class_name: 'Wallet', foreign_key: 'dni_owner', primary_key: 'dni'

    has_many :wallet_members, foreign_key: :user_dni, primary_key: :dni
    has_many :available_wallets, through: :wallet_members, source: :wallet

    # Validaciones
    validates :dni, presence: true, uniqueness: { message: 'Ya hay un Usuario con ese DNI registrado.' }
    validates :name, :lastName, :email, :password, :birthdate, :phone, presence: true
    validates :email, uniqueness: { message: 'Ya hay un Usuario con ese Email registrado.' }
    validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }

    after_create :create_default_wallet

    def password
        @password ||= Password.new(password_hash)
    end

    def password=(new_password)
        @password = Password.create(new_password)
        self.password_hash = @password
    end

    def create_default_wallet
        wallet = Wallet.create_wallet!(
            dni_owner: dni,
            type: 'principal'
        )
    end
end