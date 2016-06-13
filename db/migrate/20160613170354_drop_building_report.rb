class DropBuildingReport < ActiveRecord::Migration
  def change
  	drop_table :building_reports
  end
end
