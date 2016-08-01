require 'rest-client'

class HomeController < ApplicationController
	before_filter :default_js, only: [:request_building, :request_building_add, :improve, :improve_add, :compare_plan, :tutorial, :donate, :donate_done]
  
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
    @active_count = get_active_session_count
    @monthly_count = current_user.get_monthly_usage if user_signed_in?
    @membership = current_user.membership if user_signed_in?
    redirect_to new_user_session_path(:locale => I18n.locale) if !user_signed_in?
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
    token = confirm_token_params[:token]

    if current_user.confirmation_token == token

    end
    # redirect_to new_user_session_path(:locale => I18n.locale) if !user_signed_in?
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

end
