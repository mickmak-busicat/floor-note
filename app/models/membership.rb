class Membership < ActiveRecord::Base
	has_many :users
end
