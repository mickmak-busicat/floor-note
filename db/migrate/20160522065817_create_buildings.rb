class CreateBuildings < ActiveRecord::Migration
  def change
    create_table :buildings do |t|
      t.text :name
      t.text :address
      t.text :tag

      t.timestamps null: false
    end
  end
end
