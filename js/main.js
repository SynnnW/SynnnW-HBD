/* ROMBAK TOTAL BY ALDO GANTENG 
   SUPPORT MOBILE, TABLET, & AUTO-REDIRECT TO SANDI.HTML
*/

var debugmode = false;
var states = Object.freeze({ SplashScreen: 0, GameScreen: 1, ScoreScreen: 2 });
var currentstate;
var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var flyArea = $(window).height(); // FIX: Biar deteksi tinggi layar HP asli
var score = 0;
var highscore = 0;
var pipeheight = 100;
var pipewidth = 52;
var pipes = new Array();
var replayclickable = false;

// Sounds
var volume = 30;
var soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

var loopGameloop;
var loopPipeloop;

$(document).ready(function() {
   if(window.location.search == "?debug") debugmode = true;
   var savedscore = getCookie("highscore");
   if(savedscore != "") highscore = parseInt(savedscore);
   showSplashScreen();
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

function showSplashScreen() {
   currentstate = states.SplashScreen;
   velocity = 0;
   position = 180;
   rotation = 0;
   score = 0;
   $("#player").css({ y: 0, x: 0, rotate: 0 });
   updatePlayer($("#player"));
   soundSwoosh.stop();
   soundSwoosh.play();
   $(".animated").css('animation-play-state', 'running');
   $(".animated").css('-webkit-animation-play-state', 'running');
   $("#splash").transition({ opacity: 1 }, 2000, 'ease');
}

function startGame() {
   currentstate = states.GameScreen;
   $("#splash").stop();
   $("#splash").transition({ opacity: 0 }, 500, 'ease');
   setscore(0);
   $("#bigscore").show();
   var updaterate = 1000.0 / 60.0;
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(addPipe, 1400);
   playerJump();
}

function gameloop() {
   var player = $("#player");
   velocity += gravity;
   position += velocity;
   updatePlayer(player);
   var box = document.getElementById('player').getBoundingClientRect();
   var origwidth = 34.0;
   var origheight = 24.0;
   var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxheight = (origheight + (Math.sin(Math.abs(rotation) / 90) * 8)) * 0.75;
   var boxleft = ((box.width - boxwidth) / 2) + box.left;
   var boxtop = ((box.height - boxheight) / 2) + box.top;
   var boxright = boxleft + boxwidth;
   var boxbottom = boxtop + boxheight;

   if(box.bottom >= $("#land").offset().top) { playerDead(); return; }
   var ceiling = $("#ceiling");
   if(boxtop <= (ceiling.offset().top + ceiling.height())) position = 0;
   if(pipes[0] == null) return;

   var nextpipe = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");
   var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
   var pipeleft = nextpipeupper.offset().left;
   var piperight = pipeleft + pipewidth;
   var pipebottom = pipetop + pipeheight;

   if(boxright > pipeleft) {
      if(boxtop > pipetop && boxbottom < pipebottom) {
         // Passed pipe
      } else { playerDead(); return; }
   }

   if(boxleft > piperight) {
      pipes.shift();
      addscore();
   }
}

function playerJump() {
   velocity = jump;
   soundJump.stop();
   soundJump.play();
}

function updatePlayer(player) {
   rotation = Math.min((velocity / 10) * 90, 90);
   $(player).css({ y: position, rotate: rotation });
}

function addscore() {
   score += 1;
   soundScore.stop();
   soundScore.play();
   setscore(score);
}

function setscore(newscore) {
   score = newscore;
   
   /* --- LOGIKA PINDAH KE SANDI.HTML --- */
   if(score >= 10) {
      setTimeout(function() {
         window.location.href = "sandi.html";
      }, 500);
   }
   /* ---------------------------------- */

   $("#bigscore").empty();
   var digits = score.toString().split("");
   for(var i = 0; i < digits.length; i++)
      $("#bigscore").append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function playerDead() {
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');
   var player = $("#player");
   player.stop();
   player.transition({ y: flyArea - 25 }, 1000, 'easeInOutExpo');
   soundHit.play();
   soundDie.delay(500).play();
   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;
   showScore();
}

function showScore() {
   currentstate = states.ScoreScreen;
   $("#bigscore").fadeOut(500);
   if(score > highscore) {
      highscore = score;
      setCookie("highscore", highscore, 999);
   }
   $("#currentscore").empty();
   var digits = score.toString().split("");
   for(var i = 0; i < digits.length; i++)
      $("#currentscore").append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");

   $("#highscore").empty();
   var hdigits = highscore.toString().split("");
   for(var i = 0; i < hdigits.length; i++)
      $("#highscore").append("<img src='assets/font_small_" + hdigits[i] + ".png' alt='" + hdigits[i] + "'>");

   $("#scoreboard").delay(1000).fadeIn(500);
   $("#replay").delay(2000).fadeIn(500);
   replayclickable = true;
}

$(document).mousedown(screenClick);
$(document).bind('touchstart', screenClick);

function screenClick() {
   if(currentstate == states.GameScreen) playerJump();
   else if(currentstate == states.SplashScreen) startGame();
   else if(currentstate == states.ScoreScreen && replayclickable) {
      replayclickable = false;
      $("#scoreboard").fadeOut(500);
      $("#replay").fadeOut(500);
      pipes = new Array();
      $(".pipe").remove();
      showSplashScreen();
   }
}

function addPipe() {
   var padding = 80;
   var constraint = flyArea - pipeheight - (padding * 2);
   var topheight = Math.floor((Math.random() * constraint) + padding);
   var bottomheight = (flyArea - pipeheight) - topheight;
   var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px;"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div></div>');
   $("#flyarea").append(newpipe);
   pipes.push(newpipe);
}
