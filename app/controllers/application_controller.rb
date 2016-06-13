class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_action :set_locale
  before_action :set_title_name
  before_action :set_active_session_info

  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end

  def set_title_name
    @title_name = 'Floor Note'
  end

  def hide_footer
  	@hide_footer = true
  end

  def default_js
    @default_js = true
  end

  def set_active_session_info
    @session_count = get_active_session_count
    @active_session_info = get_active_session
    @dead_session = session[:dead_session] || []
  end

  def add_active_session(session_id, session_name)
    session[:active_session] ||= []
    session[:active_session].push({id: session_id, name: session_name})
  end

  def remove_active_session(session_id)
    session[:dead_session] ||= []
    session[:dead_session].push(session_id.to_i)

    if !session[:active_session].nil?
      target_obj = nil

      session[:active_session].each do |s|
        if s['id'] == session_id.to_i
          target_obj = s
          break
        end
      end

      session[:active_session].delete(target_obj) if !target_obj.nil?
    end
  end

  def get_active_session
    session[:active_session] ||= []
    active_session = []

    if user_signed_in?
      active_session = BuildingSession.where(:user_id => current_user.id, :status => 1).map{ |ss| Hash['id', ss.id, 'name', ss.name] }
    else
      active_session = session[:active_session]
    end

    active_session
  end

  def get_active_session_count
    session[:active_session] ||= []
    get_active_session.count
  end

  def clear_dead_session
    session[:dead_session] = []
  end

  def get_session_info(session_id)
    active_session = get_active_session
    target_obj = nil

    if !active_session.nil?
      active_session.each do |s|
        if s['id'] == session_id.to_i
          target_obj = s
          break
        end
      end
    end

    target_obj
  end
end
