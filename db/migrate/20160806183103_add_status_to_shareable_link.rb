class AddStatusToShareableLink < ActiveRecord::Migration
  def change
  	add_column :shareable_links, :status, :boolean, :default => true
  end
end
