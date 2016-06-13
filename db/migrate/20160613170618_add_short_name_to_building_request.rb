class AddShortNameToBuildingRequest < ActiveRecord::Migration
  def change
  	add_column :building_requests, :tags, :string
  end
end
