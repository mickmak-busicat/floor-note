module Mobile
	class API < Grape::API

		helpers do
			# def authenticate!
			#   puts params[:auth_token]
		 #      error!('Unauthorized. Invalid token or email.', 401) unless current_user
		 #    end

			# def current_user
			# 	@user || find_user_by_email_and_token
			# end

			# private 
			# def find_user_by_email_and_token
			# 	user_email = params[:email].presence

			# 	if (user_email =~ /[0-9]{28}/)
			# 		@user = user_email && User.find_by(facebook_id: user_email)
			# 	else
			#     @user = user_email && User.find_by_email(user_email)
			# 	end
			 	
			#     # mitigating timing attacks.
			#     return @user && Devise.secure_compare(@user.authentication_token, params[:auth_token])
			# end
		end

		mount Mobile::V1::Root
	end
end