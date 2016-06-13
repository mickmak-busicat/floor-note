module Mobile
	module V1
		module ErrorFormatter
			def self.call message, backtrace, options, env
			  { :status => 'error', :response => message }.to_json
			end
		end
	end
end