require 'rest-client'

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
    month_usage = 0
  	@building_session = nil
    from_session = nil
    from_session_id = work_params[:from_session_id]

    activeLimit = (user_signed_in?) ? current_user.membership.active_limit : Settings.GUEST_SESSION_COUNT
    statusMsg = I18n.t('index.full_quota').sub!('`COUNT`', activeLimit.to_s)

    if user_signed_in?
      month_usage = current_user.get_monthly_usage

      # TODO: check account expire here
      if current_user.membership.membership_id == Settings.MEMBERSHIP_ID.ACTIVE && !current_user.expires_at.nil? && current_user.expires_at < DateTime.now
        # extend or end active membership
        if month_usage >= Settings.KEEP_ACTIVE_CONFIG.MONTHLY_SESSION
          # extend membership
          current_user.expires_at = DateTime.now() + 30.days
        else
          current_user.membership = Membership.find_by(:membership_id => Settings.MEMBERSHIP_ID.BASIC)
        end
        current_user.save
      end
    end

    # 1. check usage here
    # 2. upgrade to ACTIVE for BASIC user
  	if count < activeLimit
      if user_signed_in?
        if !from_session_id.nil?
          from_session = BuildingSession.find_by(:id => from_session_id)
        end
        # checking for registered users
        if month_usage >= current_user.membership.monthly_limit
          if current_user.use_extra_quota?
            # registered users can create session when they reach limit and account have extra quota.
            create_building_session(from_session)
          else
            statusMsg = I18n.t('index.limit_reach')
          end
        else
          # registered users can create session when not reach limit.
          create_building_session(from_session)
        end
      else
        # guest can create session when there is no active session
        create_building_session
      end
  	end

  	render_error_json(statusMsg, 422) if @building_session.nil?
  end

  def update_session_name
  	render_error_json('Session not found', 404) and return if session[:active_session].nil?

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
    render_error_json('Please login') and return if current_user.nil?

  	render_success_json
  end

  def session_save
  	ids = session_save_params[:id]
  	data = session_save_params[:data]

    render_error_json('Not data', 404) and return if (ids.nil? || data.nil?)

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

  def confirm_email
    # ((DateTime.now() - old)*24*60*60).to_i
    render_error_json('Please login', 400) and return if current_user.nil?

    last_sent = current_user.last_confirmation_sent
    if last_sent != nil
      last_sent = last_sent.to_datetime
      interval = ((DateTime.now() - last_sent)*24*60*60).to_i

      puts 'wait: '
      puts interval

      # render_error_json('Please wait', 422) and return if interval < 900
    end

    token = current_user.prepare_email_confirmation

    begin
      data = {}
      data[:from] = "FloorNote Team <noreply@floornote.com>"
      data[:to] = current_user.email
      data[:subject] = I18n.t 'confirm.email_title'

      # views/devise/mailer/confirmation_instructions.html.erb
      file = File.join(Rails.root, 'app', 'views', 'devise', 'mailer', 'confirmation_instructions.html.erb')
      contents = File.read(file)
      contents.sub!('`DOMAIN`', request.host_with_port)
      contents.sub!('`CONFIRMATION_TOKEN`', token)

      puts data.inspect

      data[:html] = contents

      RestClient.post "https://api:#{ENV['FLOORNOTE_MAILGUN_KEY']}"\
      "@api.mailgun.net/v3/floornote.com/messages", data
    rescue Exception
      # handle everything else
      puts '-------'
      puts "Confirmation Email sent Error #{$!}"
      puts '-------'
    end

    render_success_json
  end

  def account_upgrade
    render_error_json('Please login', 400) and return if current_user.nil?

    account_life = ((DateTime.now() - current_user.created_at.to_datetime)).to_i
    month_usage = current_user.get_monthly_usage
    
    is_verified = current_user.is_confirmed?
    is_long_life_enough = (account_life >= Settings.UPGRADE_CONFIG.ACCOUNT_LIFE)
    is_enough_monthly_usage = (month_usage >= Settings.UPGRADE_CONFIG.MONTHLY_SESSION)

    if is_verified && is_enough_monthly_usage && is_long_life_enough
      current_user.membership = Membership.find_by(:membership_id => Settings.MEMBERSHIP_ID.ACTIVE)
      current_user.expires_at = DateTime.now() + 30.days
      current_user.save

      render_success_json
    else
      render_error_json
    end
  end

  def shareable_link
    ids = session_save_params[:id]
    data = session_save_params[:data]
    code = ''

    render_error_json('Not data', 404) and return if (ids.nil? || data.nil?)

    if ids.count > 0
      ids.each_with_index do |id, index|
        ss = BuildingSession.find_by(:id => id.to_i, :user => current_user)
        
        if !ss.nil?
          ss.payload = data[index].to_s
          slink = ShareableLink.find_by(:building_session_id => ss.id)

          if !slink
            ln_code = ShareableLink.get_code
            ShareableLink.create!(:building_session => ss, :code => ln_code)

            code = ln_code
          else
            if !slink.status
              slink.status = true
              slink.save
            end
            code = slink.code
          end

          ss.save
        end
      end
    end

    render_success_json({code: code})
  end

  def remove_shareable_link
    id = remove_shareable_link_params[:sid]

    render_error_json('Not data', 404) and return if (id.nil?)

    slink = ShareableLink.find_by(:building_session_id => id)

    render_error_json('Not link for this session', 404) and return if !slink

    if slink.building_session.user.id == current_user.id
      # slink.delete
      slink.status = false
      slink.save
    end

    render_success_json
  end

  private

	  def search_params
	  	params.permit(:query)
	  end

	  def work_params
	  	params.permit(:building, :name, :from_session_id)
	  end

	  def session_name_params
	  	params.permit(:id, :name)
	  end

	  def rate_room_params
	  	params.permit(:id, :rating)
	  end

    def remove_shareable_link_params
      params.permit(:sid)
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

	  def create_building_session(from_session = nil)
      payload = ''
      if !from_session.nil?
        payload = from_session.payload
      end

      puts payload

	  	@building_session = BuildingSession.create!(:name => work_params[:name], :building_id => work_params[:building], :user => current_user, :status => 1, :guest_key => session[:guest_key], :payload => payload)

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
