module ApplicationHelper
	def my_devise_error_messages!
	    return "" if resource.errors.empty?

	    messages = ''#resource.errors.full_messages.map { |msg| content_tag(:li, msg) }.join
	    sentence = I18n.t("errors.messages.not_saved",
	                      count: resource.errors.count,
	                      resource: resource.class.model_name.human.downcase)

	    resource.errors.messages.each_with_object({}) do |msg, key|
	    	messages += '<div>'+msg[1].join(',')+'</div>';
	    end

	    html = <<-HTML
	    <div id="error_explanation">
	      #{messages}
	    </div>
	    HTML

	    html.html_safe
	  end
end
