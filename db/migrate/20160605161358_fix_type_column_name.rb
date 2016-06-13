class FixTypeColumnName < ActiveRecord::Migration
  def change
  	rename_column :floor_objects, :type, :object_type
  end
end
