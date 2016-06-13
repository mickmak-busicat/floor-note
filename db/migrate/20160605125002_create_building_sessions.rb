class CreateBuildingSessions < ActiveRecord::Migration
  def change
    create_table :building_sessions do |t|
      t.string :name
      t.references :building, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true
      t.text :payload
      t.integer :status

      t.timestamps null: false
    end
  end
end
