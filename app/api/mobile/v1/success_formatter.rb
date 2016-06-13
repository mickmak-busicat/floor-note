module Mobile
	module V1
		module SuccessFormatter
		    def self.call object, env
		      { :status => 'success', :data => object }.to_json
		    end
	  	end
	end
end