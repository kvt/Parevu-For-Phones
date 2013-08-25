(function() {
  var counter = 0, isRunning = false;
  var db = window.openDatabase('ParevuDictionary', '1.0', '', 1024*1024*30);

  var sync = function(index) {
    isRunning = true;
    var that = this;
    $.getJSON("db/"+index+".js", function(data) {
      db.transaction(function(tx) {
        var q = "insert into parevu (word, word_type, pronounciation, meaning) values (:row, :type, :pro, :mean)";
        $.each(data, function(idx, row) {
          tx.executeSql(q, [row.word, row.word_type, row.pronounciation, row.meaning], new Function, new Function);
        });
        isRunning = false;
      }, function(e) { console.log(e) }, function() {});
    });
  };

  var defer = function() {
    if(!isRunning) {
      if(counter >= 322) {
        db.transaction(function(tx) {
          tx.executeSql("update settings set isSynced=1", [] , function() {
            history.go(-1);
            return;
          });
        });
        return;
      }

      db.transaction(function(tx) {

        var sql = "select count(*) as word from parevu";
        tx.executeSql(sql, [], function(tx, results) {
         document.getElementById('db-status').innerText = getStatus(results.rows.item(0).word);
         if(counter % 50 == 0 && counter > 0) {
          history.replaceState("", "", 'install.html?page='+(counter+1));
        }             

        sync(++counter);
        setTimeout(defer, 100);
      }, new Function);
      });          
    } else {
      setTimeout(defer, 100);
    }
  };

  var getStatus = function(done) {
    return Math.ceil((counter * 100) / 325); 
  };

  var loc = document.location.href;
  if(loc.indexOf('page') > -1) {
    var index = loc.split('page=');
    counter = parseInt(index[1]);
    isRunning = true;
    defer();
    sync(counter);
  }
  document.getElementById('db-status').innerText = counter;
  //history.replaceState({},"Parevu Dictionary","index.html");

}(window));
