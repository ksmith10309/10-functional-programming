'use strict';
var app = app || {};

// Katherine: Wrap the contents of article.js in an IIFE and give the IIFE a parameter called module
(function articleIIFE(module) {

  module.Article = function(rawDataObj) {
  // REVIEW: In Lab 8, we explored a lot of new functionality going on here. Let's re-examine the concept of context. Normally, "this" inside of a constructor function refers to the newly instantiated object. However, in the function we're passing to forEach, "this" would normally refer to "undefined" in strict mode. As a result, we had to pass a second argument to forEach to make sure our "this" was still referring to our instantiated object. One of the primary purposes of lexical arrow functions, besides cleaning up syntax to use fewer lines of code, is to also preserve context. That means that when you declare a function using lexical arrows, "this" inside the function will still be the same "this" as it was outside the function. As a result, we no longer have to pass in the optional "this" argument to forEach!
    Object.keys(rawDataObj).forEach(key => this[key] = rawDataObj[key]);
  }

  module.Article.all = [];

  module.Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.published_on))/60/60/24/1000);
    this.publishStatus = this.published_on ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  module.Article.loadAll = articleData => {
    articleData.sort((a,b) => (new Date(b.published_on)) - (new Date(a.published_on)))

    /* OLD forEach():
    articleData.forEach(articleObject => app.Article.all.push(new module.Article(articleObject)));
    */

    // Katherine: In the loadAll() method, refactor the old forEach() to use map() instead
    app.Article.all = articleData.map(articleObject => new module.Article(articleObject));
  };

  module.Article.fetchAll = callback => {
    $.get('/articles')
      .then(results => {
        module.Article.loadAll(results);
        callback();
      })
  };

  // Katherine: Chain together a map() and a reduce() to get a count of all words in all articles
  module.Article.numWordsAll = () => {
    return app.Article.all.map(article => article.body.split(' ').length).reduce( (acc, cur) => acc + cur);
  };

  // Katherine: Chain together a map() and a reduce() to produce an array of unique author names
  module.Article.allAuthors = () => {
    return app.Article.all.map(article => article.author).sort().reduce( (acc, cur) => {
      const length = acc.length;
      if (length === 0 || acc[length - 1] !== cur) {
        acc.push(cur);
      }
      return acc;
    }, []);
  };

  // Katherine: Transform each author string into an object with properties for the author's name, as well as the total number of words across all articles written by the specified author
  module.Article.numWordsByAuthor = () => {
    return app.Article.allAuthors().map(author => {
      var object = {};
      object.author = author;
      object.numWords = app.Article.all.filter(article => article.author === author).map(article => article.body.split(' ').length).reduce( (acc, cur) => acc + cur);
      return object;
    });
  };

  module.Article.truncateTable = callback => {
    $.ajax({
      url: '/articles',
      method: 'DELETE',
    })
      .then(console.log)
    // REVIEW: Check out this clean syntax for just passing 'assumed' data into a named function! The reason we can do this has to do with the way Promise.prototype.then() works. It's a little outside the scope of 301 material, but feel free to research!
      .then(callback);
  };

  module.Article.prototype.insertRecord = function(callback) {
  // REVIEW: Why can't we use an arrow function here for .insertRecord()?
  // Katherine: We can't use an arrow function here because the "this" keyword is used so the function needs to have its own context. Arrow functions do not have their own context.
    $.post('/articles', {author: this.author, author_url: this.author_url, body: this.body, category: this.category, published_on: this.published_on, title: this.title})
      .then(console.log)
      .then(callback);
  };

  module.Article.prototype.deleteRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'DELETE'
    })
      .then(console.log)
      .then(callback);
  };

  module.Article.prototype.updateRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'PUT',
      data: {
        author: this.author,
        author_url: this.author_url,
        body: this.body,
        category: this.category,
        published_on: this.published_on,
        title: this.title,
        author_id: this.author_id
      }
    })
      .then(console.log)
      .then(callback);
  };

})(app);
