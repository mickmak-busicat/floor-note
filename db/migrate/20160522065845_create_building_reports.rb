class CreateBuildingReports < ActiveRecord::Migration
  def change
    create_table :building_reports do |t|
      t.references :user, index: true, foreign_key: true
      t.references :building, index: true, foreign_key: true
      t.text :title
      t.text :problem

      t.timestamps null: false
    end
  end
end
