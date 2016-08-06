class CreateShareableLinks < ActiveRecord::Migration
  def change
    create_table :shareable_links do |t|
      t.references :building_session, index: true, foreign_key: true
      t.string :code, :unique => true

      t.timestamps null: false
    end
  end
end
