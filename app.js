var SingleNews = Backbone.Model.extend({
  defaults: {
    title: '',
    category: ''
  }
});

var AllNews = Backbone.View.extend({
  model: SingleNews
});
