require 'sinatra'
require 'json'
require_relative '../models/user'

# Obtener todos los usuarios
get '/users' do
  users = User.all
  content_type :json
  users.to_json
end

# Crear un nuevo usuario
post '/users' do
  data = JSON.parse(request.body.read)
  user = User.new(data)
  if user.save
    status 201
    content_type :json
    user.to_json
  else
    status 422
    content_type :json
    { errors: user.errors.full_messages }.to_json
  end
end

# Obtener un usuario por DNI
get '/users/:dni' do
  user = User.find_by(dni: params[:dni])
  
  if user
    content_type :json
    user.to_json
  else
    status 404
    content_type :json
    { error: 'User not found' }.to_json
  end
end

# Actualizar un usuario por DNI
put '/users/:dni' do
  user = User.find_by(dni: params[:dni])
  
  if user
    data = JSON.parse(request.body.read)
    if user.update(data)
      status 200
      content_type :json
      user.to_json
    else
      status 400
      content_type :json
      { error: 'Failed to update user' }.to_json
    end
  else
    status 404
    content_type :json
    { error: 'User not found' }.to_json
  end
end

# Eliminar un usuario por DNI
delete '/users/:dni' do
  user = User.find_by(dni: params[:dni])
  
  if user
    user.destroy
    status 204
  else
    status 404
    content_type :json
    { error: 'User not found' }.to_json
  end
end