class AddStatusToRoomRating < ActiveRecord::Migration
  def change
  	add_column :rates, :status, :integer, :limit => 1, :default => 0
  end
end
