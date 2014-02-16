/*
 Copyright Lucas Walter February 2014
 
 This file is part of mathtest.

 Foobar is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Foobar is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 
 */

var stage;
var numpad;
var wd;
var ht;
var button_size;

function numClick(evt, data) {

  console.log("clicked on " + data.num);
}

function NumButton(x, y, num, parent_container) {
  var num = num;
 
  var button = new createjs.Shape();
  button.x = x;
  button.y = y;
  var pad = button_size / 20.0;
  button.graphics.beginFill("#eeeeee").drawRect(pad, pad, button_size - pad, button_size - pad);
  parent_container.addChild(button);
  //var listener = 
  button.on("click", numClick, null, false, {num:num});
  

  var msg = new createjs.Text("", "1px Courier", "#111");
  msg.scaleX = button_size / 16;
  msg.scaleY = button_size / 16;
  msg.text = num.toString(16);
  msg.textAlign = 'center';
  var bd = msg.getBounds();
  msg.x = x + pad + button_size/2;
  msg.y = y - bd.height/2;
  parent_container.addChild(msg);

}

function NumPad(base, parent_container) {
  var number_buttons = [];

  var base = base;

  container = new createjs.Container();
  parent_container.addChild(container);
  
  var buttons_per_column = Math.floor(ht / button_size);
  var x_start = wd - button_size * Math.ceil(base / buttons_per_column);

  for (var i = 0; i < base; i++) {
    var x = x_start + button_size * Math.floor(i / buttons_per_column);
    var y = (i % buttons_per_column) * button_size; 
    var num_button = NumButton(x, y, i, container);

  }
}

function init() {
  stage = new createjs.Stage("mathtest");

  wd = stage.canvas.width;
  ht = stage.canvas.height;

  var context = stage.canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;

  button_size = ht/5;
  numpad = NumPad(10, stage);

  stage.update();
}
