class Floor < ActiveRecord::Base
  belongs_to :building
  has_many :floor_objects
end
