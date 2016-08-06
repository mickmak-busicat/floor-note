class BuildingSession < ActiveRecord::Base
  belongs_to :building
  belongs_to :user
  belongs_to :shareable_link

  def enabled?
  	self.status != 0
  end
end
