class ModifyUserConfirmedDefault < ActiveRecord::Migration
  def change
  	change_column :users, :is_confirmed, :boolean, :default => false
  end
end
