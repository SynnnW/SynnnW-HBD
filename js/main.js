/* SCRIPT BERSIH BY ANGGUN GANTENG */
var states = Object.freeze({ SplashScreen: 0, GameScreen: 1, ScoreScreen: 2 });
var currentstate;
var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var flyArea = 0; // Akan dihitung pas game mulai biar akurat
var score = 0;
var highscore = 0;
var pipeheight = 100;
var pipewidth = 52;
var pipes = new Array();
var replayclickable = false;

// SOUNDS
var soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(30);

var loopGameloop;
var loopPipeloop;

$(document).ready(function() {
   flyArea = $("#gamescreen").height() * 0.8; // Otomatis baca tinggi HP (80% langit)
   var savedscore = getCookie("highscore");
   if(savedscore != "") highscore = parseInt(savedscore);
   showSplash();
});

function getCookie(cname) {
   var name = cname + "=";
   var ca = document.cookie.split(';');
   for(var i=0; i<ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
   }
   return "";
}

function setCookie(cname,cvalue,exdays) {
   var d = new Date();
   d.setTime(d.getTime()+(exdays*24*60*60*1000));
   var expires = "expires="+d.toGMTString();
   document.cookie = cname + "=" + cvalue + "; " + expires;
}

function showSplash() {
   currentstate = states.SplashScreen;
   velocity = 0; position = 180; rotation = 0; score = 0;
   $("#player").css({ y: 0, x: 0 });
   updatePlayer($("#player"));
   soundSwoosh.stop().play();
   $(".pipe").remove();
   pipes = new Array();
   $(".animated").css('animation-play-state', 'running');
   $("#splash").transition({ opacity: 1 }, 2000, 'ease');
}

function startGame() {
   currentstate = states.GameScreen;
   $("#splash").stop().transition({ opacity: 0 }, 500, 'ease');
   setBigScore();
   var updaterate = 1000.0 / 60.0 ;
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(updatePipes, 1400);
   playerJump();
}

function updatePlayer(player) {
   rotation = Math.min((velocity / 10) * 90, 90);
   $(player).css({ rotate: rotation, top: position });
}

function gameloop() {
   var player = $("#player");
   velocity += gravity; position += velocity;
   updatePlayer(player);

   var box = document.getElementById('player').getBoundingClientRect();
   var origwidth = 34.0; var origheight = 24.0;
   var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxheight = (origheight + box.height) / 2;
   var boxleft = ((box.width - boxwidth) / 2) + box.left;
   var boxtop = ((box.height - boxheight) / 2) + box.top;
   var boxright = boxleft + boxwidth;
   var boxbottom = boxtop + boxheight;

   // Hit ground?
   if(box.bottom >= $("#land").offset().top) { playerDead(); return; }

   var ceiling = $("#ceiling");
   if(boxtop <= (ceiling.offset().top + ceiling.height())) position = 0;

   if(pipes[0] == null) return;

   var nextpipe = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");
   var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
   var pipeleft = nextpipeupper.offset().left - 2; 
   var piperight = pipeleft + pipewidth;
   var pipebottom = pipetop + pipeheight;

   // Collision logic
   if(boxright > pipeleft) {
      if(boxtop > pipetop && boxbottom < pipebottom) { }
      else { playerDead(); return; }
   }

   // Passed pipe
   if(boxleft > piperight) {
      pipes.splice(0, 1);
      playerScore();
   }
}

// Benerin bug double tap di HP
$(document).off("touchstart mousedown").on("touchstart mousedown", function(e) {
   e.preventDefault(); // Matikan double fire
   if(currentstate == states.GameScreen) playerJump();
   else if(currentstate == states.SplashScreen) startGame();
   else if(currentstate == states.ScoreScreen && replayclickable) $("#replay").click();
});

function playerJump() {
   velocity = jump;
   soundJump.stop().play();
}

function setBigScore() {
   var elemscore = $("#bigscore");
   elemscore.empty();
   
   /* --- PINDAH KE SANDI.HTML KALAU SKOR 10 --- */
   if(score >= 10) {
       setTimeout(function() {
           window.location.href = "sandi.html";
       }, 500);
   }
   /* ------------------------------------------ */

   var digits = score.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setSmallScore() {
   var elemscore = $("#currentscore");
   elemscore.empty();
   var digits = score.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setHighScore() {
   var elemscore = $("#highscore");
   elemscore.empty();
   var digits = highscore.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setMedal() {
   var elemmedal = $("#medal");
   elemmedal.empty();
   if(score < 10) return false;
   var medal = "bronze";
   if(score >= 20) medal = "silver";
   if(score >= 30) medal = "gold";
   if(score >= 40) medal = "platinum";
   elemmedal.append('<img src="assets/medal_' + medal +'.png" alt="' + medal +'">');
   return true;
}

function playerDead() {
   $(".animated").css('animation-play-state', 'paused');
   var playerbottom = $("#player").position().top + $("#player").width(); 
   var movey = Math.max(0, flyArea - playerbottom);
   $("#player").transition({ y: movey + 'px', rotate: 90}, 1000, 'easeInOutCubic');

   currentstate = states.ScoreScreen;
   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null; loopPipeloop = null;

   soundHit.stop().play().bindOnce("ended", function() {
      soundDie.stop().play().bindOnce("ended", function() {
         showScore();
      });
   });
}

function showScore() {
   $("#scoreboard").css("display", "block");
   $("#bigscore").empty();

   if(score > highscore) {
      highscore = score;
      setCookie("highscore", highscore, 999);
   }

   setSmallScore(); setHighScore();
   var wonmedal = setMedal();

   soundSwoosh.stop().play();
   $("#scoreboard").css({ y: '40px', opacity: 0 }); 
   $("#replay").css({ y: '40px', opacity: 0 });
   $("#scoreboard").transition({ y: '0px', opacity: 1}, 600, 'ease', function() {
      soundSwoosh.stop().play();
      $("#replay").transition({ y: '0px', opacity: 1}, 600, 'ease');
      if(wonmedal) {
         $("#medal").css({ scale: 2, opacity: 0 });
         $("#medal").transition({ opacity: 1, scale: 1 }, 1200, 'ease');
      }
   });
   replayclickable = true;
}

$("#replay").click(function(e) {
   e.preventDefault();
   if(!replayclickable) return;
   replayclickable = false;
   soundSwoosh.stop().play();
   $("#scoreboard").transition({ y: '-40px', opacity: 0}, 1000, 'ease', function() {
      $("#scoreboard").css("display", "none");
      showSplash();
   });
});

function playerScore() {
   score += 1;
   soundScore.stop().play();
   setBigScore();
}

function updatePipes() {
   $(".pipe").filter(function() { return $(this).position().left <= -100; }).remove();
   var padding = 80;
   var constraint = flyArea - pipeheight - (padding * 2); 
   var topheight = Math.floor((Math.random()*constraint) + padding); 
   var bottomheight = (flyArea - pipeheight) - topheight;
   var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px;"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div></div>');
   $("#flyarea").append(newpipe);
   pipes.push(newpipe);
}
