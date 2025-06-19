require 'sinatra'
require 'json'
require_relative '../models/wallet'
require_relative '../models/user'
require_relative '../config/constants'
require_relative '../services/wallets_service'
require_relative '../lib/errors'

# API endpoint to retrieve all wallets available to a user identified by their DNI.
# It first attempts to find the user with the given DNI. If the user is not found,
# it returns a 404 status with a corresponding error message.
# If the user exists, it fetches all wallets they have access to (e.g., owned or shared).
#
# @route GET /wallets/:dni
# @param [String] :dni - The DNI of the user
# @response [200] JSON array of wallets or empty array if none
# @response [404] JSON error message if the user is not found
get "#{AppConfig::API_BASE_PATH}/wallets/:dni" do
  protected!

  user = User.find_by(dni: params[:dni])
  if user.nil?
    status 404
    content_type :json
    return { error: Errors::USER[:not_found][:message] }.to_json
  end
  wallets = user.available_wallets
  content_type :json
  if wallets.any?
    if(params[:fields])
      selected_fields = params[:fields].split(',').map(&:strip)
      
      projected_wallets = wallets.map do |wallet|
        data = wallet.respond_to?(:attributes) ? wallet.attributes : wallet.as_json
        projection = data.slice(*selected_fields)

        if selected_fields.include?('members') && wallet.type == 'shared'
          projection['members'] = wallet.shared_member_emails
        end

        projection
      end

      projected_wallets.to_json
    else
      wallets.to_json
    end
  else
   [].to_json 
  end
end

post "#{AppConfig::API_BASE_PATH}/wallets" do
  data = JSON.parse(request.body.read)

  required_keys = %w[dni_owner type]
  missing_keys = required_keys.select { |k| data[k].nil? || data[k].strip.empty? }

  unless missing_keys.empty?
    status 400
    return { errors: { general: "Faltan los siguientes campos requeridos: #{missing_keys.join(', ')}" } }.to_json
  end

  dni_owner = data["dni_owner"]
  type = data["type"]
  alias_name = data["alias"] # puede ser nil
  
  if type == "principal"
    status 400
    return { errors: { general: "No es posible crear una caja de tipo principal, sólo es 1 por usuario." } }.to_json
  end

  begin
    wallet = WalletsService.create_wallets(dni_owner: dni_owner, type: type, alias_name: alias_name)
    status 201
    content_type :json
    wallet.to_json
  rescue ActiveRecord::RecordInvalid => e
    status 422
    { errors: { general: e.record.errors.full_messages.join(', ') } }.to_json
  rescue ArgumentError, StandardError => e
    status 400
    { errors: { general: e.message } }.to_json
  rescue JSON::ParserError
    status 400
    { errors: { general: "JSON inválido" } }.to_json
  rescue => e
    status 500
    { errors: { general: "Error inesperado: #{e.message}" } }.to_json
  end
end

delete "#{AppConfig::API_BASE_PATH}/wallets/:cvu" do
  protected!
  cvu = params[:cvu]
  begin
    WalletsService.delete_wallet(cvu)
    status 204
  rescue ArgumentError => e
    status 400
    { error: e.message }.to_json
  rescue ActiveRecord::RecordNotFound => e
    status 404
    { error: e.message }.to_json
  rescue => e
    status 500
    { error: "Error inesperado: #{e.message}" }.to_json
  end
end

# GET - Obtener una Wallet por CVU
get "#{AppConfig::API_BASE_PATH}/wallets/cvu/:cvu" do
  protected!

  wallet = Wallet.includes(:owner).find_by(cvu: params[:cvu])

  if wallet
    content_type :json
    {
      cvu: wallet.cvu,
      alias: wallet.alias,
      type: wallet.type,
      balance: wallet.balance,
      owner:{
        dni: wallet.owner.dni,
        name: wallet.owner.name,
        last_name: wallet.owner.lastName,
        email: wallet.owner.email,
        phone: wallet.owner.phone
      }
    }.to_json
  else
    status 404
    content_type :json
    {error: "No se encontro la billetera con CVU #{params[:cvu]}"}.to_json
  end
end

#Cambiar/Actualizar alias de la billetera
patch "#{AppConfig::API_BASE_PATH}/wallets/:cvu/alias" do
  content_type :json

  wallet = Wallet.find_by(cvu: params[:cvu])
  halt 404, { error: 'Wallet no encontrada'}.to_json unless wallet

  data = JSON.parse(request.body.read)
  nuevo_alias = data['alias']
  halt 400, { error: 'No se coloco ningun alias...'}.to_json unless nuevo_alias

  wallet.alias = nuevo_alias
  if wallet.save
    { message: 'Alias actualizado correctamente', alias: wallet.alias}.to_json
  else
      halt 500, { error: 'Ese alias no se puede utilizar'}.to_json
  end
end

#Obtener billetera a partir del alias
get "#{AppConfig::API_BASE_PATH}/wallets/alias/:alias" do
content_type :json

  wallet = Wallet.find_by(alias: params[:alias])
  halt 404, { error: 'Alias no encontrado...'}.to_json unless wallet

  {
    cvu: wallet.cvu,
    alias: wallet.alias,
    balance: wallet.balance,
    owner: wallet.owner.name
  }.to_json
end

post "#{AppConfig::API_BASE_PATH}/wallets/edit" do
  protected!

  data = JSON.parse(request.body.read)
  cvu = data["cvu"]
  new_members_emails = data["members"]&.map(&:strip)&.map(&:downcase)&.uniq
  new_alias = data["alias"]

  if new_members_emails.nil? && new_alias.nil?
    halt 400, { errors: { general: "No hay campos para actualizar" } }.to_json
  end

  wallet = Wallet.find_by(cvu: cvu)
  halt 404, { errors: { general: "La caja no fue encontrada" } }.to_json unless wallet
  begin
    ActiveRecord::Base.transaction do
      # Si hay alias, actualizarlo
      if new_alias
        wallet.alias = new_alias
        wallet.save!
      end
      # Si hay miembros y es una wallet compartida
        
      if new_members_emails && wallet.type == "shared"

        owner = User.find_by(dni: wallet.dni_owner)
        owner_email = owner&.email&.downcase

        if new_members_emails.include?(owner_email)
          halt 400, { errors: { general: "No se puede agregar al dueño de la wallet como miembro" } }.to_json
        end

        users = User.where(email: new_members_emails)
        existing_emails = users.map(&:email)
        missing_emails = new_members_emails - existing_emails

        unless missing_emails.empty?
          halt 400, { errors: { general: "Usuarios no encontrados: #{missing_emails.join(', ')}" } }.to_json
        end
      
        # Eliminar miembros actuales excepto el dueño
        WalletMember.where(wallet_cvu: cvu)
                    .where.not(user_dni: wallet.dni_owner)
                    .delete_all

        # Agregar nuevos miembros
        users.each do |user|
          WalletMember.create!(user_dni: user.dni, wallet_cvu: cvu)
        end
      elsif new_members_emails && wallet.type != "shared"
        halt 400, { errors: { general: "Solo se pueden modificar miembros en wallets compartidas" } }.to_json
      end
    end
  rescue ActiveRecord::RecordNotUnique
      halt 400, { errors: { general: "El alias ya está en uso por otra wallet" } }.to_json
  end

  content_type :json
  { message: "Wallet actualizada correctamente" }.to_json
end

post "#{AppConfig::API_BASE_PATH}/wallets/leave" do
  protected!
  user = current_user
  data = JSON.parse(request.body.read)
  cvu = data["cvu"]
  wallet = Wallet.find_by(cvu: cvu)
  halt 404, { errors: { general: "La caja no fue encontrada" } }.to_json unless wallet
  
  if wallet.type != "shared"
    halt 400, { errors: { general: "No puedes abandonar una caja si no es compartida." } }.to_json
  end
  if wallet.dni_owner == user.dni
    halt 400, { errors: { general: "No puedes abandonar una caja compartida si eres el dueño." } }.to_json
  end
  WalletMember.where(wallet_cvu: cvu)
              .where(user_dni: user.dni)
              .delete_all

  content_type :json
  { message: "Has abandonado la caja compartida con éxito." }.to_json
end