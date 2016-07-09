class AddExtraQuotaToUser < ActiveRecord::Migration
  def change
  	add_column :users, :extra_quota, :integer, :default => 0
  end
end
