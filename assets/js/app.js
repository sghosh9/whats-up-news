var appGlobal = (function () {
  return {
    // Returns double digits preceeded by 0 for single vnumbers.
    formatDateTwoDigits: function (number) {
      return number < 10 ? '0' + number : number;
    },
    // Returns null if input string is not alphanumeric.
    isAlphaNumeric: function (input) {
      var regExp = /^[A-Za-z0-9\-]+$/;
      return (input.match(regExp));
    }
  }
})();

// Convert a timestamp to readable date format yyyy-mm-dd hh:mm in UTC.
_.template.formatDate = function (timestamp) {
  var date = new Date(timestamp * 1000);
  return date.getUTCFullYear() + '-' + (date.getUTCMonth()+1) + '-' + date.getUTCDate() + ' ' + appGlobal.formatDateTwoDigits(date.getUTCHours()) + ':' + appGlobal.formatDateTwoDigits(date.getUTCMinutes());
}

$(function() {

  var apiKey = '27c99f6f19554a2b84566fb9d1744b10'
  var apiURL = 'https://newsapi.org/v2/everything?apiKey=' + apiKey;

  // Model for single news items.
  var NewsModel = Backbone.Model.extend({
    defaults: {
      title: '',
      author: '',
      source: '',
      publishedAt: 0,
      url: '',
      description: ''
    },
    parse: function(response) {

      // Convert author null values to ''.
      if (response.author == null) {
        response.author = '';
      }

      // Store date as timestamp for sorting.
      var publishedTimestamp = Date.parse(response.publishedAt);
      publishedTimestamp = publishedTimestamp/1000;
      response.publishedAt = publishedTimestamp;

      // Moves source from nested to be a direct attribute.
      response.source = response.source.name;

      return response;
    }
  });

  // Collection for collection of single news item models NewsModel.
  var NewsCollection = Backbone.Collection.extend({
    model: NewsModel,

    url: apiURL,

    // Parsing to pass just articles array inside the response.
    parse: function(response) {
      return response.articles;
    },

    // Default value for sort column and directtion.
    sortColumn: 'publishedAt',
    sortDirection: -1,

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

  // View for each table row of news item.
  var NewsView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#row-template').html()),

    render: function() {
      // // Convert publishedat timestamp to readable date format.
      // var publishedDate = formatDate(this.model.attributes.publishedAt);
      // this.model.attributes.publishedAt = publishedDate;
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
      // Re-render the table on both sort and sync events on the collection.
      this.listenTo(this.collection, 'sort sync', this.render);
    },

    // Handler for click event on table header.
    headerClick: function(event) {
      var clickedColumn = $(event.currentTarget),
          newSort = clickedColumn.attr('column'),
          currentSort = this.collection.sortColumn;

      // Set the sort column of the collection to the new column.
      this.collection.sortColumn = newSort;

      // If same column was clicked ie. current sort reversed, we will just change the direction.
      if (newSort == currentSort) {
        this.collection.sortDirection *= -1;
      }
      // Else, set the direction to default.
      else {
        this.collection.sortDirection = 1;
      }

      // Trigger sorting of collection after above updates.
      this.collection.sortNews();
    },

    // Handler for sort event on collection.
    render: function() {
      // Store the tbody element for multiple uses.
      var tableBody = this.$('tbody');
      // Make the table entry before appending results.
      tableBody.empty();

      // For each model, call the NewsView view to render each row.
      _(this.collection.models).each(function(news) {
        var newsRow = new NewsView({model: news});
        tableBody.append(newsRow.render().el);
      });
      return this;
    }
  });

  // Model for search form.
  var SearchModel = Backbone.Model.extend({
    searchInput: '',
    initialize: function() {
      // Create a NewsCollection collection with parsing on its model enabled.
      this.newscollection = new NewsCollection({parse: true});
      // Pass it to the NewsTableView view.
      new NewsTableView({collection: this.newscollection});
    },
    newsSearch: function(input) {
      // Fetch the data from the collection's url.
      this.newscollection.fetch({
        reset: true,
        data: {
          q: input
        },
        success: function(response) {
          // console.log(response);
        },
        error: function(response) {
          // console.log(response);
        },
      });
    }
  });

  // View for search form.
  var SearchView = Backbone.View.extend({
    el: $('#news-search'),
    events: {
      'keyup input': _.debounce(function(event){
        this.triggerSearch(event);
       }, 500),
    },
    triggerSearch: function(event) {
      var searchInput = $(event.currentTarget),
          searchInputPrev = this.model.searchInput,
          input = searchInput.val();

      // If
      //   value is enetered, AND
      //   value enetered is alphanumeric, AND
      //   value is new compared to the old searched valued
      // then, start the news search with the value.
      if (input && appGlobal.isAlphaNumeric(input) && input != searchInputPrev) {
        this.model.searchInput = input;
        this.model.newsSearch(searchInput.val());
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

  // // Creating a collection of news objects NewsItems.
  // var NewsToday = new NewsCollection();
  // _.each(NewsItems, function(news) {
  //   var NewsItem = new NewsModel(news);
  //   NewsToday.add(NewsItem);
  // });

  // new NewsTableView({collection: NewsToday});

  // Create a new SearchModel model.
  var newsSearch = new SearchModel();
  // Pass it to the SearchView view.
  new SearchView({model: newsSearch});

});