class AddEmailToBuildingRequest < ActiveRecord::Migration
  def change
  	add_column :building_requests, :email, :string
  end
end
