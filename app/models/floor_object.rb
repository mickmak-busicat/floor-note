class FloorObject < ActiveRecord::Base
  belongs_to :floor
  has_many :reports, :dependent => :nullify
end
