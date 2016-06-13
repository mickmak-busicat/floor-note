module Mobile
  module V1
    class Root < Grape::API
    	formatter :json, SuccessFormatter
		error_formatter :json, ErrorFormatter

		mount Mobile::V1::Buildings
    end
  end
end