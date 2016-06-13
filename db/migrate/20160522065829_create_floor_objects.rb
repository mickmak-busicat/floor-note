class CreateFloorObjects < ActiveRecord::Migration
  def change
    create_table :floor_objects do |t|
      t.float :x
      t.float :y
      t.string :label
      t.references :floor, index: true, foreign_key: true
      t.string :type
      t.float :width
      t.float :height

      t.timestamps null: false
    end
  end
end
