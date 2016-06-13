class AddDefaultStateToFloorOjbect < ActiveRecord::Migration
  def change
  	add_column :floor_objects, :default_status, :integer, :limit => 2, :default => 0
  end
end
