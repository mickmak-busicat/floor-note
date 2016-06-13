class CreateBuildingRequests < ActiveRecord::Migration
  def change
    create_table :building_requests do |t|
      t.references :user, index: true, foreign_key: true
      t.text :building_name
      t.text :building_address

      t.timestamps null: false
    end
  end
end
