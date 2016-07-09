class CreateMemberships < ActiveRecord::Migration
  def change
    create_table :memberships do |t|
      t.string :membership_id
      t.integer :active_limit
      t.integer :monthly_limit
      t.decimal :price, :precision => 10, :scale => 2

      t.timestamps null: false
    end
  end
end
