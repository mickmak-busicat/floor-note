class BuildingSession < ActiveRecord::Base
  belongs_to :building
  belongs_to :user

  def enabled?
  	self.status != 0
  end
end
