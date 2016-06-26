class AddGuestKeyToBuildingSession < ActiveRecord::Migration
  def change
  	add_column :building_sessions, :guest_key, :string, :unique => true
  end
end
