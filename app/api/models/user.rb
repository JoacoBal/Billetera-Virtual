require 'bcrypt'

class User < ActiveRecord::Base
    include BCrypt

    # Asociaciones
    has_many :wallets, foreign_key: 'dni_owner', primary_key: 'dni'

    # Validaciones
    validates :dni, presence: true, uniqueness: true
    validates :name, :lastName, :email, :password, :birthdate, :phone, presence: true
    validates :email, uniqueness: true
    validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }

    def password
        @password ||= Password.new(password_hash)
    end

    def password=(new_password)
        @password = Password.create(new_password)
        self.password_hash = @password
  end
end