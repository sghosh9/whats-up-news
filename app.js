
  // Model for single news items.
  var SingleNews = Backbone.Model.extend({
    defaults: {
      title: '',
      category: ''
    }
  });

  // Collection for collection of single news item models SingleNews.
  var News = Backbone.Collection.extend({
    model: SingleNews,

    // Default value for sort column and directtion.
    sortColumn: 'id',
    sortDirection: 1,

    // Sort handler for News collection to trigger sorting of collection.
    sortNews: function() {
      this.sort();
    },

    // Custom sorting based on the provided column and direction.
    comparator: function(news1, news2) {
      // Get the values of given column.
      var value1 = news1.get(this.sortColumn),
          value2 = news2.get(this.sortColumn);

      value1 = (typeof value1 == 'string') ? value1.toLowerCase() : value1;
      value2 = (typeof value2 == 'string') ? value2.toLowerCase() : value2;

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
    {id: 1, title: 'Lorem', category: 'Food'},
    {id: 2, title: 'ipsum', category: 'Politics'},
    {id: 3, title: 'dolor', category: 'Movies'},
    {id: 4, title: 'sit', category: 'War'},
    {id: 5, title: 'amet', category: 'Page 3'},
  ];
  // Creating a collection of news objects NewsItems.
  var NewsCollection = new News();
  _.each(NewsItems, function(news) {
    var NewsModel = new SingleNews(news);
    NewsCollection.add(NewsModel);
  });


  // View for each table row of news item.
  var NewsView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#row-template').html()),

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    }
  });

  // View for entire table.
  var NewsTableView = Backbone.View.extend({
    el: $('table'),
    events: {
      'click th': 'headerClick'
    },
    initialize: function() {
      this.listenTo(NewsCollection, 'sort', this.render);

      this.render();
    },

    // Handler for click event on table header.
    headerClick: function(event) {
      var clickedColumn = $(event.currentTarget),
          newSort = clickedColumn.attr('column'),
          currentSort = NewsCollection.sortColumn;

      // Set the sort column of the collection to the new column.
      NewsCollection.sortColumn = newSort;

      // If same column was clicked ie. current sort reversed, we will just change the direction.
      if (newSort == currentSort) {
        NewsCollection.sortDirection *= -1;
      }
      // Else, set the direction to default.
      else {
        NewsCollection.sortDirection = 1;
      }

      // Trigger sorting of collection after above updates.
      NewsCollection.sortNews();
    },

    // Handler for sort event on collection.
    render: function() {
      var tableBody = this.$('tbody');
      tableBody.empty();
      NewsCollection.each(function(news) {
        var newsRow = new NewsView({model: news});
        tableBody.append(newsRow.render().el);
      });
      return this;
    }
  });

  new NewsTableView;
