require 'rest-client'

class HomeController < ApplicationController
	before_filter :default_js, only: [:request_building, :request_building_add, :improve, :improve_add, :compare_plan, :tutorial, :donate, :donate_done, :confirm_token, :quota]
  before_filter :store_redirect, only: [:index, :donate, :profile, :upgrade]
  
  def index
  	clear_dead_session
  end

  def request_building

  end

  def donate

  end

  def donate_done

  end

  def profile
    redirect_to new_user_session_path(:locale => I18n.locale) and return if !user_signed_in?

    @active_count = get_active_session_count
    @monthly_count = current_user.get_monthly_usage
    @membership = current_user.membership
  end

  def request_building_add
  	user = current_user || nil
  	email_user = User.find_by(:email => request_building_add_params[:email])

  	if request_building_add_params[:building_name] != ""
	  	req = BuildingRequest.create!(request_building_add_params)
	  	req.user = user if !user.nil?
	  	req.save
	  end

  	@success = true
  	@email = request_building_add_params[:email] || nil
  	@email_exist = !email_user.nil?

  	render 'request_building'
  end

  def improve

  end

  def improve_add
  	user = current_user || nil
  	email_user = User.find_by(:email => improve_add_params[:email])

  	if improve_add_params[:reason] != ""
		report = Report.create!(improve_add_params)
		report.user = user if !user.nil?
		report.save
	end

	@success = true
	@email = improve_add_params[:email] || nil
	@email_exist = !email_user.nil?

	render 'request_building'
  end

  def compare_plan
    @basic = Membership.find_by({:membership_id => Settings.MEMBERSHIP_ID.BASIC})
    @active = Membership.find_by({:membership_id => Settings.MEMBERSHIP_ID.ACTIVE})
    @premium = Membership.find_by({:membership_id => Settings.MEMBERSHIP_ID.PREMIUM})
  end

  def tutorial

  end

  def confirm_token
    redirect_to new_user_session_path(:locale => I18n.locale) and return if !user_signed_in?

    token = confirm_token_params[:token]
    @message = ''

    if !current_user.confirmed?
      if current_user.confirmation_token == token
        current_user.is_confirmed = true;
        current_user.confirmation_token = current_user.confirmation_token+"_confirmed_"+current_user.id.to_s
        current_user.save

        @message = I18n.t 'confirm.success'
      else
        @message = I18n.t 'confirm.fail'
      end
    else
      redirect_to root_path(:locale => I18n.locale)
    end
  end

  def quota

  end

  def upgrade
    redirect_to new_user_session_path(:locale => I18n.locale) and return if !user_signed_in?

    @account_life = ((DateTime.now() - current_user.created_at.to_datetime)).to_i
    @month_usage = current_user.get_monthly_usage
    
    @is_verified = current_user.is_confirmed?
    @is_long_life_enough = (@account_life >= Settings.UPGRADE_CONFIG.ACCOUNT_LIFE)
    @is_enough_monthly_usage = (@month_usage >= Settings.UPGRADE_CONFIG.MONTHLY_SESSION)
    @account_type = current_user.membership.membership_id
  end

  private

	  def request_building_add_params
	  	params.permit(:building_name, :building_address, :tags, :email)
	  end

	  def improve_add_params
	  	params.permit(:reason, :comment, :email)
	  end

    def confirm_token_params
      params.permit(:token)
    end

    def store_redirect
      store_location_for(:user, request.url)
    end

end
