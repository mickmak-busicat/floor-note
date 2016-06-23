class Floor < ActiveRecord::Base
  belongs_to :building
  has_many :floor_objects, :dependent => :delete_all
  has_many :reports, :dependent => :delete_all
end
