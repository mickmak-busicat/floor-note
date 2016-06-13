class CreateRates < ActiveRecord::Migration
  def change
    create_table :rates do |t|
      t.integer :rating
      t.references :floor_object, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
