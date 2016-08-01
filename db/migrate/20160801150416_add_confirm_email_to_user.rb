class AddConfirmEmailToUser < ActiveRecord::Migration
  def change
  	add_column :users, :confirmation_token, :string, :unique => true
  	add_column :users, :is_confirmed, :boolean
  end
end
