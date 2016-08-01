class AddUserLastSentConfirmation < ActiveRecord::Migration
  def change
  	add_column :users, :last_confirmation_sent, :datetime
  end
end
