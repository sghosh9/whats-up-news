var SingleNews = Backbone.Model.extend({
  defaults: {
    title: '',
    category: ''
  }
});

var AllNews = Backbone.Collection.extend({
  model: SingleNews,
  sortNews: function(column) {
    this.sort();
  },
  comparator: function(news1, news2) {
    var value1 = news1.get('title').toLowerCase(),
        value2 = news2.get('title').toLowerCase();

    if (value1 == value2) return 0;

    return value1 > value2 ? 1 : -1;
  }
});

var NewsItems = [
  {title: 'Lorem', category: 'Food'},
  {title: 'ipsum', category: 'Politics'},
  {title: 'dolor', category: 'Movies'},
  {title: 'sit', category: 'War'},
  {title: 'amet', category: 'Page 3'},
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
