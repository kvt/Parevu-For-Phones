$(document).ready(function() {
			var template = '<div class="panel"> <div class="panel-heading"> <h3 class="panel-title"> <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#{{id}}"> {{title}} </a> </h3> </div> <div id="{{id}}" class="panel-collapse collapse"> <div class="panel-body"> {{body}} </div> </div> </div>';
      var alertTemplate = '<div class="alert alert-block alert-danger fade in"> <button type="button" class="close" data-dismiss="alert" aria-hidden="true">x</button> <h4>Oh snap! Word <b>{{word}}</b> not found!</h4> <p>Change search query and try again. </p> </div>';

       $('.navbar-form').submit(function() {

  				var $query = $.trim($("#search").val());
  				if($query) {

  					$('.panel-group').html('');
  					$('#busy').show();
  					$.ajax({
  						url: "http://www.tools4all.net/parevu-dictionary/indexnew.php?isJson=true&search="+$query,
  						success: function(data) {
  							var meanings = data.split('~1~1~1');
  							var i=1;
  							meanings.pop();
                if(meanings.length < 1) {
                  $('.panel-group').html(alertTemplate.replace('{{word}}', $query));
                }
  							$.each(meanings, function(index, spelling){
  								var newId = "collapse"+i;
  								var html = '';
  								var newSpelling = spelling.split('~~~');
  								//console.log(newSpelling);
  								html = template.replace('{{title}}', newSpelling[0] + ' ' + newSpelling[1] + ' ' + newSpelling[2]);
  								html = html.replace('{{body}}', newSpelling[3] );
  								html = html.replace(/\{\{id\}\}/g,  newId);
  								//console.log(template);

  								$('.panel-group').append(html);
  								i++;

  							});
  							$('#busy').hide();
  							$('.panel-collapse').collapse('hide').first().collapse('show')
  						}

  					});
					  					
  				}
			  	return false;
			});
$('.navbar-form').trigger('submit');
		});