Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  scope "(:locale)", locale: /en|zh/ do
    root 'home#index'
    get 'test', :to => 'home#test', as: 'test'
    
    get 'request', :to => 'home#request_building', as: 'request_building'
    post 'request', :to => 'home#request_building_add', as: 'request_building_add'

    get 'improve', :to => 'home#improve', as: 'improve'
    post 'improve', :to => 'home#improve_add', as: 'improve_add'
    
    get 'compare', :to => 'home#compare_plan', as: 'compare'

    get 'tutorial', :to => 'home#tutorial', as: 'tutorial'

    get 'donate', :to => 'home#donate', as: 'donate'
    get 'donate_done', :to => 'home#donate_done', as: 'donate_done'

    get 'profile', :to => 'home#profile', as: 'profile'

    get 'upgrade', :to => 'home#upgrade', as: 'upgrade'

    get 'quota', :to => 'home#quota', as: 'quota'

    scope "work" do
      get 'blank', :to => 'work#blank', as: 'blank_mode'
      get 'session/:id', :to => 'work#active_session', as: 'normal_mode'
      delete 'session/:id/finish', :to => 'work#finish_work', as: 'finish_work'
      delete 'sessions/finish_all', :to => 'work#finish_all', as: 'finish_all'
    end

    get 'c/:token', :to => 'home#confirm_token', as: 'confirm_token'
    get 's/:code', :to => 'work#view_share_link', as: 'view_share_link'

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

    post 'confirm_email', :to => 'ajax#confirm_email', as: 'confirm_email'
    post 'account_upgrade', :to => 'ajax#account_upgrade', as: 'account_upgrade'

    post 'get_shareable_link', :to => 'ajax#shareable_link', as: 'shareable_link'
    post 'remove_shareable_link', :to => 'ajax#remove_shareable_link', as: 'remove_shareable_link'
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
