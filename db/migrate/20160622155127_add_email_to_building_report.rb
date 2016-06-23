class AddEmailToBuildingReport < ActiveRecord::Migration
  def change
  	add_column :reports, :email, :string
  end
end
