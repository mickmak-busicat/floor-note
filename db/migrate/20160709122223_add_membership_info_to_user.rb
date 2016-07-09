class AddMembershipInfoToUser < ActiveRecord::Migration
  def change
  	add_column :users, :membership_id, :integer, index: true, foreign_key: true
  	add_column :users, :expires_at, :datetime
  end
end
