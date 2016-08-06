class WorkController < ApplicationController
	before_action :hide_footer
	protect_from_forgery
  
	def blank
		@title_name = I18n.t "blank.mode_title"
	end

	def active_session
		@title_name = ''
		session_id = params[:id]

		@building_data = BuildingSession.find_by(:id => session_id, :status => 1)

		@session_data = get_session_info(session_id)
		
		if @building_data.nil? || @session_data.nil?
			flash[:alert] = I18n.t 'work.no_session'
			remove_active_session(session_id)
			redirect_to root_path(:locale => I18n.locale)
		end

		slink = ShareableLink.find_by(:building_session_id => @building_data.id)

		@shareable_link = slink.nil? ? '' : slink.code
	end

	def finish_work
		active_session = get_active_session
		if active_session.count == 0
			flash[:alert] = I18n.t 'work.no_session'
			redirect_to root_path(:locale => I18n.locale)
			return
		end

	  	session_id = params[:id]

	  	remove_active_session(session_id)

	  	db_session = BuildingSession.find_by(:id => session_id)

	  	if !db_session.nil?
	  		db_session.status = 0
	  		db_session.save
	  	end

	  	flash[:notice] = I18n.t 'work.finish_work'
	  	redirect_to root_path(:locale => I18n.locale)
	end

	def finish_all
		active_session = get_active_session

		if active_session.count == 0
			flash[:alert] = I18n.t 'work.no_session'
			redirect_to root_path(:locale => I18n.locale)
			return
		end

		active_sessions = session[:active_session].clone

        active_sessions.each do |s|
          # db_session = BuildingSession.find_by(:id => s['id'], :status => 1)
          # if !db_session.nil?
          #   db_session.status = 0
          #   db_session.save
          # end
          remove_active_session(s['id'])
        end

        db_session = BuildingSession.where(:user => current_user, :status => 1)
        if db_session.count > 0
        	db_session.update_all(:status => 0)
        	# db_session.save
        end

	  	flash[:notice] = I18n.t 'work.finish_work'
	  	redirect_to root_path(:locale => I18n.locale)
	end

	def view_share_link
		store_location_for(:user, request.url)
		redirect_to new_user_session_path(:locale => I18n.locale) and return if !user_signed_in?

		@title_name = ''
		code = params[:code]

		slink = ShareableLink.find_by(:code => code)

		redirect_to root_path(:locale => I18n.locale) and return if slink.nil? || !slink.status

		@building_data = slink.building_session
	end

end
