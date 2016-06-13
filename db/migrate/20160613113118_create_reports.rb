class CreateReports < ActiveRecord::Migration
  def change
    create_table :reports do |t|
      t.references :building, index: true, foreign_key: true
      t.references :floor, index: true, foreign_key: true
      t.references :floor_object, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true
      t.text :reason
      t.text :comment

      t.timestamps null: false
    end
  end
end
