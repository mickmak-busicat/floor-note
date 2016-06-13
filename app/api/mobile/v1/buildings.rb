module Mobile
  module V1
    class Buildings < Grape::API
      prefix        ''
      version       'v1'
      format        :json
      rescue_from   :all

      resource :search do 
        desc "Search building"
        params do 
          requires :query, type: String, desc: "keyword name"
        end

        get do 
          result = Building.where("tag LIKE ?", "%#{params[:query]}%")

          present result, with: Mobile::Entities::EntityBuilding
        end
      end

	# END class
    end
  end
end