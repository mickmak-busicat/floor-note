class User < ActiveRecord::Base
  before_create :set_default_membership

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :building_sessions
  belongs_to :membership

  def get_monthly_usage
  	self.building_sessions.where('MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())').count
  end

  def use_extra_quota?
  	rs = (self.extra_quota > 0)
  	if rs
	  self.extra_quota = self.extra_quota - 1;
	  self.save
	end

	rs
  end

  private
  def set_default_membership
    self.membership ||= Membership.find_by({membership_id: Settings.MEMBERSHIP_ID.BASIC})
  end

end
