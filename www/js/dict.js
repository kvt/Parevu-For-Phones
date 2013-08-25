      var parevuDictionary = parevuDictionary || {
        defaults: {
          dbConfig: {
            name: 'ParevuDictionary',
            version: "1.0",
            displayName: "Parevu Dictionary",
            size: 1024*1024*30
          },
          template: '<div class="panel"> <div class="panel-heading"> <h3 class="panel-title"> <a class="accordion-toggle" href="#"> {{title}} </a> </h3> </div> <div class="panel-collapse collapse"> <div class="panel-body"> {{body}} </div> </div> </div>',
          alertTemplate: '<div class="alert alert-block alert-danger"> <h4>Oh snap! Word <b>{{word}}</b> not found!</h4> <p>Change search query and try again. </p> </div>',
          flag: false,
          $query: '',
          db: null
        },
        init: function(defaults) {
          $.extend(this.defaults, defaults);
          this.db = this.openDatabase(this.defaults.dbConfig);
          this.dbTransaction(this.db, { action: this.createTable }, this.dbErrorHandler);
          this.bindEvents();
        },
        openDatabase: function(dbConfig) {
          return window.openDatabase(dbConfig.name, dbConfig.version, dbConfig.displayName, dbConfig.size);
        },
        dbTransaction: function(db, args, dbErrorHandler, successHandler) {
          var that = this;
          if(typeof dbErrorHandler === 'undefined') {
            dbErrorHandler = function() {};
            
          }
         
          
          if(typeof successHandler === 'undefined') {
            successHandler = function() {};
          }
          if(typeof args.data === 'undefined') {
            args.data = {};
          }
          db.transaction(function(tx){
            args.action.call(that, tx, args.data);
          }, dbErrorHandler, successHandler);
        },
        dbErrorHandler: function(err) {
          console.log(err);
        },
        createTable: function(tx) {
          var sql, that = this;
          if(document.location.href.indexOf('delRec') > -1) {
            tx.executeSql('DROP TABLE IF EXISTS parevu');
            tx.executeSql('DROP TABLE IF EXISTS settings');
          }
          var sql = "CREATE TABLE IF NOT EXISTS parevu ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "word VARCHAR(50), " + "word_type VARCHAR(50), " + "pronounciation VARCHAR(50), " + "meaning text)";
          tx.executeSql(sql);
          sql = "select * from settings limit 1";
          tx.executeSql(sql, [], function(tx, res){
            that.settings = res.rows.item(0);

            if(that.settings.isSynced == "0") {
              document.location = 'install.html?page=1';
            }
          }, function() {
            sql = "CREATE TABLE IF NOT EXISTS settings ( " +
              "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
              "isSynced NUMBER(1) default 0, " +
              "rated NUMBER(1) default 0);";
          tx.executeSql(sql);
          sql = "INSERT INTO settings (isSynced, rated) VALUES (0,0);";
          tx.executeSql(sql);
          document.location = "install.html?page=1";

        });

        }, /*createTable*/
        insertWord: function(tx, data) {
          tx.executeSql("INSERT INTO parevu (word,word_type,pronounciation,meaning) VALUES ('" + data.word + "','" + data.word_type + "','" + data.pronounciation + "','" + data.meaning + "')");
        },
        getWords: function(tx, data) {
          var that = this;
          var sql = "select * from parevu where word like :query limit 15";
          tx.executeSql(sql, [data.query + "%"], function(tx, results) {
           data.success.call(that, tx, results, data.query);
         }, this.dbErrorHandler);
        },
        bindEvents: function() {
          var defaults = this.defaults;
          var that = this;
          defaults.$searchForm.submit(function(e) {
            e.preventDefault();
            that.loading(true);
            var query = $.trim(defaults.$inputBox.val()).toLowerCase();
            if (!query) return false;
            var args = { 
              action: that.getWords, 
              data: {
                query: query,
                success: that.renderResults
              }
            };
            that.dbTransaction(that.db, args, that.dbErrorHandler);
          });
          defaults.$panelGroup.on("click", defaults.panelHeading, function(e){
            e.preventDefault();
            $(this).next().toggle();
          });
        },
        renderResults: function(tx, results, query) {
          var that = this,
          len = results.rows.length;

          that.defaults.$panelGroup.html(null);
          if (len > 0) {
            for (var i = 0; i < len; i++) {
              that.appendWords(results.rows.item(i));
            }
            $('.collapse').first().show();
            that.loading(false);
            return true;
          }

          $.ajax({
            url: "http://www.tools4all.net/parevu-dictionary/installDb.php",
            //url: "proxy.php",
            data: "isJson=true&search=" + query,
            success: function(data) {
              if (data[0].meaning == "0") {
                that.defaults.$panelGroup.html(that.defaults.alertTemplate.replace('{{word}}', query));
                return false;
              }
              $.each(data, function(index, spelling) {
                that.appendWords(spelling);
                /*that.db.transaction(function(tx) {
                  that.insertWord(tx, spelling);
                }); */
            });
              that.loading(false);
              $('.collapse').first().show();
            }

          });
        },
        appendWords: function(spelling) {
          var html = '';
          html = this.defaults.template.replace('{{title}}', spelling.word + ' ' + spelling.word_type + ' ' + spelling.pronounciation);
          html = html.replace('{{body}}', spelling.meaning);

          this.defaults.$panelGroup.append(html);
        },
        loading: function(flag) {
          var flag = flag === undefined ? null : flag;
          this.defaults.$loading.toggle(flag);
        },
      }; /*main*/

      $(document).ready(function(){
        parevuDictionary.init({
          $searchForm:          $('#navbar-form'),
          $inputBox:            $('#input-box'),
          $loading:             $('#busy'),
          $panelGroup:          $('.panel-group'),
          $panelHeading:        $('.panel-heading'),
          panelHeading:         '.panel-heading'
        });

      });

//aaa
