class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  def generate_authentication_token
    loop do
      self.authentication_token = Devise.friendly_token
      break self.authentication_token unless User.where(authentication_token: self.authentication_token).first
    end
  end

  
end
