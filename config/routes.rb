Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  scope "(:locale)", locale: /en|zh/ do
    root 'home#index'
    get 'test', :to => 'home#test', as: 'test'
    get 'request', :to => 'home#request_building', as: 'request_building'
    get 'report', :to => 'home#report_app', as: 'report_app'

    scope "work" do
      get 'blank', :to => 'work#blank', as: 'blank_mode'
      get 'session/:id', :to => 'work#active_session', as: 'normal_mode'
      delete 'session/:id/finish', :to => 'work#finish_work', as: 'finish_work'
      delete 'sessions/finish_all', :to => 'work#finish_all', as: 'finish_all'
    end

    devise_for :users, controllers: { sessions: 'users/sessions', registrations: 'users/registrations', passwords: 'users/passwords' }
  end

  # mount Mobile::API => '/api'

  scope '/ajax', constraints: { format: 'json' } do
    get 'search', :to => 'ajax#search', as: 'search'
    post 'work', :to => 'ajax#work', as: 'start_work'
    post 'update_session_name', :to => 'ajax#update_session_name', as: 'update_session_name'
    post 'rate', :to => 'ajax#rate_room', as: 'rate_room'
    post 'session_save', :to => 'ajax#session_save', as: 'session_save'
    post 'report_problem', :to => 'ajax#report_problem', as: 'report_problem'

    post 'new_floor', :to => 'ajax#admin_new_floor', as: 'admin_new_floor'
    post 'new_floor_object', :to => 'ajax#admin_new_floor_object', as: 'admin_new_floor_object'
  end

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
