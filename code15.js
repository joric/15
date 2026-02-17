jQuery( function () 
{
  // Game model object
  var field = new (function () 
  {
    this.moves = 0;
    this.cells = [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ];
    this.isFree = function (row, col) 
    {
    	return -1 < col && 4 > col && -1 < row && 4 > row && 16 == this.cells[row][col];
    };

    this.isSolved = function () 
    {
      for (var i = 15; i > -1; i--) 
      {
        if ((i + 1) != this.cells[(i - (i % 4)) / 4][i % 4]) 
        {
          return false;
        }
      }
      return true;
    };

    this.move = function (p) 
    {
      var d = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      if (16 != this.cells[p.row][p.col]) 
      {
        for (var k in d) 
        {
          if (this.isFree(p.row + d[k][1], p.col + d[k][0])) 
          {
            this.cells[p.row + d[k][1]][p.col + d[k][0]] = this.cells[p.row][p.col];
            this.cells[p.row][p.col] = 16;
            p.col += d[k][0];
            p.row += d[k][1];
            return ++this.moves;
          }
        }
      }
      return false;
    };

    this.reset = function () 
    {
      var a, b, c, d, i, v = [];
      for (i = 0; i < 16; v.push(++i));
      var t = [a = [-4, -3, 1], b = [1, 5, 4], c = [4, 3, -1], d = [-1, -5, -4]];
      var ts = [[b],[b,c],[b,c],[c],[a,b],t,t,[c,d],[a,b],t,t,[c,d],[a],[a,d],[a,d],[d]];
      var i, cSet, sT, fc = 15, d;
      for (i = 0; i < 150; i++) 
      {
        sT = ts[fc][Math.round(Math.random() * (ts[fc].length - 1))];
        d = (Math.round(Math.random())) ? [2,0] : [0,2];
        v[fc] = v[sT[d[0]] + fc];
        v[sT[d[0]] + fc] = v[sT[1] + fc];
        v[sT[1] + fc] = v[sT[d[1]] + fc]
        fc += sT[d[1]];
      }
      v[fc] = 16;
      for (i = 0; i < 16; i++) 
      {
        this.cells[(i - (i % 4)) / 4][i % 4] = v[i];
      }
      this.moves = 0;
    };
  })();

  // Constants
  var cSize = 225;
  var cSizeh = 150;
  var cellCss = {};
  var cellNCss = [];
  var animTTL = 200;
  var drawN = false;
  var offset = {'left' : 0 , 'top': 0 };

  function doSetCursor()
  {
	for (var col = 0; col < 4; col++) 
	for (var row = 0; row < 4; row++) 
	{       
		var id = ".game-cell-" + field.cells[row][col];
		$(id).css({'cursor' : 'default' });
		var d = [[-1, 0], [1, 0], [0, -1], [0, 1]];
//		if (16 != field.cells[row][col]) 
			for (var k in d) 
				if (field.isFree(row + d[k][1], col + d[k][0])) 
					$(id).css({'cursor' : 'pointer' });
	}  	
  }
  
  function doResize() {  
  	var w = $(window);
  	dw = Math.round((w.width() - cSize * 4) / 2);
	dh = Math.round((w.height() - cSizeh * 4) / 2);
	offset = {'left' : dw , 'top': dh };
	$("#game15-img").css(offset);

	for (var col = 0; col < 4; col++) 
	for (var row = 0; row < 4; row++) 
	{       
		var id = ".game-cell-" + field.cells[row][col];
		x = col * cSize + offset.left;
		y = row * cSizeh + offset.top;
		$(id).css({'left' : x, 'top' : y });
		//$(id).animate({'left' : x, 'top' : y }, animTTL, function(){});
	}	
  };       
  var resizeTimer = null;  
  $(window).bind('resize', function() {  
  if (resizeTimer) clearTimeout(resizeTimer);  
  resizeTimer = setTimeout(doResize, 100);  
  });

  // jQuery part
  var lock = false, init = false, game15 = $('#game15').get(0);

  //var offset = {'left' : game15.offsetLeft + dw, 'top' : game15.offsetTop + dh };


  function win()
  {
	$("#game15-img").fadeIn("slow");
  }

  $('#win').click( function()
  {
  	win();
  });

  $('#shuffle').click( function () 
  {
    if (lock) return;
    field.reset();
    $('#moves').html('0');
    $('#game15-field').empty();
    for (var col = 0; col < 4; col++) 
    {
      for (var row = 0; row < 4; row++) 
      {
        var id = field.cells[row][col]-1;
        var rpos = id % 4;
        var cpos = (id - rpos) / 4;

        !field.isFree(row, col) && 
        ($('#game15-field').get(0).appendChild(
          $("<div class='game-cell game-cell-" + field.cells[row][col] + "'>" + (drawN ? field.cells[row][col] : "") + "</div>")
            .css(cellCss).css(cellNCss[field.cells[row][col]-1]||{}).css(
            {
            'left' : col * cSize + offset.left, 
            'top' : row * cSizeh + offset.top, 
            'background-position' :  -cSize*rpos + " " + -cSizeh*cpos + " "
            }
            )

            .click ( function () 
            {
		if (!lock && field.move(this._p)) 
		{
                	lock = true;
                	$('#moves').html('' + field.moves);
                	$(this).animate ( 
                		{
                		'left' : this._p.col * cSize + offset.left, 
                		'top' : this._p.row * cSizeh + offset.top 
                		}, animTTL, '', function () { 
                		lock = false; if (field.isSolved()) win(); 
                		});

                	doSetCursor();
              	}              	              	
            }).get(0))._p = {'row': row, 'col': col});
      }
    }
    if (!init) { doResize(); doSetCursor(); init = true; }    
  }).click();
});
