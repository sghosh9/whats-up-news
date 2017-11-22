
  var SingleNews = Backbone.Model.extend({
    defaults: {
      title: '',
      category: ''
    }
  });

  var News = Backbone.Collection.extend({
    model: SingleNews,

    // Default value for sort column and directtion.
    sortColumn: 'title',
    sortDirection: 1,

    // Sort handler for News collection.
    // Sets the sort column and direction and triggers sort.
    sortNews: function(column, direction) {
      this.sortColumn = column;
      this.sortDirection = direction;
      this.sort();
    },

    // Custom sorting based on the provided column and direction.
    comparator: function(news1, news2) {
      // Get the values of given column.
      var value1 = news1.get(this.sortColumn).toLowerCase(),
          value2 = news2.get(this.sortColumn).toLowerCase();

      if (value1 == value2) return 0;

      // Depending on the direction, compare and return a value.
      if (this.sortDirection == 1) {
         return value1 > value2 ? 1 : -1;
      } else {
         return value1 < value2 ? 1 : -1;
      }
    }
  });



  // Dummy data
  var NewsItems = [
    {title: 'Lorem', category: 'Food'},
    {title: 'ipsum', category: 'Politics'},
    {title: 'dolor', category: 'Movies'},
    {title: 'sit', category: 'War'},
    {title: 'amet', category: 'Page 3'},
  ];
  var NewsCollection = new News();
  _.each(NewsItems, function(news) {
    var NewsModel = new SingleNews(news);
    NewsCollection.add(NewsModel);
  });




  var NewsView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#row-template').html()),

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    }
  });

  var NewsTableView = Backbone.View.extend({
    el: $('table'),
    events: {
      'click th': 'headerClick'
    },
    initialize: function() {
      this.listenTo(NewsCollection, 'sort', this.refreshTable);

      this.refreshTable();
    },

    // Handler for click event on table header.
    headerClick: function(event) {
      console.log(event);
    },

    // Handler for sort event on collection.
    refreshTable: function() {
      console.log(this);
      var tableBody = this.$('tbody');
      NewsCollection.each(function(news) {
        var newsRow = new NewsView({model: news});
        tableBody.append(newsRow.render().el);
      });
    },

    render: function() {
      console.log('rendering');
      return this;
    }
  });

  new NewsTableView;
