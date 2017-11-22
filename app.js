var SingleNews = Backbone.Model.extend({
  defaults: {
    title: '',
    category: ''
  }
});

var AllNews = Backbone.Collection.extend({
  model: SingleNews
});

var NewsItems = [
  {title: 'News 1', category: 'Food'},
  {title: 'News 2', category: 'Movies'},
  {title: 'News 3', category: 'Politics'},
];


var AllNewsView = Backbone.View.extend({
  el: $('tbody'),
  template: _.template($('#row-template').html()),
  initialize: function() {
    this.collection = new AllNews();

    var self = this;
    _.each(NewsItems, function(news) {
      var NewsModel = new SingleNews(news);
      self.collection.add(NewsModel);
    });

    this.render();

    this.listenTo(this.collection, 'change', this.render);

  },
  render: function() {
    var self = this;
    _.each(this.collection.models, function(news) {
      self.$el.append(self.template(news.attributes));
    });
  }
});

new AllNewsView;
