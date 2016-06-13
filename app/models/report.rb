class Report < ActiveRecord::Base
  belongs_to :building
  belongs_to :floor
  belongs_to :floor_object
  belongs_to :user
end
