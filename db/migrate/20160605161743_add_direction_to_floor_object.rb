class AddDirectionToFloorObject < ActiveRecord::Migration
  def change
  	add_column :floor_objects, :direction, :string, :limit => 10
  end
end
