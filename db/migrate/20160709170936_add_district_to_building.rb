class AddDistrictToBuilding < ActiveRecord::Migration
  def change
  	add_column :buildings, :district, :string
  end
end
