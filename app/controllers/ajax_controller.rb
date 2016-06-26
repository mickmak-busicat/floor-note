class AjaxController < ApplicationController
  
  def search
  	# puts current_user.inspect
  	query = search_params[:query].split(' ')
    like_cond = query.map {|q| 'tag LIKE ?'}.join(' AND ')
    searches = query.map {|q| "%#{q}%"}

  	@result = Building.where(like_cond, *searches)
  end

  def work
  	count = get_active_session_count
  	@building_session = nil

  	if ( user_signed_in? && count < Settings.SESSION_COUNT.REGISTERED ) || ( !user_signed_in? && count < Settings.SESSION_COUNT.GUEST )
  		create_building_session
  	end

  	render_error_json('Quota full', 422) if @building_session.nil?
  end

  def update_session_name
  	render_error_json('Session not found', 404) if session[:active_session].nil?

  	session_id = session_name_params[:id].to_i
  	new_session_name = session_name_params[:name]

  	session[:active_session].each do |ss|
  		if ss['id'] == session_id
  			ss['name'] = new_session_name
  		end
  	end

  	db_session = BuildingSession.find_by(:id => session_id, :status => 1)

  	if !db_session.nil?
  		db_session.name = new_session_name
  		db_session.save
  	end

  	render_success_json
  end

  def rate_room
    render_error_json('Please login') if current_user.nil?

  	render_success_json
  end

  def session_save
  	ids = session_save_params[:id]
  	data = session_save_params[:data]

    render_error_json('Not data', 404) if (ids.nil? || data.nil?)

  	if ids.count > 0
  		ids.each_with_index do |id, index|
        ss = nil
        if user_signed_in?
          ss = BuildingSession.find_by(:id => id.to_i, :user => current_user)
        else
          ss = BuildingSession.find_by(:id => id.to_i, :guest_key => session[:guest_key])
        end
  			
        if !ss.nil?
          ss.payload = data[index].to_s
          # ss.status = 0
          ss.save
        end
  		end
  	end

  	render_success_json
  end

  def report_problem
    user_id = nil
    if !current_user.nil?
      user_id = current_user.id 
    end
    building_id = report_problem_params[:building_id] || nil
    floor_id = report_problem_params[:floor_id] || nil
    room_id = report_problem_params[:room_id] || nil
    reason = report_problem_params[:reason] || nil
    comment = report_problem_params[:comment] || ""

    Report.create(:building_id => building_id, :floor_id => floor_id, :floor_object_id => room_id, :user_id => user_id, :reason => reason, :comment => comment)

    render_success_json
  end

  def admin_new_floor
    floor = Floor.create(new_floor_params)

    render json: floor, status: 200
  end

  def admin_new_floor_object
    object = FloorObject.create(new_floor_object_params)

    render json: object, status: 200
  end

  private

	  def search_params
	  	params.permit(:query)
	  end

	  def work_params
	  	params.permit(:building, :name)
	  end

	  def session_name_params
	  	params.permit(:id, :name)
	  end

	  def rate_room_params
	  	params.permit(:id, :rating)
	  end

	  def session_save_params
	  	params.permit(:id => [], :data => [])
	  end

    def report_problem_params
      params.permit(:building_id, :floor_id, :room_id, :comment, :reason)
    end

    def new_floor_params
      params.permit(:building_id, :name, :seq)
    end

    def new_floor_object_params
      params.permit(:floor_id, :x, :y, :label, :object_type, :width, :height, :direction, :default_status)
    end

	  def create_building_session
	  	@building_session = BuildingSession.create!(:name => work_params[:name], :building_id => work_params[:building], :user => current_user, :status => 1, :guest_key => session[:guest_key])

	  	if @building_session.save
	  		add_active_session(@building_session.id, work_params[:name])
	  	end
	  end

	  def render_error_json(msg, status = 400)
	  	render json: {error: msg, status: 'error'}, :status => status
	  end

	  def render_success_json(msg = '')
	  	render json: {status: 'success', result: msg}, :status => 200
	  end
end
