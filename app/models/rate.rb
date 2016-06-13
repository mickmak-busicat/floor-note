class Rate < ActiveRecord::Base
  belongs_to :floor_object
  belongs_to :user
end
