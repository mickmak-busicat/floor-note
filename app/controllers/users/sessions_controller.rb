class Users::SessionsController < Devise::SessionsController
  before_filter :default_js
# before_filter :configure_sign_in_params, only: [:create]

  before_action :disable_user_session, only: [:destroy]
  after_action :assign_session_to_user, only: [:create]

  # GET /resource/sign_in
  def new
    super
  end

  # POST /resource/sign_in
  def create
    super
  end

  # DELETE /resource/sign_out
  def destroy
    all_sessions = BuildingSession.where(:user_id => current_user.id, :status => 1).map{ |ss| Hash['id', ss.id, 'name', ss.name] }
    # all_sessions = session[:active_session]
    super

    session[:dead_session] ||= []
    all_sessions.each do |s|
      session[:dead_session].push(s['id'].to_i)
    end
  end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.for(:sign_in) << :attribute
  # end

  private
    def assign_session_to_user
      if !session[:active_session].nil?
        session[:active_session].each do |s|
          db_session = BuildingSession.find_by(:id => s['id'], :status => 1)
          if !db_session.nil?
            db_session.user = current_user
            db_session.save
          end
        end
      end
    end

    def disable_user_session
      if !session[:active_session].nil?
        session[:active_session].each do |s|
          db_session = BuildingSession.find_by(:id => s['id'], :status => 1)
          if !db_session.nil?
            db_session.status = 0
            db_session.save
          end
        end
      end
    end
end
