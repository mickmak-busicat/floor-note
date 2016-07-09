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

  end

  def tutorial

  end

  private

	  def request_building_add_params
	  	params.permit(:building_name, :building_address, :tags, :email)
	  end

	  def improve_add_params
	  	params.permit(:reason, :comment, :email)
	  end

end
