class ShareableLink < ActiveRecord::Base
  belongs_to :building_session

  def self.get_code
  	rs = ''
  	o = [('a'..'z'), ('A'..'Z'), ('0'..'9')].map { |i| i.to_a }.flatten
  	number_of_digit = (ShareableLink.count + 1000).to_s

  	loop do
      rs = (0...number_of_digit.length).map { o[rand(o.length)] }.join
      break rs unless ShareableLink.where(code: rs).first
    end
  	
  	rs
  end
end
