class Building < ActiveRecord::Base
	has_many :floors

	def ordered_floors
		self.floors.order(:seq).select(:id, :name, :seq)
	end
end
